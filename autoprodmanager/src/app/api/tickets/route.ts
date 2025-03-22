import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Ticket, ITicket } from '@/lib/db/models/Ticket';
import { generateTicketSummary, clusterTicket } from '@/lib/utils/openai';

// GET /api/tickets - Get all tickets
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const cluster = searchParams.get('cluster');
    const status = searchParams.get('status');
    
    // Build query
    const query: any = {};
    if (cluster) query.topicCluster = cluster;
    if (status) query.status = status;
    
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { conversation, createdBy } = body;
    
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation is required' },
        { status: 400 }
      );
    }
    
    // Generate title and description from conversation
    const { title, description } = await generateTicketSummary(conversation);
    
    // Create new ticket
    const newTicket = new Ticket({
      title,
      description,
      createdBy,
      conversation,
      status: 'new',
    });
    
    // Generate topic and cluster
    const { topic, cluster } = await clusterTicket(newTicket);
    
    newTicket.topic = topic;
    newTicket.topicCluster = cluster;
    
    await newTicket.save();
    
    return NextResponse.json({ ticket: newTicket }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/tickets - Update ticket status (batch update)
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { ids, status, targetSystem } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Ticket IDs are required' },
        { status: 400 }
      );
    }
    
    const updateData: Partial<ITicket> = {};
    if (status) updateData.status = status;
    if (targetSystem) updateData.targetSystem = targetSystem;
    
    const result = await Ticket.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );
    
    return NextResponse.json(
      { message: 'Tickets updated successfully', count: result.modifiedCount },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 