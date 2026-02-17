import useSWR, { SWRConfiguration } from 'swr';
import { apiClient } from '@/lib/api-client';

export function useApi<T>(url: string | null, config?: SWRConfiguration) {
    const fetcher = (url: string) => apiClient<T>(url);

    const { data, error, mutate, isLoading, isValidating } = useSWR<T>(
        url,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            ...config,
            // No need to handle 401 here as apiClient handles it globally
        }
    );

    return {
        data,
        error,
        mutate,
        isLoading,
        isValidating
    };
}
