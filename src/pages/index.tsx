import Button from '@/components/ui/Button';
import { usePowWorker } from '@/hooks/usePowSolver';
import { StablePowOpts, verifyStablePow } from '@/utils/pow';
import { cn } from '@/utils/utils';

export default function Index() {
  const { solvePoW } = usePowWorker();

  const opts: StablePowOpts = {
    difficulty: 3,
    count: 20,
  };

  async function onClickSolve() {
    try {
      const startTime = performance.now();
      const result = await solvePoW({ example: 'data' }, opts);
      const endTime = performance.now();
      console.log(`PoW Result (${(endTime - startTime).toFixed(2)} ms):`, result);

      const startValidTime = performance.now();
      const valid = await verifyStablePow(result, opts);
      const endValidTime = performance.now();
      console.log(`PoW Valid (${(endValidTime - startValidTime).toFixed(2)} ms):`, valid);
    } catch (error) {
      console.error('PoW Failed:', error);
    }
  }

  return (
    <div className={cn('pt-0')}>
      <h1>PoW Solver</h1>
      <Button onClick={onClickSolve}>
        <span>Solve</span>
      </Button>
    </div>
  );
}
