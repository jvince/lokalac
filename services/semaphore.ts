export interface Semaphore {
  run<T>(operation: () => Promise<T>, waitMs?: number): Promise<T>;
}

export class SemaphoreTimeoutError extends Error {}

export function createSemaphore(maxConcurrent: number): Semaphore {
  if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
    throw new TypeError("Semaphore concurrency must be a positive integer.");
  }

  let active = 0;
  const waiting: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
    timeout?: ReturnType<typeof setTimeout>;
  }> = [];

  const acquire = async (waitMs?: number) => {
    if (active < maxConcurrent) {
      active += 1;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const waiter = {
        resolve,
        reject,
        timeout: undefined as ReturnType<typeof setTimeout> | undefined,
      };

      if (waitMs !== undefined) {
        waiter.timeout = setTimeout(() => {
          const index = waiting.indexOf(waiter);

          if (index !== -1) {
            waiting.splice(index, 1);
            reject(new SemaphoreTimeoutError());
          }
        }, waitMs);
      }

      waiting.push(waiter);
    });
    active += 1;
  };

  const release = () => {
    active -= 1;
    const waiter = waiting.shift();

    if (waiter) {
      clearTimeout(waiter.timeout);
      waiter.resolve();
    }
  };

  return {
    async run<T>(operation: () => Promise<T>, waitMs?: number): Promise<T> {
      await acquire(waitMs);

      try {
        return await operation();
      } finally {
        release();
      }
    },
  };
}
