import { Link } from 'react-router-dom';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface CaseStudy {
  id: string;
  title: string;
  date: string;
  pattern: string;
  problem: string;
  architecture: string;
  keyInsight: string;
  stack: string[];
  concepts: string[];
  path: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'token-bucket',
    title: 'Token Bucket Rate Limiter',
    date: 'Sept 9',
    pattern: 'Rate Limiting',
    problem: 'How do you stop one API client from sending 10,000 requests per second while allowing legitimate burst traffic?',
    architecture: 'Flask API → Redis (atomic Lua script) → Allow/Reject middleware. Lua script atomically reads token count + timestamp, calculates refill based on elapsed time, decrements if available, rejects with 429 if empty.',
    keyInsight: 'Token refill is computed lazily at request time (not by a background cron), avoiding the need for a separate scheduler process. The Lua script runs atomically on Redis, eliminating TOCTOU race conditions in distributed deployments.',
    stack: ['Python', 'Flask', 'Redis', 'Docker'],
    concepts: ['Token bucket algorithm', 'Atomic Lua scripts', 'Race conditions (TOCTOU)', 'HTTP 429 + Retry-After'],
    path: 'learning/system-design/rate-limiter',
  },
  {
    id: 'nginx-lb',
    title: 'Nginx Load Balancer ("Two Behind One")',
    date: 'Sept 10',
    pattern: 'Horizontal Scaling',
    problem: 'What is the first step in scaling an API that gets too much traffic for one server?',
    architecture: 'Client → Nginx (upstream block, round-robin) → [Flask Instance 1 | Flask Instance 2]. Each instance reports its SERVER_NAME env var in the response so you can visually confirm the load balancer is distributing traffic.',
    keyInsight: 'Statelessness is the precondition for this to work. Both instances run the same image with different env vars — this mirrors real production fleets. Health check config (max_fails, fail_timeout) makes Nginx stop routing to a failed instance automatically.',
    stack: ['Python', 'Flask', 'Nginx', 'Docker'],
    concepts: ['Round-robin vs least-connections', 'Health checks', 'Reverse proxy vs load balancer', 'Stateless services'],
    path: 'learning/system-design/load-balancer',
  },
  {
    id: 'redis-rate-limiter',
    title: 'Redis-Backed Rate Limiter (Distributed)',
    date: 'Sept 11',
    pattern: 'Rate Limiting (Distributed)',
    problem: 'How do you enforce a shared rate limit across multiple API server instances?',
    architecture: 'Same token bucket as before, but built to demonstrate WHY Redis is needed. Running two API instances: in-memory counters let each instance track its own quota independently (2× the allowed rate). Redis provides a single shared counter all instances agree on.',
    keyInsight: 'This is the core "distributed state" lesson — per-instance memory cannot be the source of truth in a horizontally scaled system. Redis is the neutral shared store. Lua atomicity prevents the race condition where two servers simultaneously read "1 token remaining" and both proceed.',
    stack: ['Python', 'Flask', 'Redis', 'Docker'],
    concepts: ['Shared vs local state', 'Lua atomicity', 'Fail-open vs fail-closed', 'Redis HA (Sentinel/Cluster)'],
    path: 'learning/system-design/redis-rate-limiter',
  },
  {
    id: 'serverless-notes',
    title: 'Serverless Notes API (LocalStack)',
    date: 'Sept 12',
    pattern: 'Serverless Architecture',
    problem: 'How does serverless (Lambda + API Gateway) differ from containers, and when would you NOT choose it?',
    architecture: 'Client → API Gateway (HTTP routes) → Lambda (lambda_handler contract) → DynamoDB. LocalStack fakes all AWS services locally. API Gateway translates HTTP method/path into the event dict Lambda receives.',
    keyInsight: 'Lambda is stateless and ephemeral — AWS may spin up a fresh instance per request and discard it after. Cold starts (100ms–1s latency) happen when no instance is warm. Anything stateful MUST live outside the function (DynamoDB, S3, Redis). Unit tests run against the handler directly, no AWS needed.',
    stack: ['Python', 'AWS Lambda', 'API Gateway', 'LocalStack', 'DynamoDB'],
    concepts: ['Lambda handler contract', 'Cold starts', 'Provisioned concurrency', 'Pay-per-invocation model'],
    path: 'learning/system-design/serverless-notes',
  },
  {
    id: 'rabbitmq-pipeline',
    title: 'RabbitMQ Order Processing Pipeline',
    date: 'Sept 13',
    pattern: 'Async Processing / Message Queue',
    problem: 'How do you accept user requests instantly without blocking on slow downstream work like payment processing or email sending?',
    architecture: 'FastAPI (POST /orders → 202 Accepted) → RabbitMQ exchange → orders queue → Worker (consume, process, ack). 20% of orders randomly fail → basic_nack(requeue=False) → Dead-Letter Queue for inspection. prefetch_count=1 ensures fair task distribution across multiple workers.',
    keyInsight: 'The producer\'s job is to accept work fast, not do the work. The 202 pattern decouples user-facing latency from processing time entirely. DLQ is preferable to silent drops (data loss) or infinite retry loops (queue poisoning). Manual ack means a message stays in-flight until the worker explicitly confirms success.',
    stack: ['Python', 'FastAPI', 'RabbitMQ', 'Docker'],
    concepts: ['Producer-consumer decoupling', 'Manual acknowledgment', 'Dead-letter queues', 'prefetch_count / back-pressure'],
    path: 'learning/system-design/order-pipeline',
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing Ring',
    date: 'Sept 17',
    pattern: 'Data Partitioning / Sharding',
    problem: 'When you have multiple cache or DB servers and add or remove one, how do you avoid re-shuffling almost all your keys?',
    architecture: 'Hash each node (with 150 virtual replicas) onto a 0–2³² ring. For a key lookup, hash the key and walk clockwise to the first node position via bisect (O(log N)). Adding/removing a node only affects the keys between it and its ring neighbor.',
    keyInsight: 'Naive modulo (hash % N) remaps ~80% of keys when N changes by 1. A consistent hash ring remaps only ~1/N keys. Virtual nodes solve the uneven distribution problem by multiplying each server\'s placement points, giving a smooth statistical spread even with few physical servers.',
    stack: ['Python'],
    concepts: ['Consistent hashing', 'Virtual nodes / replicas', 'bisect binary search', 'Blast radius minimization'],
    path: 'learning/system-design/consistent-hashing',
  },
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker Pattern',
    date: 'Sept 16',
    pattern: 'Resilience / Fault Tolerance',
    problem: 'What happens when a downstream service starts failing or hanging — how do you prevent it from taking down your entire system?',
    architecture: 'Client → CircuitBreaker(state machine) → Flaky Service. Three states: CLOSED (pass through), OPEN (fail fast after threshold failures), HALF_OPEN (test one request after cooldown). Timeouts count as failures. State transitions are logged with timestamps.',
    keyInsight: 'A circuit breaker is NOT a retry mechanism — retries assume the failure is transient and keep hammering (making things worse during real outages). A breaker stops trying altogether, giving the downstream service breathing room to recover. The HALF_OPEN state is the clever part: it tests recovery with exactly one request instead of immediately reopening the floodgates.',
    stack: ['Python', 'Flask'],
    concepts: ['CLOSED/OPEN/HALF_OPEN state machine', 'Fail-fast pattern', 'Cascading failure prevention', 'Timeout as failure'],
    path: 'learning/system-design/circuit-breaker',
  },
];

