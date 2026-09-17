import { useState, useEffect, useRef, useCallback } from 'react';

type ConnectionStatus = 'connecting' | 'open' | 'closed';

interface UseWebSocketReturn<T> {
  status: ConnectionStatus;
  latestData: T | null;
}

export function useWebSocket<T>(url: string): UseWebSocketReturn<T> {
  const [status, setStatus] = useState<ConnectionStatus>('closed');
  const [latestData, setLatestData] = useState<T | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectDelay = 30000;
  const initialReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('open');
      reconnectAttempts.current = 0; // Reset attempts on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLatestData(data);
      } catch (error) {
        console.error("Failed to parse websocket message", error);
      }
    };

    ws.onclose = () => {
      setStatus('closed');
      
      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        maxReconnectDelay,
        initialReconnectDelay * Math.pow(2, reconnectAttempts.current)
      );
      // Add random jitter to prevent thundering herd problem
      const jitter = Math.random() * 500;
      const delay = baseDelay + jitter;

      reconnectAttempts.current++;

      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // onclose will be called after onerror, so reconnect logic remains there
    };
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup function for React 18 Strict Mode and component unmount
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on explicit unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { status, latestData };
}
