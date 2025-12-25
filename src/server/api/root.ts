import z from 'zod';

import { publicProcedure, router } from './trpc';
import { createChallenge, verifyChallenge } from '@/utils/pow';

export const trpcRouter = router({
  challenge: publicProcedure.mutation(async () => {
    return createChallenge();
  }),
  request: publicProcedure
    .input(
      z.object({
        pow: z.object({ challenge: z.string(), nonces: z.array(z.number()) }),
        request: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(input.pow);
      console.log(input.request);
      if (!verifyChallenge(input.pow.challenge)) {
        throw new Error('Invalid challenge');
      }
      return true;
    }),
});

export type TrpcRouter = typeof trpcRouter;
