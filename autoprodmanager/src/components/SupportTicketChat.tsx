import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

// Types for component state
interface ChatState {
  sessionId: string | null;
  nextStep: 'initial' | 'ask_question' | 'confirm_ticket' | 'finished';
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  isLoading: boolean;
  error: string | null;
  currentQuestion: {
    question: string;
    field: string;
  } | null;
  ticketSummary: any | null;
  finalTicket: any | null;
}

const SupportTicketChat = () => {
  const [state, setState] = useState<ChatState>({
    sessionId: null,
    nextStep: 'initial',
    messages: [
      {
        role: 'system',
        content: 'Welcome to the Support Ticket Assistant. Please describe the issue you\'re experiencing.'
      }
    ],
    isLoading: false,
    error: null,
    currentQuestion: null,
    ticketSummary: null,
    finalTicket: null
  });

  const [input, setInput] = useState('');

  // Generate a session ID when the component mounts
  useEffect(() => {
    if (!state.sessionId) {
      const newSessionId = `session_${Date.now()}`;
      setState(prev => ({ ...prev, sessionId: newSessionId }));
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || state.isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    try {
      let action: string = 'start'; // Initialize with a default value
      let data: any = {};
      
      // Determine action based on current state
      if (state.nextStep === 'initial') {
        action = 'start';
        data = { problem_statement: input };
      } else if (state.nextStep === 'ask_question') {
        action = 'respond';
        data = { response: input };
      } else if (state.nextStep === 'confirm_ticket') {
        action = 'confirm';
        // Interpret yes/no from user input
        const isConfirmed = input.toLowerCase().includes('yes') || 
                           input.toLowerCase().includes('confirm') || 
                           input.toLowerCase().includes('approve');
        data = { confirmed: isConfirmed };
      }
      
      // Call API
      const response = await axios.post('/api/support-ticket-chat', {
        session_id: state.sessionId,
        action,
        data
      });
      
      const result = response.data;
      
      // Determine assistant message based on response
      let assistantMessage = '';
      if (result.next_step === 'ask_question' && result.data.question) {
        assistantMessage = result.data.question.question;
      } else if (result.next_step === 'confirm_ticket' && result.data.summary) {
        assistantMessage = `I've created a draft of your support ticket. Please review:\n\n${result.data.summary.summary}\n\nDoes this look correct? (Yes/No)`;
      } else if (result.next_step === 'finished' && result.data.ticket) {
        assistantMessage = `Your ticket has been created with ID: ${result.data.ticket.id}. It will be sent to the product management team for review.`;
      }
      
      // Update state with response
      setState(prev => ({
        ...prev,
        nextStep: result.next_step,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: assistantMessage }
        ],
        isLoading: false,
        currentQuestion: result.data.question || null,
        ticketSummary: result.data.summary || null,
        finalTicket: result.data.ticket || null
      }));
      
      // Clear input field
      setInput('');
      
    } catch (error) {
      console.error('Error interacting with support ticket chat:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error processing your request. Please try again.'
      }));
    }
  };
  
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto border rounded-lg shadow-md">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Support Ticket Assistant</h2>
        <p className="text-sm">I'll help you create a well-formatted support ticket</p>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-[400px] space-y-4">
        {state.messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : message.role === 'system'
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {state.error && (
        <div className="bg-red-100 text-red-700 p-3 border-t border-red-200">
          {state.error}
        </div>
      )}
      
      {/* Input area */}
      <div className="border-t p-4 bg-white rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={state.nextStep === 'initial' 
              ? "Describe the issue you're experiencing..." 
              : state.nextStep === 'ask_question'
                ? "Answer the question..."
                : state.nextStep === 'confirm_ticket'
                  ? "Yes or No"
                  : "Conversation complete"}
            disabled={state.isLoading || state.nextStep === 'finished'}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300"
            disabled={state.isLoading || !input.trim() || state.nextStep === 'finished'}
          >
            Send
          </button>
        </form>
        
        {state.nextStep === 'finished' && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
            Ticket creation completed. You can start a new conversation by refreshing the page.
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketChat; 