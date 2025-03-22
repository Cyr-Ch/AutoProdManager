'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Message = {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp?: Date;
};

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Welcome to the AutoProdManager support chatbot. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // If it's the first user message, simulate a direct response from the chatbot
      if (messages.length === 1) {
        setTimeout(() => {
          const botResponse: Message = {
            role: 'assistant',
            content: 'I\'ll help you create a support ticket. Could you please describe the issue you\'re experiencing in detail?',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botResponse]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // If we have enough context, create a ticket
      if (messages.length >= 4) {
        // Submit to create a ticket
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation: [...messages, userMessage],
            createdBy: 'support-agent',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create ticket');
        }

        const data = await response.json();
        setTicketCreated(true);

        // Add success message
        const successMessage: Message = {
          role: 'system',
          content: `Ticket created successfully! Ticket #${data.ticket._id} has been created and will be reviewed by the product team.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        // Continue the conversation
        const botResponse: Message = {
          role: 'assistant',
          content: 'Thank you for the information. Could you provide any additional details about the context or when this issue occurs?',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'system',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewTicket = () => {
    setMessages([
      {
        role: 'system',
        content: 'Welcome to the AutoProdManager support chatbot. How can I help you today?',
      },
    ]);
    setTicketCreated(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="apple-heading mb-8 text-center text-3xl">Support Team Dashboard</h1>
      
      <div className="mb-6 flex justify-center">
        <Link href="/support/ticket-chat" className="apple-btn flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Try Our New AI-Powered Ticket Creator
        </Link>
      </div>
      
      <div className="apple-card overflow-hidden flex flex-col h-[70vh]">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
          <h2 className="apple-subheading">Ticket Issuer Chatbot</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use this chat to create support tickets with AI assistance
          </p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.role === 'system'
                    ? 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700'
                }`}
              >
                <p>{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-2xl p-4 max-w-[80%] border border-gray-200 dark:border-zinc-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          {ticketCreated ? (
            <div className="flex justify-center">
              <button
                onClick={createNewTicket}
                className="apple-btn"
              >
                Create New Ticket
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <textarea
                className="apple-input resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className={`apple-btn flex-shrink-0 flex items-center justify-center ${
                  !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 