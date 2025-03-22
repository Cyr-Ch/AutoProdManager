import { TicketState, QuestionOutput, TicketSummary, TicketOutput } from './types';

// Initialize state with problem statement
export function receive_input(state: TicketState): TicketState {
  return {
    ...state,
    missing_info: {
      severity: !state.severity,
      reproducibility: !state.reproducibility,
      evidence: !state.evidence?.screenshots && !state.evidence?.logs,
      affected_components: !state.affected_components || state.affected_components.length === 0,
    }
  };
}

// Check if any information is missing from the ticket
export function check_missing_info(state: TicketState): { has_missing_info: boolean, state: TicketState } {
  const { missing_info } = state;
  const has_missing_info = Object.values(missing_info).some(Boolean);
  
  return {
    has_missing_info,
    state
  };
}

// Generate a question to ask for missing information
export function ask_followup_question(state: TicketState): { output: QuestionOutput, state: TicketState } {
  const { missing_info } = state;
  let field: 'severity' | 'reproducibility' | 'evidence' | 'affected_components';
  let question: string;

  if (missing_info.severity) {
    field = 'severity';
    question = "What is the severity of this issue? (critical, high, medium, or low)";
  } else if (missing_info.reproducibility) {
    field = 'reproducibility';
    question = "How reproducible is this issue? Please describe steps to reproduce or frequency of occurrence.";
  } else if (missing_info.evidence) {
    field = 'evidence';
    question = "Do you have any evidence (screenshots, logs, videos) of the issue? Please specify which ones you have available.";
  } else {
    field = 'affected_components';
    question = "Which components or features are affected by this issue?";
  }

  return {
    output: { question, field },
    state: {
      ...state,
      current_question: question
    }
  };
}

// Process the response from the user and update the state
export function collect_response(state: TicketState, response: string): TicketState {
  const field = state.current_question ? 
    (state.current_question.includes("severity") ? 'severity' :
     state.current_question.includes("reproduce") ? 'reproducibility' :
     state.current_question.includes("evidence") ? 'evidence' :
     'affected_components') : 'unknown';

  const newState = { ...state };
  
  // Update the responses record
  newState.responses = {
    ...newState.responses,
    [field]: response
  };

  // Update the specific field based on the response
  if (field === 'severity') {
    const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };
    
    const matchedSeverity = Object.keys(severityMap).find(key => 
      response.toLowerCase().includes(key)
    );
    
    newState.severity = matchedSeverity ? severityMap[matchedSeverity] : null;
    newState.missing_info.severity = !newState.severity;
  } else if (field === 'reproducibility') {
    newState.reproducibility = response;
    newState.missing_info.reproducibility = false;
  } else if (field === 'evidence') {
    newState.evidence = {
      screenshots: response.toLowerCase().includes('screenshot'),
      logs: response.toLowerCase().includes('log'),
      videos: response.toLowerCase().includes('video')
    };
    newState.missing_info.evidence = !(newState.evidence.screenshots || newState.evidence.logs || newState.evidence.videos);
  } else if (field === 'affected_components') {
    const componentsList = response
      .split(/,|\n/)
      .map(comp => comp.trim())
      .filter(Boolean);
    
    newState.affected_components = componentsList;
    newState.missing_info.affected_components = componentsList.length === 0;
  }

  newState.current_question = null;
  
  return newState;
}

// Summarize the ticket information into a draft
export function summarize_ticket(state: TicketState): { output: TicketSummary, state: TicketState } {
  const { problem_statement, severity, reproducibility, evidence, affected_components } = state;
  
  const summary = `
Issue Summary:
--------------
Problem: ${problem_statement}
Severity: ${severity}
Reproducibility: ${reproducibility}
Evidence: ${evidence.screenshots ? 'Screenshots ✓' : 'Screenshots ✗'}, ${evidence.logs ? 'Logs ✓' : 'Logs ✗'}, ${evidence.videos ? 'Videos ✓' : 'Videos ✗'}
Affected Components: ${affected_components?.join(', ')}
  `.trim();

  const ticketSummary: TicketSummary = {
    problem_statement,
    severity: severity || 'unknown',
    reproducibility: reproducibility || 'unknown',
    evidence,
    affected_components: affected_components || [],
    summary
  };

  return {
    output: ticketSummary,
    state: {
      ...state,
      ticket_summary: summary
    }
  };
}

// Format and output the final ticket
export function output_ticket(state: TicketState, confirmed: boolean): { output: TicketOutput | null, state: TicketState } {
  if (!confirmed) {
    return {
      output: null,
      state: {
        ...state,
        confirmation: false
      }
    };
  }

  const { problem_statement, severity, reproducibility, evidence, affected_components } = state;
  
  // Create a title from the problem statement (first sentence or first X characters)
  const title = problem_statement.split('.')[0].length > 10 ? 
    problem_statement.split('.')[0] : 
    problem_statement.substring(0, Math.min(60, problem_statement.length));
  
  // Format the ticket to be sent to PM queue
  const ticketOutput: TicketOutput = {
    id: `TICKET-${Date.now().toString().substring(7)}`,
    title,
    description: `
## Problem Description
${problem_statement}

## Reproducibility
${reproducibility}

## Evidence
${[
  evidence.screenshots ? '- Screenshots available' : '',
  evidence.logs ? '- Logs available' : '',
  evidence.videos ? '- Videos available' : ''
].filter(Boolean).join('\n')}

## Affected Components
${affected_components?.map(comp => `- ${comp}`).join('\n')}
    `.trim(),
    severity: severity || 'medium',
    reproducibility: reproducibility || 'unknown',
    evidence,
    affected_components: affected_components || [],
    status: 'pending',
    created_at: new Date().toISOString()
  };

  return {
    output: ticketOutput,
    state: {
      ...state,
      confirmation: true,
      final_ticket: ticketOutput
    }
  };
} 