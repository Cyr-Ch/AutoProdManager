import { TicketState, TicketInput, QuestionOutput, TicketSummary, TicketOutput } from './types';
import { 
  receive_input, 
  check_missing_info, 
  ask_followup_question, 
  collect_response, 
  summarize_ticket, 
  output_ticket 
} from './nodes';

// This is a placeholder for LangGraph. In a real implementation,
// you would import and use LangGraph or a similar orchestration library.
// For this example, we'll simulate the graph behavior.

export class SupportTicketGraph {
  private state: TicketState = {
    problem_statement: '',
    severity: null,
    reproducibility: null,
    evidence: {
      screenshots: false,
      logs: false,
      videos: false
    },
    affected_components: null,
    missing_info: {
      severity: true,
      reproducibility: true,
      evidence: true,
      affected_components: true
    },
    current_question: null,
    responses: {},
    ticket_summary: null,
    confirmation: null,
    final_ticket: null
  };

  /**
   * Process a new ticket problem statement
   */
  async processTicket(input: TicketInput): Promise<{ 
    next_step: 'ask_question' | 'confirm_ticket' | 'finished',
    question?: QuestionOutput,
    summary?: TicketSummary,
    ticket?: TicketOutput,
    state: TicketState
  }> {
    // Initialize state with problem statement
    this.state = {
      ...this.state,
      problem_statement: input.problem_statement
    };

    // Process the state through the graph
    return this.runGraph();
  }

  /**
   * Process a user response to a question
   */
  async processResponse(response: string): Promise<{
    next_step: 'ask_question' | 'confirm_ticket' | 'finished',
    question?: QuestionOutput,
    summary?: TicketSummary,
    ticket?: TicketOutput,
    state: TicketState
  }> {
    // Update state with the response
    this.state = collect_response(this.state, response);
    
    // Process the updated state through the graph
    return this.runGraph();
  }

  /**
   * Process a confirmation response
   */
  async processConfirmation(confirmed: boolean): Promise<{
    next_step: 'ask_question' | 'confirm_ticket' | 'finished',
    question?: QuestionOutput,
    summary?: TicketSummary,
    ticket?: TicketOutput,
    state: TicketState
  }> {
    // Generate the final ticket output
    const { output, state } = output_ticket(this.state, confirmed);
    this.state = state;

    if (!confirmed) {
      // If not confirmed, go back to questions to revise
      return this.runGraph();
    }

    return {
      next_step: 'finished',
      ticket: output || undefined,
      state: this.state
    };
  }

  /**
   * Run the graph logic
   */
  private async runGraph(): Promise<{
    next_step: 'ask_question' | 'confirm_ticket' | 'finished',
    question?: QuestionOutput,
    summary?: TicketSummary,
    ticket?: TicketOutput,
    state: TicketState
  }> {
    // Process through the graph
    
    // Step 1: Receive and process input
    this.state = receive_input(this.state);
    
    // Step 2: Check for missing information
    const { has_missing_info, state: updatedState } = check_missing_info(this.state);
    this.state = updatedState;
    
    // If information is missing, ask a question
    if (has_missing_info) {
      const { output, state } = ask_followup_question(this.state);
      this.state = state;
      return {
        next_step: 'ask_question',
        question: output,
        state: this.state
      };
    }
    
    // If all information is available, generate ticket summary
    const { output, state } = summarize_ticket(this.state);
    this.state = state;
    
    // Return summary for confirmation
    return {
      next_step: 'confirm_ticket',
      summary: output,
      state: this.state
    };
  }
} 