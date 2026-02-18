// ==================== Custom Hook for API Calls with State Management ====================

import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';
import { handleApiError, showErrorAlert, showSuccessAlert } from '../utils/errorHandler';
import logger from '../utils/logger';
import type { LoadingState } from '../types/api.types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessMessage?: boolean;
  successMessage?: string;
  showErrorMessage?: boolean;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');

  const execute = useCallback(
    async (
      apiCall: () => Promise<AxiosResponse<any>>,
      customOptions?: UseApiOptions
    ): Promise<T | null> => {
      const opts = { ...options, ...customOptions };
      
      try {
        setLoading('loading');
        setError(null);

        const response = await apiCall();
        const responseData = response.data?.data || response.data;

        setData(responseData);
        setLoading('success');

        if (opts.showSuccessMessage) {
          showSuccessAlert(opts.successMessage || 'Operation successful');
        }

        if (opts.onSuccess) {
          opts.onSuccess(responseData);
        }

        return responseData;
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        setLoading('error');

        if (opts.showErrorMessage !== false) {
          showErrorAlert(err);
        }

        if (opts.onError) {
          opts.onError(err);
        }

        logger.error('API call failed', err);
        return null;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading('idle');
  }, []);

  return {
    data,
    error,
    loading,
    isLoading: loading === 'loading',
    isSuccess: loading === 'success',
    isError: loading === 'error',
    execute,
    reset,
  };
}

// Specialized hook for list data with pagination support
export function useApiList<T = any>(options: UseApiOptions = {}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const api = useApi<T[]>(options);

  const loadMore = useCallback(
    async (apiCall: () => Promise<AxiosResponse<any>>) => {
      const result = await api.execute(apiCall);
      if (result) {
        setItems((prev) => [...prev, ...result]);
        setHasMore(result.length > 0);
        setPage((p) => p + 1);
      }
    },
    [api]
  );

  const refresh = useCallback(
    async (apiCall: () => Promise<AxiosResponse<any>>) => {
      setItems([]);
      setPage(1);
      setHasMore(true);
      const result = await api.execute(apiCall);
      if (result) {
        setItems(result);
        setHasMore(result.length > 0);
      }
    },
    [api]
  );

  return {
    ...api,
    items,
    page,
    hasMore,
    loadMore,
    refresh,
  };
}
