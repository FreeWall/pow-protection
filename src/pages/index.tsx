import { useMutation } from '@tanstack/react-query';
import { CgSpinner } from 'react-icons/cg';

import Button from '@/components/ui/Button';
import { usePowWorker } from '@/hooks/usePowSolver';
import { StablePowOpts, verifyStablePow } from '@/utils/pow';
import { cn } from '@/utils/utils';

export default function Index() {
  const { solvePoW } = usePowWorker();

  const opts: StablePowOpts = {
    difficulty: 3,
    count: 50,
  };

  // Define the mutation
  const powMutation = useMutation({
    mutationFn: async () => {
      const startTime = performance.now();
      const result = await solvePoW({ example: 'data', rand: Math.random() }, opts);
      const endTime = performance.now();

      const startValidTime = performance.now();
      const isValid = await verifyStablePow(result, opts);
      const endValidTime = performance.now();

      return {
        result,
        isValid,
        solveTime: (endTime - startTime).toFixed(2),
        verifyTime: (endValidTime - startValidTime).toFixed(2),
      };
    },
    onSuccess: (data) => {
      console.log(`PoW Solved in ${data.solveTime}ms. Valid: ${data.isValid}`);
    },
    onError: (error) => {
      console.error('PoW Failed:', error);
    },
  });

  return (
    <div className={cn('')}>
      <div className="mb-4 flex items-center">
        <Button
          onClick={() => powMutation.mutate()}
          disabled={powMutation.isPending}
        >
          Solve
        </Button>
        {powMutation.isPending && (
          <CgSpinner
            className={cn('ml-2 animate-spin duration-300')}
            size={32}
          />
        )}
      </div>

      {powMutation.isError && (
        <p className="text-red-500">Error: {(powMutation.error as any).message}</p>
      )}

      {powMutation.isSuccess && (
        <>
          <div className="">
            Last result: {powMutation.data.isValid ? '✅ Valid' : '❌ Invalid'} (
            {powMutation.data.solveTime} ms / {powMutation.data.verifyTime} ms)
          </div>
          {powMutation.data?.result && (
            <pre className="mt-4 max-h-128 w-full overflow-auto rounded bg-gray-100 p-2 text-xs">
              {JSON.stringify(powMutation.data.result, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
