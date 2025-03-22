# Support Ticket Chat System

This is a LangGraph-inspired implementation of an AI-powered system for generating well-structured support tickets. The system follows a multi-step process to ensure all necessary information is collected, organized, and presented in a standardized format.

## Architecture

The system is built with a state machine architecture that processes support tickets through the following states:

1. **Receive Input**: The system starts by receiving a problem statement from the support team.
2. **Check Missing Info**: It analyzes the input to identify any missing critical information.
3. **Ask Questions**: If information is missing, it asks targeted follow-up questions.
4. **Collect Responses**: It processes user responses and updates the ticket information.
5. **Summarize Ticket**: Once all information is gathered, it presents a summary for confirmation.
6. **Output Ticket**: Upon confirmation, it formats and sends the ticket to the appropriate queue.

## Node Functions

The system is composed of the following node functions:

- `receive_input`: Initializes the state with the problem statement and identifies missing information.
- `check_missing_info`: Determines if any crucial information is missing from the ticket.
- `ask_followup_question`: Generates appropriate questions for missing information.
- `collect_response`: Processes user responses and updates the ticket state.
- `summarize_ticket`: Produces a human-readable summary of the collected information.
- `output_ticket`: Formats and outputs the final ticket data.

## State Schema

The ticket state tracks the following information:

- Problem statement
- Severity level (critical, high, medium, low)
- Reproducibility details
- Evidence (screenshots, logs, videos)
- Affected components
- Missing information flags
- Current question being asked
- User responses
- Ticket summary
- Confirmation status
- Final ticket data

## External Integrations

The system supports integration with:

- **Jira API**: For creating and updating tickets in Jira.
- **Linear API**: For creating and updating tickets in Linear.
- **Slack Webhook**: For sending notifications about new tickets to PM channels.

## Usage

To use this system in your application:

```typescript
import { createTicketBot, createServices } from '@/lib/support-ticket-chat';

// Create a new ticket bot instance
const ticketBot = createTicketBot();

// Start a new ticket with a problem statement
const result = await ticketBot.processTicket({
  problem_statement: "The login page is not loading correctly in Firefox."
});

// The result contains the next step (ask_question, confirm_ticket, or finished)
if (result.next_step === 'ask_question') {
  // Ask the user the question and collect their response
  const userResponse = "This happens in Firefox version 90+";
  const updatedResult = await ticketBot.processResponse(userResponse);
}

// Once all questions are answered, the user will be asked to confirm
// After confirmation, you can send the ticket to external services
if (result.next_step === 'confirm_ticket') {
  const confirmed = true;
  const finalResult = await ticketBot.processConfirmation(confirmed);
  
  if (finalResult.ticket) {
    // Send to external services
    const services = createServices({
      jira: {
        apiUrl: process.env.JIRA_API_URL!,
        email: process.env.JIRA_EMAIL!,
        apiToken: process.env.JIRA_API_TOKEN!,
        projectKey: process.env.JIRA_PROJECT_KEY!
      },
      slack: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL!
      }
    });
    
    if (services.jira) {
      const jiraResult = await services.jira.createTicket(finalResult.ticket);
      console.log(`Ticket created in Jira: ${jiraResult.url}`);
    }
  }
}
```

## Future Enhancements

- Integration with ML models to auto-categorize and prioritize tickets
- Historic data analysis to improve question quality
- Automatic assignment to team members based on expertise
- Integration with knowledge base for solution recommendations 