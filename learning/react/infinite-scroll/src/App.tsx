import { useState, useEffect, useCallback } from 'react';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import './App.css';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${pageNumber}&_limit=10`);
      const newPosts: Post[] = await response.json();
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore]);

  // Use our custom hook
  const sentinelRef = useInfiniteScroll({
    onIntersect: loadMore,
    enabled: !loading && hasMore,
    options: { rootMargin: '150px' }
  });

  return (
    <div className="app-container">
      <header>
        <h1>Infinite Scroll Feed</h1>
      </header>
      <main>
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id} className="post-card">
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <div className="post-meta">Post #{post.id}</div>
            </li>
          ))}
        </ul>
        
        {/* The Sentinel Element */}
        <div ref={sentinelRef} className="sentinel">
          {loading && <div className="spinner"></div>}
          {!hasMore && <p>No more posts to load.</p>}
        </div>
      </main>
    </div>
  );
}

export default App;
