import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Ticket, ITicket } from '@/lib/db/models/Ticket';
import { generateChatResponse } from '@/lib/utils/openai';

// POST /api/tickets/[id]/conversation - Add a message to the conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { message, role = 'user' } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const ticket = await Ticket.findById(params.id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Add the new message to the conversation
    const newMessage = {
      role,
      content: message,
      timestamp: new Date(),
    };
    
    ticket.conversation.push(newMessage);
    
    // If this is from a user, generate a chatbot response
    let aiResponse = null;
    if (role === 'user') {
      const messages = ticket.conversation.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'system' | 'assistant',
        content: msg.content,
      }));
      
      try {
        const response = await generateChatResponse([
          {
            role: 'system',
            content: 'You are a helpful support assistant. You help users clarify their issues and gather more information for the support team.',
          },
          ...messages,
        ]);
        
        aiResponse = {
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
        };
        
        ticket.conversation.push(aiResponse);
      } catch (error) {
        console.error('Error generating AI response:', error);
      }
    }
    
    await ticket.save();
    
    return NextResponse.json(
      { 
        message: newMessage, 
        aiResponse,
        ticket 
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 