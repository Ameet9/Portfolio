import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Daily Builds',
    description: 'Hands-on projects covering full-stack, systems, and DSA',
    path: '/projects',
    count: '26',
  },
  {
    title: 'Engineering Notes',
    description: 'Deep technical learning notes on core mechanics',
    path: '/learning',
    count: '16',
  },
  {
    title: 'System Design',
    description: 'Architecture case studies with code and trade-offs',
    path: '/system-design',
    count: '10',
  },
  {
    title: 'Interview Prep',
    description: 'Senior-level Q&A extracted from actual project work',
    path: '/interview',
    count: '36',
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-20 pb-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-8">
          Senior Engineer Lab
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          A complete public demonstration of how I think, learn, design, build, secure,
          test, deploy, observe, debug, optimize, and scale software systems in the AI era.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/projects"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Explore Daily Builds
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
              className="group p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-950"
            >
              <div className="text-4xl font-black mb-3 text-gray-900 dark:text-white">
                {item.count}
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-3xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">The Engineering Philosophy</h2>
        <div className="space-y-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            This is <strong className="text-gray-900 dark:text-white font-semibold">not</strong> a collection of tutorials or toy projects.
            Every piece of code here exists to demonstrate a specific architectural decision, algorithm, or scaling technique.
          </p>
          <p>
            I optimize for <strong className="text-gray-900 dark:text-white font-semibold">depth</strong>,
            engineering judgment, correctness, maintainability, and trade-off awareness —
            because senior engineering is about knowing <em>why</em> a pattern works, not just <em>how</em> to type it.
          </p>
        </div>
      </section>
    </div>
  );
}
