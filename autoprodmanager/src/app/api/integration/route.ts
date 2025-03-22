import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Ticket } from '@/lib/db/models/Ticket';
import axios from 'axios';

// POST /api/integration - Send tickets to external systems
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { ticketIds, targetSystem } = await req.json();
    
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json(
        { error: 'Ticket IDs are required' },
        { status: 400 }
      );
    }
    
    if (!targetSystem || !['jira', 'azure-devops', 'github'].includes(targetSystem)) {
      return NextResponse.json(
        { error: 'Valid target system is required' },
        { status: 400 }
      );
    }
    
    // Get tickets
    const tickets = await Ticket.find({ _id: { $in: ticketIds } });
    
    if (tickets.length === 0) {
      return NextResponse.json(
        { error: 'No valid tickets found' },
        { status: 404 }
      );
    }
    
    // Results array to track success/failure
    const results = [];
    
    for (const ticket of tickets) {
      try {
        let externalId = '';
        let externalUrl = '';
        
        // Create external ticket based on the target system
        switch (targetSystem) {
          case 'jira':
            const jiraResult = await createJiraTicket(ticket);
            externalId = jiraResult.id;
            externalUrl = jiraResult.url;
            break;
            
          case 'azure-devops':
            const azureResult = await createAzureDevOpsTicket(ticket);
            externalId = azureResult.id;
            externalUrl = azureResult.url;
            break;
            
          case 'github':
            const githubResult = await createGithubIssue(ticket);
            externalId = githubResult.id;
            externalUrl = githubResult.url;
            break;
        }
        
        // Update the ticket with external references
        ticket.targetSystem = targetSystem;
        ticket.externalId = externalId;
        ticket.externalUrl = externalUrl;
        ticket.status = 'completed';
        await ticket.save();
        
        results.push({
          ticketId: ticket._id,
          success: true,
          externalId,
          externalUrl
        });
      } catch (error: any) {
        console.error(`Error creating external ticket for ${ticket._id}:`, error);
        results.push({
          ticketId: ticket._id,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({ results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to create Jira ticket
async function createJiraTicket(ticket: any) {
  // This is a placeholder - replace with actual Jira API integration
  const jiraApiKey = process.env.JIRA_API_KEY;
  const jiraUrl = process.env.JIRA_URL;
  
  if (!jiraApiKey || !jiraUrl) {
    throw new Error('Jira configuration not found');
  }
  
  // Simulate API call
  // In a real implementation, use the Jira REST API
  /*
  const response = await axios.post(
    `${jiraUrl}/rest/api/2/issue`,
    {
      fields: {
        project: { key: 'PROJ' },
        summary: ticket.title,
        description: ticket.description,
        issuetype: { name: 'Bug' }
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${jiraApiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  */
  
  // Mock response
  return {
    id: `JIRA-${Math.floor(Math.random() * 10000)}`,
    url: `${jiraUrl}/browse/PROJ-${Math.floor(Math.random() * 10000)}`
  };
}

// Helper function to create Azure DevOps work item
async function createAzureDevOpsTicket(ticket: any) {
  // This is a placeholder - replace with actual Azure DevOps API integration
  const azurePat = process.env.AZURE_DEVOPS_PAT;
  const azureOrg = process.env.AZURE_DEVOPS_ORG;
  
  if (!azurePat || !azureOrg) {
    throw new Error('Azure DevOps configuration not found');
  }
  
  // Simulate API call
  // In a real implementation, use the Azure DevOps REST API
  /*
  const response = await axios.post(
    `https://dev.azure.com/${azureOrg}/project/_apis/wit/workitems/$Bug?api-version=6.0`,
    [
      { op: 'add', path: '/fields/System.Title', value: ticket.title },
      { op: 'add', path: '/fields/System.Description', value: ticket.description }
    ],
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${azurePat}`).toString('base64')}`,
        'Content-Type': 'application/json-patch+json'
      }
    }
  );
  */
  
  // Mock response
  return {
    id: `${Math.floor(Math.random() * 10000)}`,
    url: `https://dev.azure.com/${azureOrg}/project/_workitems/edit/${Math.floor(Math.random() * 10000)}`
  };
}

// Helper function to create GitHub issue
async function createGithubIssue(ticket: any) {
  // This is a placeholder - replace with actual GitHub API integration
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    throw new Error('GitHub configuration not found');
  }
  
  // Simulate API call
  // In a real implementation, use the GitHub REST API
  /*
  const response = await axios.post(
    'https://api.github.com/repos/owner/repo/issues',
    {
      title: ticket.title,
      body: ticket.description,
      labels: [ticket.topic]
    },
    {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );
  */
  
  // Mock response
  return {
    id: `${Math.floor(Math.random() * 10000)}`,
    url: `https://github.com/owner/repo/issues/${Math.floor(Math.random() * 10000)}`
  };
} 