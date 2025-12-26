import z from 'zod';

import { publicProcedure, router } from './trpc';
import { createChallenge, verifyChallenge, verifyStablePow } from '@/utils/pow';
import { tryCatch } from '@/utils/promises';

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
      const [errorChallenge, challenge] = tryCatch(() => verifyChallenge(input.pow.challenge));
      if (errorChallenge) {
        throw new Error(`❌ Invalid challenge: ${errorChallenge.message}`);
      }

      if (
        !verifyStablePow(
          {
            challenge: input.pow.challenge,
            data: input.request,
            nonces: input.pow.nonces,
          },
          challenge,
        )
      ) {
        throw new Error('❌ Invalid PoW');
      }

      return '✅ Valid';
    }),
});

export type TrpcRouter = typeof trpcRouter;
