
/**
 * Centralized error handling utilities.
 * Use these throughout the app for consistent error management.
 */

export class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/** Well-known error codes */
export const ErrorCode = {
    AUTH_FAILED: 'AUTH_FAILED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_ERROR: 'API_ERROR',
    PARSE_ERROR: 'PARSE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

/** Extract a human-readable message from any thrown value */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) return error.message;
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Ocurrió un error inesperado.';
}

/** Returns true if the error is a network/fetch failure */
export function isNetworkError(error: unknown): boolean {
    return (
        error instanceof TypeError &&
        (error.message.includes('fetch') || error.message.includes('network'))
    );
}

/** Returns true if the error is an authentication error */
export function isAuthError(error: unknown): boolean {
    return error instanceof AppError && error.code === ErrorCode.AUTH_FAILED;
}

/**
 * Log errors consistently. In development, logs to console.
 * Swap the body of this function for a real error-tracking service in production.
 */
export function logError(error: unknown, context?: string): void {
    if (import.meta.env.DEV) {
        const prefix = context ? `[${context}]` : '[Error]';
        console.error(prefix, error);
    }
    // TODO: replace with Sentry / Datadog in production:
    // Sentry.captureException(error, { extra: { context } });
}

/**
 * Wrap any async call and return { data, error } instead of throwing.
 * Useful in event handlers where you can't use try/catch cleanly.
 */
export async function safeAsync<T>(
    fn: () => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: string }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (err) {
        return { data: null, error: getErrorMessage(err) };
    }
}
