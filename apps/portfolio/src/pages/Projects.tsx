const projects = [
  {
    id: 'enterprise-saas',
    title: 'Enterprise SaaS Platform',
    level: 'Intermediate → Advanced',
    maturity: 1,
    stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Redis'],
    description: 'Full-stack fundamentals with authentication, RBAC, dashboard, CRUD, background jobs, and CI/CD.',
  },
  {
    id: 'realtime-platform',
    title: 'Real-Time Collaboration Platform',
    level: 'Advanced',
    maturity: 1,
    stack: ['React', 'TypeScript', 'FastAPI', 'WebSockets', 'Redis'],
    description: 'WebSocket-based real-time architecture with presence, rooms, messaging, and concurrency handling.',
  },
  {
    id: 'marketplace',
    title: 'E-Commerce / Marketplace',
    level: 'Advanced',
    maturity: 1,
    stack: ['React', 'TypeScript', 'Python', 'PostgreSQL', 'Redis', 'GCP'],
    description: 'Transactions, idempotency, eventual consistency, and distributed workflows.',
  },
  {
    id: 'job-processing',
    title: 'Distributed Job Processing',
    level: 'Advanced',
    maturity: 1,
    stack: ['Python', 'Redis', 'PostgreSQL'],
    description: 'Queue-based job system with workers, retries, dead-letter queues, and monitoring.',
  },
  {
    id: 'analytics-platform',
    title: 'Analytics Platform',
    level: 'Advanced',
    maturity: 1,
    stack: ['React', 'TypeScript', 'Python', 'PostgreSQL', 'MongoDB'],
    description: 'Event collection, dashboards, aggregation, and OLTP vs analytics data modeling.',
  },
  {
    id: 'ai-knowledge-platform',
    title: 'AI Engineering Knowledge Platform',
    level: 'Advanced',
    maturity: 1,
    stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'pgvector'],
    description: 'RAG pipeline with document ingestion, citations, evaluation, and cost tracking.',
  },
  {
    id: 'ai-engineering-agent',
    title: 'AI Software Engineering Agent',
    level: 'Advanced',
    maturity: 1,
    stack: ['Python', 'FastAPI', 'LLM', 'MCP'],
    description: 'Agent with tool calling, planning, memory, human-in-the-loop, and observability.',
  },
  {
    id: 'multi-tenant-saas',
    title: 'Multi-Tenant SaaS',
    level: 'Expert',
    maturity: 1,
    stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL'],
    description: 'Tenant isolation, feature flags, API keys, usage limits, and billing abstraction.',
  },
  {
    id: 'cloud-native-platform',
    title: 'Cloud-Native Production System',
    level: 'Expert',
    maturity: 1,
    stack: ['Docker', 'Cloud Run', 'Terraform', 'PostgreSQL', 'Redis'],
    description: 'Complete production deployment with CI/CD, IaC, observability, and autoscaling.',
  },
  {
    id: 'system-design-playground',
    title: 'System Design Playground',
    level: 'Senior → Expert',
    maturity: 1,
    stack: ['Architecture', 'System Design'],
    description: 'Interactive system design case studies with architecture diagrams and trade-off analysis.',
  },
];

const maturityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Prototype', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  2: { label: 'Engineering', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  3: { label: 'Production', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  4: { label: 'Scale', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  5: { label: 'Expert', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
};

export default function Projects() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Flagship Projects</h1>
        <p className="text-gray-600 dark:text-gray-400">
          10 production-grade projects demonstrating senior-level engineering across the full stack.
        </p>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => {
          const maturity = maturityLabels[project.maturity];
          return (
            <article
              key={project.id}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${maturity.color}`}>
                    {maturity.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {project.level}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
