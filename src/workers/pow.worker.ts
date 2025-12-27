import { StablePowOpts, solveStablePow } from '@/utils/pow';

self.onmessage = async (
  e: MessageEvent<{ id: string; challenge: string; opts: StablePowOpts }>,
) => {
  const result = await solveStablePow(e.data.challenge, e.data.opts);
  self.postMessage({ id: e.data.id, result });
};
