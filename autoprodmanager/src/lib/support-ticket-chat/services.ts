import axios from 'axios';
import { TicketOutput } from './types';

// Abstract class for ticket service integrations
abstract class TicketService {
  abstract createTicket(ticket: TicketOutput): Promise<{ id: string, url: string }>;
  abstract updateTicket(id: string, updates: Partial<TicketOutput>): Promise<{ id: string, url: string }>;
}

// Jira API integration
export class JiraService extends TicketService {
  private apiUrl: string;
  private apiToken: string;
  private projectKey: string;
  private email: string;

  constructor(apiUrl: string, email: string, apiToken: string, projectKey: string) {
    super();
    this.apiUrl = apiUrl;
    this.email = email;
    this.apiToken = apiToken;
    this.projectKey = projectKey;
  }

  async createTicket(ticket: TicketOutput): Promise<{ id: string, url: string }> {
    try {
      // Map severity to Jira priority
      const priorityMap: Record<string, string> = {
        'critical': 'Highest',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };

      // Create Jira issue
      const response = await axios.post(
        `${this.apiUrl}/rest/api/2/issue`,
        {
          fields: {
            project: {
              key: this.projectKey
            },
            summary: ticket.title,
            description: ticket.description,
            issuetype: {
              name: 'Bug'
            },
            priority: {
              name: priorityMap[ticket.severity] || 'Medium'
            },
            // Add custom fields for additional information
            customfield_10001: ticket.reproducibility, // Example custom field for reproducibility
            components: ticket.affected_components.map(comp => ({ name: comp }))
          }
        },
        {
          auth: {
            username: this.email,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.key,
        url: `${this.apiUrl}/browse/${response.data.key}`
      };
    } catch (error) {
      console.error('Error creating Jira ticket:', error);
      throw new Error('Failed to create Jira ticket');
    }
  }

  async updateTicket(id: string, updates: Partial<TicketOutput>): Promise<{ id: string, url: string }> {
    try {
      const updateFields: Record<string, any> = {};
      
      if (updates.title) updateFields.summary = updates.title;
      if (updates.description) updateFields.description = updates.description;
      if (updates.severity) {
        const priorityMap: Record<string, string> = {
          'critical': 'Highest',
          'high': 'High',
          'medium': 'Medium',
          'low': 'Low'
        };
        updateFields.priority = { name: priorityMap[updates.severity] || 'Medium' };
      }
      
      await axios.put(
        `${this.apiUrl}/rest/api/2/issue/${id}`,
        {
          fields: updateFields
        },
        {
          auth: {
            username: this.email,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id,
        url: `${this.apiUrl}/browse/${id}`
      };
    } catch (error) {
      console.error('Error updating Jira ticket:', error);
      throw new Error('Failed to update Jira ticket');
    }
  }
}

// Linear API integration
export class LinearService extends TicketService {
  private apiKey: string;
  private teamId: string;

  constructor(apiKey: string, teamId: string) {
    super();
    this.apiKey = apiKey;
    this.teamId = teamId;
  }

  async createTicket(ticket: TicketOutput): Promise<{ id: string, url: string }> {
    try {
      // Map severity to Linear priority
      const priorityMap: Record<string, number> = {
        'critical': 1, // Urgent
        'high': 2, // High
        'medium': 3, // Medium
        'low': 4 // Low
      };

      const response = await axios.post(
        'https://api.linear.app/graphql',
        {
          query: `
            mutation CreateIssue($input: IssueCreateInput!) {
              issueCreate(input: $input) {
                success
                issue {
                  id
                  identifier
                  url
                }
              }
            }
          `,
          variables: {
            input: {
              title: ticket.title,
              description: ticket.description,
              teamId: this.teamId,
              priority: priorityMap[ticket.severity] || 3,
              labelIds: ticket.affected_components.map(comp => comp) // Assuming component names match label IDs
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.apiKey
          }
        }
      );

      const result = response.data.data.issueCreate;
      
      if (!result.success) {
        throw new Error('Failed to create Linear ticket');
      }

      return {
        id: result.issue.identifier,
        url: result.issue.url
      };
    } catch (error) {
      console.error('Error creating Linear ticket:', error);
      throw new Error('Failed to create Linear ticket');
    }
  }

  async updateTicket(id: string, updates: Partial<TicketOutput>): Promise<{ id: string, url: string }> {
    try {
      const updateVars: Record<string, any> = {
        id
      };
      
      if (updates.title) updateVars.title = updates.title;
      if (updates.description) updateVars.description = updates.description;
      if (updates.severity) {
        const priorityMap: Record<string, number> = {
          'critical': 1,
          'high': 2,
          'medium': 3,
          'low': 4
        };
        updateVars.priority = priorityMap[updates.severity] || 3;
      }
      
      const response = await axios.post(
        'https://api.linear.app/graphql',
        {
          query: `
            mutation UpdateIssue($input: IssueUpdateInput!) {
              issueUpdate(input: $input) {
                success
                issue {
                  id
                  identifier
                  url
                }
              }
            }
          `,
          variables: {
            input: updateVars
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.apiKey
          }
        }
      );

      const result = response.data.data.issueUpdate;
      
      if (!result.success) {
        throw new Error('Failed to update Linear ticket');
      }

      return {
        id: result.issue.identifier,
        url: result.issue.url
      };
    } catch (error) {
      console.error('Error updating Linear ticket:', error);
      throw new Error('Failed to update Linear ticket');
    }
  }
}

// Slack webhook integration
export class SlackService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendTicketNotification(ticket: TicketOutput, ticketUrl?: string): Promise<void> {
    try {
      // Create Slack message
      const message = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `New Ticket: ${ticket.title}`,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*ID:* ${ticket.id}`
              },
              {
                type: 'mrkdwn',
                text: `*Severity:* ${ticket.severity}`
              },
              {
                type: 'mrkdwn',
                text: `*Created:* ${new Date(ticket.created_at).toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*Status:* ${ticket.status}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Description:*\n${ticket.description.substring(0, 300)}${ticket.description.length > 300 ? '...' : ''}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Affected Components:* ${ticket.affected_components.join(', ')}`
            }
          }
        ]
      };

      // Add ticket URL if available
      if (ticketUrl) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${ticketUrl}|View Ticket in Tracker>`
          }
        });
      }

      // Send to Slack
      await axios.post(this.webhookUrl, message, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      throw new Error('Failed to send Slack notification');
    }
  }
} 