// ─── Flagship Projects ────────────────────────────────────────────────────────
const flagshipProjects = [
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

// ─── Daily Builds ─────────────────────────────────────────────────────────────
type Category = 'System Design' | 'React' | 'Vue' | 'Angular' | 'Python' | 'DSA';

interface DailyProject {
  id: string;
  title: string;
  date: string;
  category: Category;
  stack: string[];
  description: string;
  concepts: string[];
  path: string;
}

const dailyProjects: DailyProject[] = [
  // Sept 9
  {
    id: 'token-bucket-rate-limiter',
    title: 'Token Bucket Rate Limiter',
    date: 'Sept 9',
    category: 'System Design',
    stack: ['Python', 'Flask', 'Redis', 'Docker'],
    description: 'Rate limiting microservice using the token bucket algorithm, backed by Redis for distributed state. Includes atomic Lua script variant to eliminate race conditions.',
    concepts: ['Token bucket algorithm', 'Redis shared state', 'Atomic Lua scripts', 'Docker Compose'],
    path: 'learning/system-design/rate-limiter',
  },
  {
    id: 'react-hooks-library',
    title: 'useDebounce + useInfiniteScroll Hooks',
    date: 'Sept 9',
    category: 'React',
    stack: ['React', 'TypeScript', 'Vite'],
    description: 'Custom hook mini-library: debounced GitHub repo search and infinite scroll via IntersectionObserver. No external libraries — hand-rolled to understand the internals.',
    concepts: ['Custom hooks', 'IntersectionObserver', 'AbortController', 'Debouncing'],
    path: 'learning/react/hooks-demo',
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache from Scratch',
    date: 'Sept 9',
    category: 'DSA',
    stack: ['Python'],
    description: 'O(1) get/put LRU Cache using HashMap + Doubly Linked List with sentinel nodes. Includes OrderedDict comparison and 17 passing tests.',
    concepts: ['HashMap + DLL', 'Sentinel nodes', 'O(1) eviction', 'Cache patterns'],
    path: 'learning/dsa/lru-cache',
  },
  // Sept 10
  {
    id: 'nginx-load-balancer',
    title: 'Nginx Load Balancer ("Two Behind One")',
    date: 'Sept 10',
    category: 'System Design',
    stack: ['Python', 'Flask', 'Nginx', 'Docker'],
    description: 'Two identical Flask instances behind an Nginx reverse proxy with round-robin load balancing and health checks. Demonstrates horizontal scaling.',
    concepts: ['Round-robin LB', 'Health checks', 'Statelessness', 'Docker Compose'],
    path: 'learning/system-design/load-balancer',
  },
  {
    id: 'react-infinite-scroll',
    title: 'Infinite Scroll (JSONPlaceholder)',
    date: 'Sept 10',
    category: 'React',
    stack: ['React', 'TypeScript', 'Vite'],
    description: 'Standalone useInfiniteScroll hook fetching paginated posts. IntersectionObserver sentinel pattern with loading and end-of-list states.',
    concepts: ['IntersectionObserver', 'Pagination', 'Loading states', 'Custom hooks'],
    path: 'learning/react/infinite-scroll',
  },
  {
    id: 'trie-autocomplete',
    title: 'Autocomplete Engine with Trie',
    date: 'Sept 10',
    category: 'DSA',
    stack: ['Python'],
    description: 'Prefix tree (Trie) with insert, search, starts_with, autocomplete sorted by frequency, and delete with bottom-up node cleanup. Interactive CLI included.',
    concepts: ['Trie / Prefix Tree', 'O(L) lookup', 'DFS traversal', 'Frequency ranking'],
    path: 'learning/dsa/trie',
  },
  // Sept 11
  {
    id: 'redis-rate-limiter',
    title: 'Redis-Backed Rate Limiter',
    date: 'Sept 11',
    category: 'System Design',
    stack: ['Python', 'Flask', 'Redis', 'Docker'],
    description: 'Atomic Lua script token bucket backed by Redis. 429 responses with Retry-After and X-RateLimit-Remaining headers.',
    concepts: ['Token bucket', 'Lua atomicity', 'Distributed rate limiting', 'HTTP 429'],
    path: 'learning/system-design/redis-rate-limiter',
  },
  {
    id: 'angular-live-search',
    title: 'Angular Live Search (RxJS)',
    date: 'Sept 11',
    category: 'Angular',
    stack: ['Angular 18', 'TypeScript', 'RxJS'],
    description: 'Standalone Angular app searching GitHub users with debounceTime, distinctUntilChanged, and switchMap. Cancels in-flight requests on new input.',
    concepts: ['switchMap vs mergeMap', 'debounceTime', 'Standalone components', 'RxJS operators'],
    path: 'learning/angular/live-search',
  },
  {
    id: 'min-heap-meeting-rooms',
    title: 'Min-Heap + Meeting Rooms II',
    date: 'Sept 11',
    category: 'DSA',
    stack: ['Python'],
    description: 'From-scratch MinHeap with bubble up/down. Solves Meeting Rooms II: minimum rooms needed for overlapping intervals using greedy + heap approach.',
    concepts: ['Binary heap', 'Bubble up/down', 'Interval scheduling', 'Greedy algorithms'],
    path: 'learning/dsa/heap',
  },
  // Sept 12
  {
    id: 'serverless-notes',
    title: 'Serverless Notes API (LocalStack)',
    date: 'Sept 12',
    category: 'System Design',
    stack: ['Python', 'AWS Lambda', 'API Gateway', 'LocalStack'],
    description: 'Notes REST API (CRUD) on Lambda + API Gateway using LocalStack to fake AWS locally. Demonstrates stateless compute, cold starts, and Lambda handler contract.',
    concepts: ['Serverless', 'Lambda handler', 'Cold starts', 'LocalStack'],
    path: 'learning/system-design/serverless-notes',
  },
  {
    id: 'websocket-chat',
    title: 'Real-Time WebSocket Chat',
    date: 'Sept 12',
    category: 'Python',
    stack: ['Python', 'FastAPI', 'WebSockets'],
    description: 'Multi-user chat room with ConnectionManager broadcasting messages to all clients. Handles disconnects cleanly with a Vanilla JS frontend.',
    concepts: ['WebSocket protocol', 'Broadcast pattern', 'Async Python', 'Connection lifecycle'],
    path: 'learning/python/websocket-chat',
  },
  {
    id: 'topological-sort',
    title: 'Build-Order Resolver (Topo Sort)',
    date: 'Sept 12',
    category: 'DSA',
    stack: ['Python'],
    description: "Kahn's BFS and DFS topological sort with CycleDetectedError. CLI demo resolves a software build pipeline and detects circular dependencies.",
    concepts: ["Kahn's algorithm", 'DAG', 'Cycle detection', 'Dependency ordering'],
    path: 'learning/dsa/topological-sort',
  },
  // Sept 13
  {
    id: 'rabbitmq-order-pipeline',
    title: 'RabbitMQ Order Pipeline',
    date: 'Sept 13',
    category: 'System Design',
    stack: ['Python', 'FastAPI', 'RabbitMQ', 'Docker'],
    description: 'Producer API accepts orders (202 Accepted) and queues them. Consumer worker processes asynchronously with ~20% simulated failures routed to a dead-letter queue.',
    concepts: ['Producer-consumer', 'Dead-letter queue', 'Manual ack', 'Async processing'],
    path: 'learning/system-design/order-pipeline',
  },
  {
    id: 'vue-kanban',
    title: 'Drag-and-Drop Kanban Board',
    date: 'Sept 13',
    category: 'Vue',
    stack: ['Vue 3', 'Pinia', 'Vite'],
    description: 'Trello-style board with normalized Pinia state (cards by ID, columns hold IDs). Native HTML5 drag-and-drop, undo history, and localStorage persistence.',
    concepts: ['Pinia', 'State normalization', 'Optimistic UI', 'HTML5 drag-and-drop'],
    path: 'learning/vue/kanban',
  },
  {
    id: 'union-find',
    title: 'Union-Find (Disjoint Set Union)',
    date: 'Sept 13',
    category: 'DSA',
    stack: ['Python'],
    description: 'Path compression + union by rank giving near-O(1) amortized ops. Solves Friend Circles and a NetworkMonitor for incremental connectivity queries.',
    concepts: ['Path compression', 'Union by rank', 'O(α(n))', 'Online algorithms'],
    path: 'learning/dsa/union-find',
  },
  // Sept 16
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker Pattern',
    date: 'Sept 16',
    category: 'System Design',
    stack: ['Python', 'Flask'],
    description: 'Full circuit breaker state machine (CLOSED → OPEN → HALF_OPEN → CLOSED) protecting against a flaky downstream service. Includes timeout handling and fail-fast behavior.',
    concepts: ['Circuit breaker states', 'Cascading failure prevention', 'Fail-fast pattern', 'Timeout handling'],
    path: 'learning/system-design/circuit-breaker',
  },
  {
    id: 'jwt-expense-tracker',
    title: 'JWT-Authenticated Expense Tracker',
    date: 'Sept 16',
    category: 'Python',
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'JWT'],
    description: 'Auth-protected CRUD API with signup/login, bcrypt password hashing, JWT tokens, and per-user expense scoping to prevent IDOR vulnerabilities.',
    concepts: ['JWT stateless auth', 'bcrypt hashing', 'IDOR prevention', 'FastAPI Depends'],
    path: 'learning/python/expense-tracker',
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands (Grid BFS/DFS)',
    date: 'Sept 16',
    category: 'DSA',
    stack: ['Python'],
    description: 'Classic grid traversal problem solved with both DFS (recursive sink) and BFS (deque). Includes a no-modify variant using a visited set and the flood-fill pattern family.',
    concepts: ['DFS vs BFS', 'Grid traversal', 'Flood fill pattern', 'Visited-state tracking'],
    path: 'learning/dsa/grid-traversal',
  },
  // Sept 17
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing Ring',
    date: 'Sept 17',
    category: 'System Design',
    stack: ['Python'],
    description: 'Working consistent-hashing ring with virtual nodes (replicas) for even key distribution. Proves naive modulo remaps ~80% of keys while the ring remaps only ~1/N on topology changes.',
    concepts: ['Consistent hashing', 'Virtual nodes', 'bisect O(log N)', 'Blast radius minimization'],
    path: 'learning/system-design/consistent-hashing',
  },
  {
    id: 'vue-command-palette',
    title: 'Command Palette (Cmd+K)',
    date: 'Sept 17',
    category: 'Vue',
    stack: ['Vue 3', 'Vite'],
    description: 'Spotlight/Notion-style Cmd+K command palette with fuzzy subsequence search, keyboard navigation, Teleport rendering, focus management, and ARIA accessibility.',
    concepts: ['Composables', 'Teleport', 'Fuzzy matching', 'Focus management'],
    path: 'learning/vue/command-palette',
  },
  {
    id: 'dijkstra-flights',
    title: 'Flight Route Optimizer (Dijkstra)',
    date: 'Sept 17',
    category: 'DSA',
    stack: ['Python'],
    description: 'Dijkstra\'s shortest-path algorithm with heapq min-heap on a realistic 8-city flight network. Includes path reconstruction and the "Cheapest Flights Within K Stops" LeetCode variant.',
    concepts: ['Dijkstra\'s algorithm', 'Min-heap / heapq', 'Path reconstruction', 'K-stops variant'],
    path: 'learning/dsa/dijkstra',
  },
];

