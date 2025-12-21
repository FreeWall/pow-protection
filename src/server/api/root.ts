import { z } from 'zod';

import { publicProcedure, router } from './trpc';
import { auth } from '@/lib/hon/auth';
import { getAcSensorData } from '@/lib/hon/sensors';

export const trpcRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await auth(input.email, input.password);
      return {
        ...data,
      };
    }),
  sensors: publicProcedure
    .input(
      z.object({
        cognitoToken: z.string(),
        idToken: z.string(),
        deviceId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await getAcSensorData(
        { idToken: input.idToken, cognitoToken: input.cognitoToken },
        input.deviceId,
      );
      return {
        ...data,
      };
    }),
});

export type TrpcRouter = typeof trpcRouter;
