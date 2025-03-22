'use client';

import SupportTicketChat from '@/components/SupportTicketChat';
import Link from 'next/link';

export default function TicketChatPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/support" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Support Dashboard
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Ticket Creation</h1>
        <p className="text-gray-600">
          Use our AI assistant to quickly create well-structured support tickets.
          The assistant will guide you through the process, ensuring all necessary information is collected.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <SupportTicketChat />
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h2 className="text-lg font-semibold mb-2">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Describe the issue you're experiencing</li>
          <li>Answer follow-up questions about severity, reproducibility, evidence, and affected components</li>
          <li>Review and confirm the generated ticket summary</li>
          <li>The ticket will be automatically formatted and sent to the product management team</li>
        </ol>
      </div>
    </div>
  );
} 