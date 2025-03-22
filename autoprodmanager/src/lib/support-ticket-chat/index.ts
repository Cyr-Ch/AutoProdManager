// Re-export types and classes
export * from './types';
export * from './nodes';
export * from './graph';
export * from './services';

// Export a factory function to create a new graph instance
import { SupportTicketGraph } from './graph';
import { JiraService, LinearService, SlackService } from './services';

export const createTicketBot = () => {
  return new SupportTicketGraph();
};

// Export a factory function to create external service integrations
interface ServiceConfig {
  jira?: {
    apiUrl: string;
    email: string;
    apiToken: string;
    projectKey: string;
  };
  linear?: {
    apiKey: string;
    teamId: string;
  };
  slack?: {
    webhookUrl: string;
  };
}

export const createServices = (config: ServiceConfig) => {
  const services: {
    jira?: JiraService;
    linear?: LinearService;
    slack?: SlackService;
  } = {};

  if (config.jira) {
    services.jira = new JiraService(
      config.jira.apiUrl,
      config.jira.email,
      config.jira.apiToken,
      config.jira.projectKey
    );
  }

  if (config.linear) {
    services.linear = new LinearService(
      config.linear.apiKey,
      config.linear.teamId
    );
  }

  if (config.slack) {
    services.slack = new SlackService(
      config.slack.webhookUrl
    );
  }

  return services;
}; 