import OpenAI from 'openai';
import { ITicket } from '../db/models/Ticket';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
type ChatMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

/**
 * Generate a response from the chatbot
 */
export async function generateChatResponse(messages: ChatMessage[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}

/**
 * Generate a summary and title from a conversation
 */
export async function generateTicketSummary(conversation: ChatMessage[]) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an AI assistant that summarizes support conversations into concise ticket descriptions. Generate a short title and a detailed description based on the conversation.',
      },
      ...conversation,
      {
        role: 'user' as const,
        content:
          'Based on this conversation, generate a JSON object with a "title" (max 10 words) and "description" (max 150 words) for a support ticket.',
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      title: result.title || 'New Support Ticket',
      description: result.description || 'No description provided',
    };
  } catch (error) {
    console.error('Error generating ticket summary:', error);
    return {
      title: 'New Support Ticket',
      description: 'An error occurred while generating the ticket summary.',
    };
  }
}

/**
 * Generate topic and cluster for a ticket
 */
export async function clusterTicket(ticket: ITicket) {
  try {
    const prompt = `
Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}

Based on the above ticket information, identify:
1. The main technical topic (e.g., "API Integration", "Authentication", "UI/UX", "Performance")
2. A concise cluster name that this ticket belongs to (e.g., "Frontend Bugs", "Backend Issues", "User Experience", "Security")

Return your response as a JSON object with "topic" and "cluster" keys.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that analyzes support tickets and categorizes them correctly.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      topic: result.topic || 'Uncategorized',
      cluster: result.cluster || 'General',
    };
  } catch (error) {
    console.error('Error clustering ticket:', error);
    return {
      topic: 'Uncategorized',
      cluster: 'General',
    };
  }
} 