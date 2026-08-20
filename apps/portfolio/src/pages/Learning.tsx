import { Link } from 'react-router-dom';

const categories = [
  { name: 'JavaScript', path: '/learning/javascript', topics: 16, icon: '📜' },
  { name: 'TypeScript', path: '/learning/typescript', topics: 15, icon: '🔷' },
  { name: 'React', path: '/learning/react', topics: 20, icon: '⚛️' },
  { name: 'Vue', path: '/learning/vue', topics: 11, icon: '💚' },
  { name: 'Python', path: '/learning/python', topics: 18, icon: '🐍' },
  { name: 'FastAPI', path: '/learning/fastapi', topics: 18, icon: '⚡' },
  { name: 'PostgreSQL', path: '/learning/postgresql', topics: 11, icon: '🐘' },
  { name: 'MongoDB', path: '/learning/mongodb', topics: 5, icon: '🍃' },
  { name: 'Redis', path: '/learning/redis', topics: 7, icon: '🔴' },
  { name: 'Security', path: '/learning/security', topics: 13, icon: '🔒' },
  { name: 'System Design', path: '/learning/system-design', topics: 14, icon: '🏗️' },
  { name: 'Cloud & DevOps', path: '/learning/cloud', topics: 15, icon: '☁️' },
  { name: 'AI Engineering', path: '/learning/ai', topics: 12, icon: '🤖' },
  { name: 'Testing', path: '/learning/testing', topics: 10, icon: '🧪' },
  { name: 'Performance', path: '/learning/performance', topics: 9, icon: '🚀' },
  { name: 'Observability', path: '/learning/observability', topics: 9, icon: '📊' },
];

export default function Learning() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Engineering Notebook</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Deep technical learning notes following the 21-section template.
          Each topic covers fundamentals, production patterns, failure scenarios,
          debugging, and interview preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            className="group p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <div className="text-2xl mb-3">{category.icon}</div>
            <h3 className="font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.topics} topics
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
