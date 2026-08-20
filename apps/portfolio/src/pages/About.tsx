export default function About() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">About</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Senior Software Engineer focused on building production-quality software systems.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">What This Project Demonstrates</h2>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex gap-2"><span>→</span> Understanding requirements and designing systems</li>
          <li className="flex gap-2"><span>→</span> Choosing technologies with clear reasoning</li>
          <li className="flex gap-2"><span>→</span> Writing production-quality, tested code</li>
          <li className="flex gap-2"><span>→</span> Securing applications against real threats</li>
          <li className="flex gap-2"><span>→</span> Deploying with CI/CD and infrastructure as code</li>
          <li className="flex gap-2"><span>→</span> Monitoring, debugging, and optimizing systems</li>
          <li className="flex gap-2"><span>→</span> Making and documenting architectural decisions</li>
          <li className="flex gap-2"><span>→</span> Building AI-powered systems responsibly</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Technology Stack</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Frontend</h3>
            <p className="text-gray-600 dark:text-gray-400">React, TypeScript, Vue.js, TanStack Query</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Backend</h3>
            <p className="text-gray-600 dark:text-gray-400">Python, FastAPI, Node.js</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Databases</h3>
            <p className="text-gray-600 dark:text-gray-400">PostgreSQL, MongoDB, Redis, Supabase</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Cloud & DevOps</h3>
            <p className="text-gray-600 dark:text-gray-400">GCP, Docker, Terraform, GitHub Actions</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">AI</h3>
            <p className="text-gray-600 dark:text-gray-400">LLMs, RAG, Agents, MCP, Evaluation</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Testing</h3>
            <p className="text-gray-600 dark:text-gray-400">Vitest, React Testing Library, Playwright, pytest</p>
          </div>
        </div>
      </section>
    </div>
  );
}
