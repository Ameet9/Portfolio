import { Link, useParams } from 'react-router-dom';

const allCategories = [
  { id: 'javascript', name: 'JavaScript', icon: '📜' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'vue', name: 'Vue', icon: '💚' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'fastapi', name: 'FastAPI', icon: '⚡' },
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
  { id: 'redis', name: 'Redis', icon: '🔴' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'system-design', name: 'System Design', icon: '🏗️' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️' },
  { id: 'ai', name: 'AI Engineering', icon: '🤖' },
  { id: 'testing', name: 'Testing', icon: '🧪' },
  { id: 'performance', name: 'Performance', icon: '🚀' },
  { id: 'observability', name: 'Observability', icon: '📊' },
];

const jsTopics = [
  { id: '01', title: 'Execution Context & Call Stack', path: '01-execution-context-call-stack' },
  { id: '02', title: 'The Event Loop', path: '02-event-loop' },
  { id: '03', title: 'Promises & Microtasks', path: '03-promises' },
  { id: '04', title: 'Async / Await', path: '04-async-await' },
  { id: '05', title: 'Closures & Scope Chain', path: '05-closures-scope' },
  { id: '06', title: 'Hoisting', path: '06-hoisting' },
  { id: '07', title: 'Prototypes & Prototype Chain', path: '07-prototypes' },
  { id: '08', title: 'this, bind, call, apply', path: '08-this-bind-call-apply' },
  { id: '09', title: 'Modules (ESM vs CJS)', path: '09-modules' },
  { id: '10', title: 'Generators & Iterators', path: '10-generators-iterators' },
  { id: '11', title: 'Symbols', path: '11-symbols' },
  { id: '12', title: 'WeakMap & WeakSet', path: '12-weakmap-weakset' },
  { id: '13', title: 'Garbage Collection', path: '13-garbage-collection' },
  { id: '14', title: 'Browser APIs', path: '14-browser-apis' },
  { id: '15', title: 'Concurrency Patterns', path: '15-concurrency-patterns' },
  { id: '16', title: 'Debouncing & Throttling', path: '16-debouncing-throttling' },
];

export default function LearningCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const category = allCategories.find((c) => c.id === categoryId);
  
  if (!category) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link to="/learning" className="text-blue-600 hover:underline">Back to Learning</Link>
      </div>
    );
  }

  const isJavaScript = category.id === 'javascript';

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/learning" className="hover:text-gray-900 dark:hover:text-white transition-colors">Learning</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">{category.icon}</span> {category.name} Deep Dive
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive technical notes covering mechanics, patterns, and optimization. 
          Written for a senior engineering context.
        </p>
      </div>

      {isJavaScript ? (
        <>
          {/* Topics Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {jsTopics.map((topic) => (
              <div 
                key={topic.id}
                className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col h-full"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="font-semibold text-lg leading-snug">{topic.title}</h2>
                  <span className="text-xs font-mono font-medium text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                    #{topic.id}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 flex justify-between items-end">
                  <code className="text-[11px] text-gray-400 font-mono truncate mr-4">
                    learning/javascript/{topic.path}.md
                  </code>
                  <a 
                    href={`https://github.com/ameet/portfolio/blob/master/learning/javascript/${topic.path}.md`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Read note →
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {/* Exercise Link */}
          <div className="mt-8 p-6 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-center">
            <h3 className="font-semibold mb-2">Ready to test this knowledge?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The curriculum includes a set of senior-level practical exercises covering these mechanics.
            </p>
            <code className="text-xs text-gray-500 font-mono bg-white dark:bg-black px-3 py-1.5 rounded border border-gray-200 dark:border-gray-800">
              learning/javascript/exercises.md
            </code>
          </div>
        </>
      ) : (
        <div className="p-12 mt-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900/20">
          <div className="text-4xl mb-4 opacity-50">{category.icon}</div>
          <h2 className="text-xl font-semibold mb-2">Notes coming soon</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            The deep dive notes for {category.name} will be populated in upcoming phases of the engineering lab curriculum.
          </p>
        </div>
      )}

    </div>
  );
}