const patternStyles: Record<string, string> = {
  'Rate Limiting':        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Rate Limiting (Distributed)': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Horizontal Scaling':   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Async Processing / Message Queue': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Serverless Architecture': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Data Partitioning / Sharding': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Resilience / Fault Tolerance': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

// ─── Interview topics ─────────────────────────────────────────────────────────
const interviewTopics = [
  {
    title: 'Rate Limiting Deep Dive',
    questions: [
      'Token bucket vs sliding window vs fixed window — trade-offs?',
      'Why Redis over in-memory for distributed rate limiting?',
      'How do you handle race conditions atomically?',
      'What HTTP headers should a rate-limited response include?',
      'Fail-open vs fail-closed when Redis goes down?',
    ],
  },
  {
    title: 'Load Balancing & Scaling',
    questions: [
      'Round-robin vs least-connections — when to use each?',
      'What happens if a backend server goes down?',
      'Why can\'t you load-balance a server storing session data in memory?',
      'What is the difference between a load balancer and a reverse proxy?',
      'How do health checks work?',
    ],
  },
  {
    title: 'Message Queues',
    questions: [
      'Message queue vs pub-sub — key difference?',
      'How do you handle a message that keeps failing?',
      'Why use a queue instead of a background thread?',
      'What is back-pressure and why does prefetch_count matter?',
      'How would you scale workers for 100× order volume?',
    ],
  },
  {
    title: 'Serverless & Cloud',
    questions: [
      'Serverless vs containers vs VMs — trade-offs?',
      'What is a cold start and how do you reduce it?',
      'When would you NOT choose Lambda?',
      'How does API Gateway connect to Lambda?',
      'How do you secure a serverless API?',
    ],
  },
  {
    title: 'Consistent Hashing & Sharding',
    questions: [
      'Why is consistent hashing better than key % N for a distributed cache?',
      'What are virtual nodes and why are they needed?',
      'How would you handle a single hot key overwhelming one node?',
      'How does consistent hashing compare to rendezvous (HRW) hashing?',
      'Name real systems that use consistent hashing.',
    ],
  },
  {
    title: 'Circuit Breaker & Resilience',
    questions: [
      'What is a circuit breaker and why would you use one?',
      'How is a circuit breaker different from a retry mechanism?',
      'How would you decide the failure threshold and cooldown period?',
      'What happens to requests when the circuit is OPEN?',
      'Where have you seen this pattern used in real systems?',
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SystemDesign() {
  return (
    <div className="space-y-16">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">System Design</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          {caseStudies.length} hands-on system design builds — each demonstrates a core architectural pattern
          with working code, not just diagrams. Click any case study for the source, or drill the interview
          questions below.
        </p>
      </div>

      {/* Case Studies */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold">Case Studies</h2>
        <div className="space-y-6">
          {caseStudies.map((cs) => (
            <article
              key={cs.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Header bar */}
              <div className="flex flex-wrap items-start justify-between gap-3 p-5 bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${patternStyles[cs.pattern] ?? 'bg-gray-100 text-gray-600'}`}>
                      {cs.pattern}
                    </span>
                    <span className="text-xs text-gray-400">{cs.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{cs.title}</h3>
                </div>
                <code className="text-xs text-gray-400 dark:text-gray-500 font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                  {cs.path}
                </code>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Problem */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">The Problem</div>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{cs.problem}"</p>
                </div>

                {/* Architecture */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Architecture</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 rounded p-3 leading-relaxed">
                    {cs.architecture}
                  </p>
                </div>

                {/* Key insight */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Key Insight</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{cs.keyInsight}</p>
                </div>

                {/* Concepts + Stack */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap gap-1.5">
                    {cs.concepts.map((c) => (
                      <span key={c} className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    {cs.stack.map((t) => (
                      <span key={t} className="px-2 py-0.5 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interview Questions by Topic */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold">Interview Questions by Pattern</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {interviewTopics.map((topic) => (
            <div
              key={topic.title}
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <h3 className="font-semibold mb-3">{topic.title}</h3>
              <ul className="space-y-2">
                {topic.questions.map((q) => (
                  <li key={q} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5">→</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Full Q&A answers →{' '}
          <Link to="/interview" className="underline hover:text-gray-900 dark:hover:text-white">
            Interview Prep page
          </Link>
        </p>
      </section>

    </div>
  );
}
