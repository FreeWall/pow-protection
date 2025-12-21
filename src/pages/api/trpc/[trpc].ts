import { createNextApiHandler } from '@trpc/server/adapters/next';

import { trpcRouter } from '@/server/api/root';
import { createContext } from '@/server/api/trpc';

export default createNextApiHandler({
  router: trpcRouter,
  createContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(`tRPC failed on ${path}: ${error}`);
        }
      : undefined,
});
