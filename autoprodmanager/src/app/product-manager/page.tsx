'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: 'new' | 'in-review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  topic?: string;
  topicCluster?: string;
  createdAt: string;
  updatedAt: string;
};

type ClusterData = {
  name: string;
  ticketCount: number;
  tickets: Ticket[];
};

export default function ProductManagerPage() {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      const tickets: Ticket[] = data.tickets;
      
      // Group tickets by cluster
      const clusterMap = new Map<string, Ticket[]>();
      
      tickets.forEach(ticket => {
        const clusterName = ticket.topicCluster || 'Uncategorized';
        if (!clusterMap.has(clusterName)) {
          clusterMap.set(clusterName, []);
        }
        clusterMap.get(clusterName)!.push(ticket);
      });
      
      // Convert map to array
      const clusterArray: ClusterData[] = [];
      clusterMap.forEach((tickets, name) => {
        clusterArray.push({
          name,
          ticketCount: tickets.length,
          tickets,
        });
      });
      
      // Sort clusters by ticket count
      clusterArray.sort((a, b) => b.ticketCount - a.ticketCount);
      
      setClusters(clusterArray);
      
      // Select the first cluster if it exists
      if (clusterArray.length > 0) {
        setSelectedCluster(clusterArray[0].name);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const handleClusterSelect = (clusterName: string) => {
    setSelectedCluster(clusterName);
    setSelectedTickets([]);
  };

  const handleApproveTickets = async () => {
    if (selectedTickets.length === 0) return;
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedTickets,
          status: 'approved',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tickets');
      }
      
      // Refresh ticket data
      fetchTickets();
      setSelectedTickets([]);
    } catch (error) {
      console.error('Error approving tickets:', error);
    }
  };

  const handleRejectTickets = async () => {
    if (selectedTickets.length === 0) return;
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedTickets,
          status: 'rejected',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tickets');
      }
      
      // Refresh ticket data
      fetchTickets();
      setSelectedTickets([]);
    } catch (error) {
      console.error('Error rejecting tickets:', error);
    }
  };

  const getSelectedClusterTickets = () => {
    if (!selectedCluster) return [];
    const cluster = clusters.find(c => c.name === selectedCluster);
    return cluster ? cluster.tickets : [];
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusClass = () => {
      switch (status) {
        case 'new':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'in-review':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'approved':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'rejected':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'completed':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="apple-heading mb-8 text-center text-3xl">Product Manager Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : clusters.length === 0 ? (
        <div className="apple-card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No tickets found in the system.</p>
          <Link href="/support" className="apple-btn inline-block">
            Create New Ticket
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card p-4 md:col-span-1 h-min">
            <h2 className="apple-subheading mb-4">Topic Clusters</h2>
            <ul className="space-y-2">
              {clusters.map(cluster => (
                <li key={cluster.name}>
                  <button
                    onClick={() => handleClusterSelect(cluster.name)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCluster === cluster.name
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-zinc-800 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{cluster.name}</span>
                      <span className="bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        {cluster.ticketCount}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <div className="apple-card overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 flex justify-between items-center">
                <h2 className="apple-subheading">
                  {selectedCluster ? `${selectedCluster} Tickets` : 'Tickets'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleApproveTickets}
                    disabled={selectedTickets.length === 0}
                    className={`apple-btn bg-green-500 hover:bg-green-600 px-3 py-1 text-sm ${
                      selectedTickets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleRejectTickets}
                    disabled={selectedTickets.length === 0}
                    className={`apple-btn bg-red-500 hover:bg-red-600 px-3 py-1 text-sm ${
                      selectedTickets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                {getSelectedClusterTickets().length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No tickets in this cluster
                  </div>
                ) : (
                  getSelectedClusterTickets().map(ticket => (
                    <div
                      key={ticket._id}
                      className={`p-4 transition-colors ${
                        selectedTickets.includes(ticket._id)
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket._id)}
                          onChange={() => handleTicketSelect(ticket._id)}
                          className="mt-1 h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              <Link href={`/product-manager/${ticket._id}`}>
                                {ticket.title}
                              </Link>
                            </h3>
                            <StatusBadge status={ticket.status} />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Topic: {ticket.topic || 'Uncategorized'}</span>
                            <span>
                              Created: {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 