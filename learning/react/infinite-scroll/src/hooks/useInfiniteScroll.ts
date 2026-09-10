import { useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * The callback to execute when the observed element enters the viewport.
   */
  onIntersect: () => void;
  /**
   * Whether the observer is currently active (e.g., set to false if loading or no more data).
   */
  enabled?: boolean;
  /**
   * Optional configuration for the IntersectionObserver.
   */
  options?: IntersectionObserverInit;
}

/**
 * A custom hook that provides a ref to attach to a sentinel element.
 * When the sentinel element intersects with the viewport, the provided callback is executed.
 * 
 * Why this is built this way:
 * 1. IntersectionObserver is vastly more performant than listening to the 'scroll' event.
 * 2. We use a useCallback to return the ref so we are notified exactly when the DOM element is mounted/unmounted.
 * 3. We manage the observer instance in a useRef to persist it across renders.
 * 4. We ensure cleanup in the callback ref to prevent memory leaks.
 */
export const useInfiniteScroll = ({
  onIntersect,
  enabled = true,
  options = { rootMargin: '100px' },
}: UseInfiniteScrollOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // We use useCallback here because we need to know when the ref is attached to the DOM node.
  // A standard useRef wouldn't trigger a re-render or effect when attached.
  const targetRef = useCallback(
    (node: HTMLElement | null) => {
      // If we are not enabled (e.g., currently loading), we don't want to observe.
      if (!enabled) return;
      
      // Clean up the previous observer if it exists before creating a new one.
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        // Create a new IntersectionObserver instance.
        observerRef.current = new IntersectionObserver((entries) => {
          // If the sentinel is intersecting (visible), trigger the callback.
          if (entries[0].isIntersecting) {
            onIntersect();
          }
        }, options);

        // Start observing the target node.
        observerRef.current.observe(node);
      }
    },
    [enabled, onIntersect, options]
  );

  return targetRef;
};
