
import { useState, useCallback, useEffect, useRef } from 'react';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
    /** Execute an async operation and track its state */
    run: (promise: Promise<T>) => Promise<T | null>;
    /** Reset state back to initial */
    reset: () => void;
}

/**
 * Generic hook for managing async operations.
 *
 * Usage:
 *   const { data, loading, error, run } = useAsync<User[]>();
 *   useEffect(() => { run(fetchUsers(userId)); }, [userId]);
 */
export function useAsync<T>(context?: string): UseAsyncReturn<T> {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    // Track whether the component is still mounted to prevent state updates after unmount
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const run = useCallback(async (promise: Promise<T>): Promise<T | null> => {
        if (!mountedRef.current) return null;
        setState({ data: null, loading: true, error: null });

        try {
            const data = await promise;
            if (mountedRef.current) {
                setState({ data, loading: false, error: null });
            }
            return data;
        } catch (err) {
            logError(err, context);
            const message = getErrorMessage(err);
            if (mountedRef.current) {
                setState({ data: null, loading: false, error: message });
            }
            return null;
        }
    }, [context]);

    const reset = useCallback(() => {
        if (mountedRef.current) {
            setState({ data: null, loading: false, error: null });
        }
    }, []);

    return { ...state, run, reset };
}