// ─── Category style map ───────────────────────────────────────────────────────
const categoryStyles: Record<Category, string> = {
  'System Design': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'React':         'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  'Vue':           'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'Angular':       'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'Python':        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'DSA':           'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const maturityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Prototype', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  2: { label: 'Engineering', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  3: { label: 'Production', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  4: { label: 'Scale', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  5: { label: 'Expert', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
};

export default function Projects() {
  return (
    <div className="space-y-16">

      {/* ── Daily Builds ────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daily Builds</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {dailyProjects.length} hands-on projects built daily — one system design, one frontend, one DSA.
            Each demonstrates a concept in working code, not just theory.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dailyProjects.map((project) => (
            <article
              key={project.id}
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold leading-snug">{project.title}</h2>
                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${categoryStyles[project.category]}`}>
                  {project.category}
                </span>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-400 dark:text-gray-500">{project.date}</p>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{project.description}</p>

              {/* Concepts */}
              <div className="flex flex-wrap gap-1.5">
                {project.concepts.map((c) => (
                  <span
                    key={c}
                    className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Stack */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs rounded-md bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Path */}
              <p className="text-xs text-gray-400 dark:text-gray-600 font-mono truncate">{project.path}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Flagship Projects ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Flagship Projects</h2>
          <p className="text-gray-600 dark:text-gray-400">
            10 production-grade projects demonstrating senior-level engineering across the full stack.
          </p>
        </div>

        <div className="grid gap-6">
          {flagshipProjects.map((project) => {
            const maturity = maturityLabels[project.maturity];
            return (
              <article
                key={project.id}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
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
      </section>

    </div>
  );
}
