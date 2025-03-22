import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Ticket document
export interface ITicket extends Document {
  title: string;
  description: string;
  status: 'new' | 'in-review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  assignedTo?: string;
  topic?: string;
  topicCluster?: string;
  conversation: Array<{
    role: 'user' | 'system' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  targetSystem?: 'jira' | 'azure-devops' | 'github' | null;
  externalId?: string;
  externalUrl?: string;
}

// Define the schema
const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: ['new', 'in-review', 'approved', 'rejected', 'completed'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    createdBy: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
    },
    topic: {
      type: String,
    },
    topicCluster: {
      type: String,
    },
    conversation: [
      {
        role: {
          type: String,
          enum: ['user', 'system', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    targetSystem: {
      type: String,
      enum: ['jira', 'azure-devops', 'github', null],
      default: null,
    },
    externalId: {
      type: String,
    },
    externalUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
export const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', ticketSchema); 