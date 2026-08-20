import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Projects',
    description: '10 flagship projects demonstrating production engineering',
    path: '/projects',
    count: '10',
  },
  {
    title: 'Learning',
    description: 'Deep technical notes following the 21-section template',
    path: '/learning',
    count: '100+',
  },
  {
    title: 'System Design',
    description: 'Architecture case studies with trade-off analysis',
    path: '/system-design',
    count: '14',
  },
  {
    title: 'Interview Prep',
    description: 'Senior-level interview notes organized by technology',
    path: '/interview',
    count: '25+',
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Senior Engineer Lab
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          A complete public demonstration of how I think, learn, design, build, secure,
          test, deploy, observe, debug, optimize, scale and continuously improve software
          systems in the AI era.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/projects"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View Projects
          </Link>
          <Link
            to="/learning"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Engineering Notebook
          </Link>
        </div>
      </section>

      {/* Highlights Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="text-3xl font-bold mb-2">{item.count}</div>
              <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Engineering Philosophy</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p>
            This is <strong className="text-gray-900 dark:text-white">not</strong> a collection of tutorials or toy projects.
            Every project demonstrates real engineering: architecture decisions, security,
            testing, deployment, observability, and performance optimization.
          </p>
          <p>
            Optimizing for <strong className="text-gray-900 dark:text-white">depth</strong>,
            engineering judgment, correctness, maintainability, and trade-off awareness —
            not for the number of repositories or technologies listed.
          </p>
        </div>
      </section>
    </div>
  );
}
