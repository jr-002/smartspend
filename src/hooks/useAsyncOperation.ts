import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsyncOperation<T>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await asyncFn();
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (error) {
      console.error('Async operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errorObj = new Error(errorMessage);
      setState({ data: null, isLoading: false, error: errorObj });
      // Don't re-throw the error, let the component handle it gracefully
      return null;
    }
  }, []);

  return {
    ...state,
    execute,
  };
}
