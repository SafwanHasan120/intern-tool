// Retry logic with exponential backoff for transient failures
interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 10000,
  onRetry: () => {},
};

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  // Retryable: 5xx, timeouts, connection errors
  return (
    msg.includes('5') || // 5xx status
    msg.includes('timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('network') ||
    msg.includes('socket hang up')
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Wrap with timeout
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Request timeout after ${opts.timeoutMs}ms`)),
            opts.timeoutMs
          )
        ),
      ]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if retryable
      if (!isRetryableError(error) || attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calculate backoff: exponential with cap
      const delayMs = Math.min(
        opts.initialDelayMs * Math.pow(2, attempt),
        opts.maxDelayMs
      );

      opts.onRetry(attempt + 1, lastError);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Retry exhausted');
}

export async function fetchWithRetry(
  url: string,
  options?: RetryOptions & RequestInit
): Promise<Response> {
  const retryOpts = {
    maxRetries: options?.maxRetries ?? 3,
    initialDelayMs: options?.initialDelayMs ?? 1000,
    maxDelayMs: options?.maxDelayMs ?? 10000,
    timeoutMs: options?.timeoutMs ?? 10000,
    onRetry: options?.onRetry,
  };

  const fetchOpts = Object.fromEntries(
    Object.entries(options || {}).filter(
      ([key]) => !['maxRetries', 'initialDelayMs', 'maxDelayMs', 'timeoutMs', 'onRetry'].includes(key)
    )
  );

  return withRetry(() => fetch(url, fetchOpts), retryOpts);
}
