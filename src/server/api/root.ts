import z from 'zod';

import { publicProcedure, router } from './trpc';
import { Challenge, createChallenge, verifyChallenge, verifyStablePow } from '@/utils/pow';
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
      const [errorChallenge, challengeData] = tryCatch(() => verifyChallenge(input.pow.challenge));
      if (errorChallenge) {
        throw new Error(`❌ Invalid challenge: ${errorChallenge?.message}`);
      }

      const challenge = challengeData as Challenge;

      if (
        !verifyStablePow(
          {
            challenge: input.pow.challenge,
            data: input.request,
            nonces: input.pow.nonces,
          },
          {
            difficulty: challenge.difficulty,
            count: challenge.count,
          },
        )
      ) {
        throw new Error('❌ Invalid PoW');
      }

      return '✅ Valid';
    }),
});

export type TrpcRouter = typeof trpcRouter;
