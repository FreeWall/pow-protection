import { useCallback, useEffect, useRef } from 'react';

import { StablePoWResult, StablePowOpts } from '@/utils/pow';

export function usePowWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/pow.worker.ts', import.meta.url));

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const solvePoW = useCallback((data: any, opts: StablePowOpts): Promise<StablePoWResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        return reject(new Error('Worker not initialized'));
      }

      const messageId = (Date.now() + Math.random()).toString(36);

      const listener = (event: MessageEvent) => {
        if (event.data.id === messageId) {
          workerRef.current?.removeEventListener('message', listener);
          resolve(event.data.result);
        }
      };

      workerRef.current.addEventListener('message', listener);
      workerRef.current.postMessage({ id: messageId, data, opts });
    });
  }, []);

  return { solvePoW };
}
