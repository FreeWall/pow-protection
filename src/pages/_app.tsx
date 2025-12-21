import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/components/Layout';
import { StorageProvider } from '@/stores/storage';
import { trpc } from '@/utils/trpc';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no"
        />
        <title>PoW protection</title>
      </Head>

      <QueryClientProvider client={queryClient}>
        <StorageProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </StorageProvider>
      </QueryClientProvider>
    </>
  );
}

export default trpc.withTRPC(App);
