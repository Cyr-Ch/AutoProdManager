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
  targetSystem?: 'jira' | 'azure-devops' | 'github' | null;
  externalId?: string;
  externalUrl?: string;
};

export default function DeveloperPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [targetSystem, setTargetSystem] = useState<'jira' | 'azure-devops' | 'github'>('jira');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResults, setExportResults] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovedTickets();
  }, []);

  const fetchApprovedTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets?status=approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets);
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

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(ticket => ticket._id));
    }
  };

  const handleExportTickets = async () => {
    if (selectedTickets.length === 0) return;
    
    try {
      setIsExporting(true);
      
      const response = await fetch('/api/integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketIds: selectedTickets,
          targetSystem,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export tickets');
      }
      
      const data = await response.json();
      setExportResults(data.results);
      
      // Refresh ticket data
      fetchApprovedTickets();
      setSelectedTickets([]);
    } catch (error) {
      console.error('Error exporting tickets:', error);
    } finally {
      setIsExporting(false);
    }
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

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const getPriorityClass = () => {
      switch (priority) {
        case 'low':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        case 'medium':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'high':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case 'critical':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass()}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="apple-heading mb-8 text-center text-3xl">Developer Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="apple-card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No approved tickets found in the system.</p>
          <Link href="/" className="apple-btn inline-block">
            Return Home
          </Link>
        </div>
      ) : (
        <>
          <div className="apple-card mb-6 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="apple-subheading">Export Approved Tickets</h2>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <select
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value as any)}
                className="apple-input max-w-xs"
              >
                <option value="jira">Jira</option>
                <option value="azure-devops">Azure DevOps</option>
                <option value="github">GitHub</option>
              </select>
              
              <button
                onClick={handleExportTickets}
                disabled={selectedTickets.length === 0 || isExporting}
                className={`apple-btn flex-shrink-0 ${
                  selectedTickets.length === 0 || isExporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isExporting ? 'Exporting...' : `Export to ${targetSystem}`}
              </button>
            </div>
          </div>
          
          {exportResults.length > 0 && (
            <div className="apple-card mb-6 p-4">
              <h2 className="apple-subheading mb-3">Export Results</h2>
              <div className="space-y-2">
                {exportResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      result.success
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>
                        {result.success 
                          ? `Successfully exported ticket ${result.ticketId} to ${targetSystem}`
                          : `Failed to export ticket ${result.ticketId}: ${result.error}`
                        }
                      </span>
                      {result.success && result.externalUrl && (
                        <a
                          href={result.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          View {result.externalId}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="apple-card overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 flex justify-between items-center">
              <h2 className="apple-subheading">Approved Tickets</h2>
              <button
                onClick={handleSelectAll}
                className="text-blue-500 text-sm font-medium hover:underline"
              >
                {selectedTickets.length === tickets.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTickets.length === tickets.length && tickets.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Topic</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Priority</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket._id}
                      className={`transition-colors ${
                        selectedTickets.includes(ticket._id)
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket._id)}
                          onChange={() => handleTicketSelect(ticket._id)}
                          className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <Link 
                          href={`/developer/${ticket._id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400"
                        >
                          {ticket.title}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                          {ticket.description}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {ticket.topic || 'Uncategorized'}
                      </td>
                      <td className="p-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={ticket.status} />
                        {ticket.externalId && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <a 
                              href={ticket.externalUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {ticket.externalId}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 