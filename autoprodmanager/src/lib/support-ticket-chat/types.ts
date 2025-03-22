export interface TicketState {
  problem_statement: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | null;
  reproducibility: string | null;
  evidence: {
    screenshots: boolean;
    logs: boolean;
    videos: boolean;
  };
  affected_components: string[] | null;
  missing_info: {
    severity: boolean;
    reproducibility: boolean;
    evidence: boolean;
    affected_components: boolean;
  };
  current_question: string | null;
  responses: Record<string, string>;
  ticket_summary: string | null;
  confirmation: boolean | null;
  final_ticket: Record<string, any> | null;
}

export interface TicketInput {
  problem_statement: string;
}

export interface QuestionOutput {
  question: string;
  field: 'severity' | 'reproducibility' | 'evidence' | 'affected_components';
}

export interface TicketSummary {
  problem_statement: string;
  severity: string;
  reproducibility: string;
  evidence: {
    screenshots: boolean;
    logs: boolean;
    videos: boolean;
  };
  affected_components: string[];
  summary: string;
}

export interface TicketOutput {
  id: string;
  title: string;
  description: string;
  severity: string;
  reproducibility: string;
  evidence: {
    screenshots: boolean;
    logs: boolean;
    videos: boolean;
  };
  affected_components: string[];
  status: 'pending' | 'in_review';
  created_at: string;
} 