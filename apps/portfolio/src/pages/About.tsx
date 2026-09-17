const stats = [
  { label: 'Lines of Code Written', value: '4,500+' },
  { label: 'Days Active', value: '5' },
  { label: 'Projects Built', value: '15' },
  { label: 'Learning Notes', value: '16' },
];

export default function About() {
  return (
    <div className="space-y-12 max-w-3xl">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold mb-4">About the Engineering Lab</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          I am a Senior Software Engineer focused on building resilient, scalable, and production-quality software systems. 
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This repository is my <strong>public engineering laboratory</strong>. It is not a collection of tutorials; it is a live demonstration of how I design, build, test, and document complex technical solutions under pressure.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200 dark:border-gray-800">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Philosophy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">The Philosophy</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p>
            The software industry is obsessed with listing technologies on a resume. I built this lab to demonstrate <strong>depth over breadth</strong>, focusing on the "why" behind every engineering decision.
          </p>
          <ul className="space-y-2 mt-4 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="text-blue-500">→</span>
              <span><strong>No magic boxes:</strong> If I use an LRU cache, I build the HashMap + Doubly Linked List from scratch to prove I understand how O(1) eviction works.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">→</span>
              <span><strong>Failure is a first-class citizen:</strong> Systems fail. My RabbitMQ worker is deliberately programmed to fail 20% of the time to demonstrate Dead-Letter Queues (DLQs) in action.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">→</span>
              <span><strong>Real-world constraints:</strong> My Redis rate limiter handles TOCTOU race conditions via atomic Lua scripts, because naive check-then-set logic fails in distributed environments.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">→</span>
              <span><strong>Design before code:</strong> Every major piece of work goes through a formal implementation plan and ADR (Architecture Decision Record).</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">⚙️</span> Backend & Systems
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>• Python, Node.js</li>
              <li>• FastAPI, Express</li>
              <li>• PostgreSQL, Redis, MongoDB</li>
              <li>• RabbitMQ, SQS/SNS</li>
              <li>• Serverless (Lambda)</li>
            </ul>
          </div>
          
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🖥️</span> Frontend & UI
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>• React, Vue 3, Angular</li>
              <li>• TypeScript, RxJS</li>
              <li>• Pinia, Zustand, Redux</li>
              <li>• Tailwind CSS</li>
              <li>• Vite, Webpack</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">☁️</span> Cloud & Infra
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>• Docker, Docker Compose</li>
              <li>• AWS, GCP</li>
              <li>• Nginx, Load Balancing</li>
              <li>• GitHub Actions (CI/CD)</li>
              <li>• Terraform (IaC)</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🧪</span> Engineering Practices
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>• TDD (pytest, Vitest)</li>
              <li>• Data Structures & Algorithms</li>
              <li>• System Design & Architecture</li>
              <li>• Security (OWASP)</li>
              <li>• Technical Writing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="pt-8 border-t border-gray-200 dark:border-gray-800 flex gap-4">
        <a 
          href="https://github.com/ameet" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          GitHub Profile
        </a>
        <a 
          href="https://linkedin.com/in/ameet" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          LinkedIn
        </a>
      </section>

    </div>
  );
}
