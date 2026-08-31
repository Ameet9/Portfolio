const experience = [
  {
    title: 'Senior Software Engineer',
    company: '[Company Name]',
    period: '[Month Year] – Present',
    location: '[Location]',
    highlights: [
      'Architected a multi-tenant SaaS platform serving multiple organizations with tenant isolation, RBAC, and feature flags',
      'Built a distributed job processing system handling thousands of jobs/day with Redis queues, retries, and dead-letter queue handling',
      'Designed a RAG-based AI knowledge platform with hybrid search achieving significant relevance improvements',
      'Led migration to service-oriented architecture on GCP Cloud Run, improving deployment speed and scalability',
      'Established CI/CD pipelines with automated testing (95%+ coverage), security scanning, and blue/green deployments',
      'Implemented comprehensive observability stack with OpenTelemetry, structured logging, and distributed tracing',
    ],
  },
  {
    title: 'Software Engineer',
    company: '[Company Name]',
    period: '[Month Year] – [Month Year]',
    location: '[Location]',
    highlights: [
      'Developed a real-time collaboration platform using React, WebSockets, and Redis Pub/Sub',
      'Built an e-commerce backend with FastAPI implementing idempotent payment flows and event-driven order processing',
      'Optimized PostgreSQL schemas with materialized views and composite indexes, reducing p95 query latency significantly',
      'Integrated OAuth 2.0 / OpenID Connect with refresh token rotation, CSRF protection, and rate limiting',
    ],
  },
  {
    title: 'Junior Software Engineer',
    company: '[Company Name]',
    period: '[Month Year] – [Month Year]',
    location: '[Location]',
    highlights: [
      'Built responsive, accessible (WCAG 2.1 AA) frontend applications with React and TypeScript',
      'Developed RESTful APIs with Node.js/Express implementing validation, error handling, and pagination',
      'Maintained 85%+ code coverage across assigned modules with comprehensive unit and integration tests',
    ],
  },
];

const skills = [
  { category: 'Frontend', items: 'React, TypeScript, Vue.js, TanStack Query, Tailwind CSS, Vite' },
  { category: 'Backend', items: 'Python, FastAPI, Node.js, Express, REST APIs, WebSockets' },
  { category: 'Databases', items: 'PostgreSQL, MongoDB, Redis, Supabase, Firebase, pgvector' },
  { category: 'Cloud & DevOps', items: 'GCP, Docker, Terraform, GitHub Actions, CI/CD' },
  { category: 'AI Engineering', items: 'LLMs, RAG, Vector Search, Agents, MCP, AI Evaluation' },
  { category: 'Testing', items: 'Vitest, React Testing Library, Playwright, pytest' },
  { category: 'Observability', items: 'OpenTelemetry, Structured Logging, Distributed Tracing' },
];

export default function Resume() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-3 pb-8 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold">[Your Name]</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Senior Software Engineer</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>📍 [City, Country]</span>
          <span>📧 [your.email@example.com]</span>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            💻 GitHub
          </a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            🔗 LinkedIn
          </a>
        </div>
        <div className="pt-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors print:hidden"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </header>

      {/* Summary */}
      <section>
        <h2 className="text-2xl font-bold mb-3">Summary</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Senior Software Engineer with expertise in designing, building, and deploying
          production-grade full-stack applications. Deep experience across React, TypeScript,
          Python/FastAPI, PostgreSQL, and Google Cloud Platform. Passionate about clean architecture,
          system design, security, observability, and AI engineering.
        </p>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Technical Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((skill) => (
            <div
              key={skill.category}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <h3 className="font-semibold text-sm mb-1">{skill.category}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{skill.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Experience</h2>
        <div className="space-y-8">
          {experience.map((role, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="mb-2">
                <h3 className="text-lg font-semibold">{role.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {role.company} · {role.location}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{role.period}</p>
              </div>
              <ul className="space-y-1.5">
                {role.highlights.map((highlight, hIdx) => (
                  <li
                    key={hIdx}
                    className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                  >
                    <span className="text-gray-400 dark:text-gray-600 shrink-0">→</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Education</h2>
        <div className="pl-6 border-l-2 border-gray-200 dark:border-gray-800 relative">
          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700" />
          <h3 className="text-lg font-semibold">[Degree] in [Field]</h3>
          <p className="text-gray-600 dark:text-gray-400">[University Name]</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">[Year] – [Year]</p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3">Engineering Philosophy</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
          "I optimize for depth, engineering judgment, correctness, maintainability, security,
          reliability, scalability, observability, performance, documentation, and trade-off
          awareness — not for the number of technologies listed or repositories created."
        </p>
      </section>
    </div>
  );
}
