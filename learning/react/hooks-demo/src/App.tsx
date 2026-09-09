import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { GitHubRepo, SearchResponse } from './types';
import './App.css';

const PER_PAGE = 30;

function App() {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce the search query by 500ms
  // This prevents hitting the GitHub API rate limit while the user is typing
  const debouncedQuery = useDebounce(query, 500);

  // Use a ref to store the current AbortController so we can cancel stale requests
  // if the query changes before the previous request finishes
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRepos = useCallback(async (searchQuery: string, pageNum: number, isNewSearch: boolean) => {
    if (!searchQuery.trim()) {
      setRepos([]);
      setHasMore(false);
      setTotalCount(0);
      return;
    }

    // Cancel any in-flight requests to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    if (isNewSearch) setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          searchQuery
        )}&page=${pageNum}&per_page=${PER_PAGE}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(response.status === 403 ? 'API Rate Limit Exceeded' : 'Failed to fetch repositories');
      }

      const data: SearchResponse = await response.json();
      
      setRepos((prev) => (isNewSearch ? data.items : [...prev, ...data.items]));
      setTotalCount(data.total_count);
      // If we got fewer items than requested, or total matched, we're at the end
      setHasMore(data.items.length === PER_PAGE);
      
    } catch (err: any) {
      // Ignore abort errors as they are intentional
      if (err.name === 'AbortError') return;
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to handle new searches when debounced query changes
  useEffect(() => {
    // Reset state for new search
    setPage(1);
    fetchRepos(debouncedQuery, 1, true);
  }, [debouncedQuery, fetchRepos]);

  // Handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRepos(debouncedQuery, nextPage, false);
  }, [page, debouncedQuery, fetchRepos]);

  // Attach infinite scroll observer
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: handleLoadMore,
  });

  return (
    <div className="container">
      <header className="header">
        <h1>GitHub Repo Explorer</h1>
        <p>A demonstration of custom React Hooks (useDebounce & useInfiniteScroll)</p>
      </header>

      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repositories... (e.g., react)"
          className="search-input"
          autoFocus
        />
        {totalCount > 0 && (
          <div className="results-count">
            Found {totalCount.toLocaleString()} repositories
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="repo-list">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-card"
          >
            <div className="repo-header">
              <img src={repo.owner.avatar_url} alt={repo.owner.login} className="avatar" />
              <h3>{repo.full_name}</h3>
            </div>
            <p className="repo-desc">{repo.description || 'No description provided.'}</p>
            <div className="repo-stats">
              <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
            </div>
          </a>
        ))}
      </div>

      {/* The Sentinel element for IntersectionObserver */}
      {(hasMore || isLoading) && (
        <div ref={sentinelRef} className="loading-container">
          {isLoading ? <div className="spinner"></div> : <div>Scroll for more...</div>}
        </div>
      )}

      {!isLoading && !hasMore && repos.length > 0 && (
        <div className="end-message">You have reached the end of the results.</div>
      )}

      {!isLoading && debouncedQuery && repos.length === 0 && !error && (
        <div className="empty-message">No repositories found for "{debouncedQuery}".</div>
      )}
    </div>
  );
}

export default App;
