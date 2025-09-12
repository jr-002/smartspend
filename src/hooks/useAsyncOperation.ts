import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

export function useAsyncOperation<T>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    retryCount: 0,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>, maxRetries: number = 3) => {
    // Prevent concurrent executions
    if (state.isLoading) {
      console.warn('Async operation already in progress, skipping');
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, retryCount: prev.retryCount + 1 }));
    try {
      const result = await asyncFn();
      setState({ data: result, isLoading: false, error: null, retryCount: 0 });
      return result;
    } catch (error) {
      console.error('Async operation failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      const errorObj = new Error(errorMessage);
      
      // Implement exponential backoff retry
      if (state.retryCount < maxRetries) {
        const delay = Math.pow(2, state.retryCount) * 1000;
        setTimeout(() => {
          execute(asyncFn, maxRetries);
        }, delay);
        return null;
      }
      
      setState({ data: null, isLoading: false, error: errorObj, retryCount: state.retryCount });
      return null;
    }
  }, [state.isLoading, state.retryCount]);

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, isLoading: false, error: null, retryCount: 0 });
    }, []),
  };
}
