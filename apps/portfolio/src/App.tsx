import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded route components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Learning = lazy(() => import('./pages/Learning'));
const LearningCategory = lazy(() => import('./pages/LearningCategory'));
const Interview = lazy(() => import('./pages/Interview'));
const SystemDesign = lazy(() => import('./pages/SystemDesign'));
const About = lazy(() => import('./pages/About'));
const Resume = lazy(() => import('./pages/Resume'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/*" element={<Projects />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/learning/:categoryId" element={<LearningCategory />} />
            <Route path="/interview/*" element={<Interview />} />
            <Route path="/system-design/*" element={<SystemDesign />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
