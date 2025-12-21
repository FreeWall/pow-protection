type ErrorOrResult<TError, TResult> = [TError, undefined?] | [null, TResult];

/**
 * Wraps a function or promise in a try-catch block and returns a tuple with an error or the result
 *
 * @example
 * // async
 * const [error, response] = await tryCatch(fetch('https://example.com'));
 * if (error) {
 *     console.error(error.message);
 *     return;
 * }
 * console.log(response.status); // 200
 *
 * @example
 * // sync
 * const [error, result] = tryCatch(() => JSON.parse('invalid json'));
 * if (error) {
 *     console.error(error.message); // Unexpected token i in JSON at position 0
 *     return;
 * }
 * console.log(result);
 */
export function tryCatch<E extends Error = Error, T = any>(
  fn: (() => PromiseLike<T>) | PromiseLike<T>,
): Promise<ErrorOrResult<E, T>>;
export function tryCatch<E extends Error = Error, T = any>(fn: () => T): ErrorOrResult<E, T>;
export function tryCatch<E extends Error = Error, T = any>(
  fn: (() => T | PromiseLike<T>) | PromiseLike<T>,
): Promise<ErrorOrResult<E, T>> | ErrorOrResult<E, T> {
  try {
    if (typeof fn === 'function') {
      const result = fn();
      if (result && result instanceof Promise) {
        return (async () => {
          try {
            return [null, await result];
          } catch (error) {
            return [(error instanceof Error ? error : new Error(String(error))) as E];
          }
        })();
      }
      return [null, result as T];
    }
    return (async () => {
      try {
        return [null, await fn];
      } catch (error) {
        return [(error instanceof Error ? error : new Error(String(error))) as E];
      }
    })();
  } catch (error) {
    return [(error instanceof Error ? error : new Error(String(error))) as E];
  }
}
