import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue';

// Module-level cache to share across instances (SWR pattern)
const cache = new Map<string, any>();

export function useFetch<T>(urlOrGetter: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const isFetching = ref(false);

  watchEffect((onCleanup) => {
    const url = toValue(urlOrGetter);
    
    // Stale-While-Revalidate: Return stale data immediately if available
    if (cache.has(url)) {
      data.value = cache.get(url) as T;
    } else {
      data.value = null; // Clear if no cache
    }
    
    error.value = null;
    isFetching.value = true;
    
    const controller = new AbortController();
    
    onCleanup(() => {
      controller.abort();
    });

    let attempt = 0;
    const maxRetries = 3;

    const executeFetch = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        
        data.value = json;
        cache.set(url, json);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log(`Fetch aborted for: ${url}`);
          return;
        }
        
        if (attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s backoff
          console.warn(`Fetch failed. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          if (!controller.signal.aborted) {
            await executeFetch();
          }
        } else {
          error.value = err instanceof Error ? err : new Error(String(err));
        }
      } finally {
        if (!controller.signal.aborted) {
            isFetching.value = false;
        }
      }
    };

    executeFetch();
  });

  return { data, error, isFetching };
}
