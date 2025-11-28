export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): ((...args: Parameters<T>) => ReturnType<T> | undefined) & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  const { leading = false, trailing = true, maxWait } = options;
  
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let timerId: NodeJS.Timeout | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;

  function invokeFunc(time: number) {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args) as ReturnType<T>;
    return result;
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    lastThis = undefined;
    timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced as ((...args: Parameters<T>) => ReturnType<T> | undefined) & { cancel: () => void; flush: () => ReturnType<T> | undefined };
}

// Specialized debounce for API calls with resource checking
export function debounceAPICall<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number = 500
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined>) & { cancel: () => void } {
  return debounce(func, wait, {
    leading: false,
    trailing: true,
    maxWait: wait * 3, // Prevent indefinite delays
  }) as ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined>) & { cancel: () => void };
}

// Throttle function for high-frequency events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) & { cancel: () => void } {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  function throttled(this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }

  throttled.cancel = () => {
    clearTimeout(lastFunc);
    inThrottle = false;
  };

  return throttled as ((...args: Parameters<T>) => ReturnType<T> | undefined) & { cancel: () => void };
}