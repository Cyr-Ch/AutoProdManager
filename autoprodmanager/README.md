# AutoProdManager

AutoProdManager is an AI-powered product management support system that streamlines communication between support, product management, and development teams. With its intuitive interfaces and automation features, it makes the entire product management process more efficient.

## Features

- **Support Team Interface**: A chatbot interface that helps support teams create detailed tickets with all the necessary information.
- **Product Manager Dashboard**: An organized view of tickets automatically clustered by topic, allowing product managers to efficiently review, edit, and approve/reject tickets.
- **Developer Dashboard**: A streamlined interface for developers to view approved tickets and export them to preferred product management tools (Jira, Azure DevOps, GitHub).

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js with Next.js API routes
- **Database**: MongoDB
- **AI**: OpenAI API for chatbot and ticket clustering
- **Integrations**: Jira, Azure DevOps, GitHub (API integrations)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/autoprodmanager.git
   cd autoprodmanager
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/autoprodmanager
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   
   # Uncomment and configure the one you use
   # JIRA_API_KEY=your_jira_api_key
   # JIRA_URL=your_jira_url
   # AZURE_DEVOPS_PAT=your_azure_devops_pat
   # AZURE_DEVOPS_ORG=your_azure_devops_organization
   # GITHUB_TOKEN=your_github_token
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Support Team

1. Navigate to the Support page
2. Use the chatbot to describe the issue
3. The AI will help gather all necessary information
4. A ticket will be automatically created with a title, description, and topic clustering

### Product Manager

1. Navigate to the Product Manager dashboard
2. View tickets clustered by topic
3. Review and edit tickets as needed
4. Approve or reject tickets for development

### Developer

1. Navigate to the Developer dashboard
2. View approved tickets ready for implementation
3. Select tickets to export to your preferred product management tool (Jira, Azure DevOps, GitHub)
4. Track which tickets have been exported and where they're being managed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for providing the AI capabilities
- MongoDB for database services
- Tailwind CSS for styling libraries
- Next.js team for the wonderful framework
