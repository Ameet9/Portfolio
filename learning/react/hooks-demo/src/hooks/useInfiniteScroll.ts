import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /** The threshold at which the observer should trigger (0 to 1) */
  threshold?: number;
  /** Margin around the root. Can have values similar to the CSS margin property */
  rootMargin?: string;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether an API request is currently in flight */
  isLoading: boolean;
  /** Callback to execute when the sentinel element becomes visible */
  onLoadMore: () => void;
}

/**
 * A custom hook for infinite scrolling using IntersectionObserver.
 *
 * Why IntersectionObserver instead of scroll events?
 * 1. Performance: Scroll events fire synchronously on the main thread and can fire hundreds of times per second. 
 *    IntersectionObserver is asynchronous and highly optimized by the browser, reducing jank.
 * 2. Simplicity: Calculating scroll position, element height, and viewport height manually is prone to off-by-one 
 *    errors and cross-browser inconsistencies. IntersectionObserver handles the math for us.
 */
export function useInfiniteScroll({
  threshold = 1.0,
  rootMargin = '100px', // Start loading 100px before the element comes into view to prevent visual stutter
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  // We use a ref to store the observer so it persists across renders without triggering them
  const observerRef = useRef<IntersectionObserver | null>(null);

  // We return a ref callback that the consumer will attach to the "sentinel" div at the bottom of the list.
  // Using a callback ref ensures we are notified whenever the element mounts or unmounts.
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // If we are currently loading, we don't want to trigger another load, so we skip setting up the observer.
      if (isLoading) return;

      // Disconnect the previous observer if it exists, to ensure we don't have multiple observers running
      if (observerRef.current) observerRef.current.disconnect();

      // We only want to observe if there are more items to fetch.
      // If node is null, the sentinel unmounted, so we just disconnected above.
      if (node && hasMore) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            // entries is an array of all observed elements. We only have one (the sentinel).
            // isIntersecting is true when the element crosses the threshold into the viewport.
            if (entries[0].isIntersecting && hasMore && !isLoading) {
              onLoadMore();
            }
          },
          { threshold, rootMargin }
        );

        // Start observing the sentinel element
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, onLoadMore, threshold, rootMargin]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return sentinelRef;
}
