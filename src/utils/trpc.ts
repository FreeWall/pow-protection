import { httpLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

import { type TrpcRouter } from '@/server/api/root';

export const trpc = createTRPCNext<TrpcRouter>({
  config() {
    const url = '/api/trpc';

    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpLink({
          url,
        }),
      ],
      url,
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      },
    };
  },
  ssr: false,
});

export type RouterInputs = inferRouterInputs<TrpcRouter>;
export type RouterOutputs = inferRouterOutputs<TrpcRouter>;
