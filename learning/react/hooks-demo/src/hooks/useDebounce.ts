import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * 
 * Why debounce? Without it, typing "react" fires 5 API calls (r, re, rea, reac, react).
 * Debounce waits until the user pauses typing before firing — reducing unnecessary
 * network requests and preventing out-of-order response issues.
 * 
 * Implementation: Each keystroke resets the timer. Only when the timer expires
 * (user stopped typing) does the debounced value update, triggering the API call.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cleanup: clear timeout if value changes before delay expires.
    // This is the core of debouncing — the previous timer is always cancelled.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
