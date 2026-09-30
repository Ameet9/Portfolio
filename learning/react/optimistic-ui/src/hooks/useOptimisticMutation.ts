import { useState, useCallback, useRef } from 'react';

type MutationFunction<TData, TVariables> = (variables: TVariables) => Promise<TData>;

interface UseOptimisticMutationOptions<TData, TVariables, TState> {
  mutationFn: MutationFunction<TData, TVariables>;
  onMutate: (variables: TVariables) => TState; // Returns rollback context or expected optimistic state
  onError: (error: Error, variables: TVariables, context: TState) => void;
  onSuccess?: (data: TData, variables: TVariables, context: TState) => void;
}

export function useOptimisticMutation<TData, TVariables, TState>({
  mutationFn,
  onMutate,
  onError,
  onSuccess
}: UseOptimisticMutationOptions<TData, TVariables, TState>) {
  const [isPending, setIsPending] = useState(false);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const mutate = useCallback(async (variables: TVariables, mutationId: string) => {
    // Handle race conditions by aborting previous request for the same mutationId
    if (abortControllers.current.has(mutationId)) {
      abortControllers.current.get(mutationId)?.abort();
    }

    const controller = new AbortController();
    abortControllers.current.set(mutationId, controller);

    // Apply optimistic update and capture context for rollback
    const context = onMutate(variables);
    setIsPending(true);

    try {
      const data = await mutationFn(variables);
      
      // If aborted, don't trigger success
      if (controller.signal.aborted) return;
      
      onSuccess?.(data, variables, context);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      
      // Rollback on error
      onError(err instanceof Error ? err : new Error('Mutation failed'), variables, context);
    } finally {
      if (!controller.signal.aborted) {
        setIsPending(false);
      }
      abortControllers.current.delete(mutationId);
    }
  }, [mutationFn, onMutate, onError, onSuccess]);

  return { mutate, isPending };
}
