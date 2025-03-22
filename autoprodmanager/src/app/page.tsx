import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        AutoProdManager
      </h1>
      <p className="text-xl md:text-2xl text-center mb-12 max-w-3xl text-gray-600 dark:text-gray-300">
        AI-powered product management support system that streamlines communication between support, product management, and development teams.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Link href="/support" className="group">
          <div className="apple-card p-6 h-full transition-all duration-300 hover:shadow-md">
            <h2 className="apple-heading mb-4">Support Team</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create tickets with our AI chatbot to gather all necessary information from users efficiently.
            </p>
            <div className="apple-btn inline-block group-hover:bg-blue-600">Get Started</div>
          </div>
        </Link>
        
        <Link href="/product-manager" className="group">
          <div className="apple-card p-6 h-full transition-all duration-300 hover:shadow-md">
            <h2 className="apple-heading mb-4">Product Manager</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Review and refine tickets with AI-powered insights. Manage ticket clusters and prioritize effectively.
            </p>
            <div className="apple-btn inline-block group-hover:bg-blue-600">View Dashboard</div>
          </div>
        </Link>
        
        <Link href="/developer" className="group">
          <div className="apple-card p-6 h-full transition-all duration-300 hover:shadow-md">
            <h2 className="apple-heading mb-4">Developer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Access approved tickets and integrate with your preferred development tools like Jira, Azure DevOps, or GitHub.
            </p>
            <div className="apple-btn inline-block group-hover:bg-blue-600">View Tasks</div>
          </div>
        </Link>
      </div>
      
      <div className="mt-16 text-center max-w-2xl">
        <h3 className="apple-subheading mb-4">How It Works</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Our AI-driven workflow automatically categorizes support tickets, helps product managers prioritize based on impact, and seamlessly integrates with your development workflow.
        </p>
      </div>
    </div>
  );
}
