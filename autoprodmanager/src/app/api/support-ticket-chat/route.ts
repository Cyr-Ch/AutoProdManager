import { NextRequest, NextResponse } from 'next/server';
import { createTicketBot, createServices, TicketInput } from '@/lib/support-ticket-chat';

// Session store to maintain conversation state
const sessionStore = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, action, data } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Get or create session state
    if (!sessionStore.has(session_id) && action !== 'start') {
      return NextResponse.json(
        { error: 'Session not found. Please start a new session.' },
        { status: 404 }
      );
    }

    // Get or create bot instance
    let bot = sessionStore.get(session_id);
    if (!bot && action === 'start') {
      bot = createTicketBot();
      sessionStore.set(session_id, bot);
    }

    let result;

    // Process based on action
    if (action === 'start') {
      if (!data || !data.problem_statement) {
        return NextResponse.json(
          { error: 'Missing problem_statement in data' },
          { status: 400 }
        );
      }

      const input: TicketInput = {
        problem_statement: data.problem_statement
      };
      
      result = await bot.processTicket(input);
    } else if (action === 'respond') {
      if (!data || data.response === undefined) {
        return NextResponse.json(
          { error: 'Missing response in data' },
          { status: 400 }
        );
      }

      result = await bot.processResponse(data.response);
    } else if (action === 'confirm') {
      if (!data || data.confirmed === undefined) {
        return NextResponse.json(
          { error: 'Missing confirmed in data' },
          { status: 400 }
        );
      }

      result = await bot.processConfirmation(data.confirmed);

      // If ticket is finalized and confirmed, attempt to send to external services if configured
      if (result.next_step === 'finished' && result.ticket && data.confirmed) {
        try {
          // Example of sending to Jira and Slack if configured
          // This would use environment variables in a real application
          const useExternalServices = process.env.USE_EXTERNAL_SERVICES === 'true';
          
          if (useExternalServices) {
            const services = createServices({
              jira: process.env.JIRA_API_URL ? {
                apiUrl: process.env.JIRA_API_URL,
                email: process.env.JIRA_EMAIL || '',
                apiToken: process.env.JIRA_API_TOKEN || '',
                projectKey: process.env.JIRA_PROJECT_KEY || ''
              } : undefined,
              slack: process.env.SLACK_WEBHOOK_URL ? {
                webhookUrl: process.env.SLACK_WEBHOOK_URL
              } : undefined
            });

            // Send to Jira if configured
            let ticketUrl;
            if (services.jira) {
              const jiraResult = await services.jira.createTicket(result.ticket);
              ticketUrl = jiraResult.url;
            }

            // Send notification to Slack if configured
            if (services.slack) {
              await services.slack.sendTicketNotification(result.ticket, ticketUrl);
            }
          }
        } catch (serviceError) {
          console.error('Error sending to external services:', serviceError);
          // Continue with the response even if service integration fails
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: start, respond, confirm' },
        { status: 400 }
      );
    }

    // Clean up session if we're done
    if (result.next_step === 'finished') {
      // Keep session for a short while before cleanup
      setTimeout(() => {
        sessionStore.delete(session_id);
      }, 30 * 60 * 1000); // 30 minutes
    }

    return NextResponse.json({
      session_id,
      next_step: result.next_step,
      data: {
        question: result.question,
        summary: result.summary,
        ticket: result.ticket
      }
    });
  } catch (error) {
    console.error('Error processing support ticket chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 