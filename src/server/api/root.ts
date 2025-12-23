import { publicProcedure, router } from './trpc';
import { createChallenge } from '@/utils/pow';

export const trpcRouter = router({
  challenge: publicProcedure.mutation(async () => {
    return createChallenge();
  }),
});

export type TrpcRouter = typeof trpcRouter;
