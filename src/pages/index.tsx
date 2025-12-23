import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import jwt from 'jsonwebtoken';
import { useEffect, useMemo } from 'react';
import { CgSpinner } from 'react-icons/cg';

import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { usePowWorker } from '@/hooks/usePowSolver';
import { Challenge, StablePowOpts } from '@/utils/pow';
import { tryCatch } from '@/utils/promises';
import { trpc } from '@/utils/trpc';
import { cn } from '@/utils/utils';

const defaultData = {
  send: 'bitcoin',
  receive: 'litecoin',
  sendStringAmount: '0.001',
  receiveStringAmount: '0.5',
};

export default function Index() {
  const challengeMutation = trpc.challenge.useMutation();
  const { solvePoW } = usePowWorker();

  const form = useForm({
    onSubmit: async ({ value }) => {
      const data = tryCatch(() => JSON.parse(value.data))[1] ?? value.data;
      powMutation.mutate({
        data: data,
        opts: { difficulty: Number(value.difficulty), count: Number(value.count) },
      });
    },
    defaultValues: {
      data: JSON.stringify(defaultData, null, 2),
      challenge: '',
      difficulty: '3',
      count: '20',
    },
  });

  const challengeParsed = useMemo(
    () => (challengeMutation.data ? jwt.decode(challengeMutation.data) : null) as Challenge | null,
    [challengeMutation.data],
  );

  useEffect(() => {
    if (!challengeMutation.data || !challengeParsed) {
      return;
    }

    form.reset({
      data: form.getFieldValue('data'),
      challenge: challengeMutation.data,
      difficulty: String(challengeParsed.difficulty),
      count: String(challengeParsed.count),
    });
  }, [form, challengeMutation.data, challengeParsed]);

  const powMutation = useMutation({
    mutationFn: async ({ data, opts }: { data: any; opts: StablePowOpts }) => {
      const startTime = performance.now();
      const result = await solvePoW(data, opts);
      const endTime = performance.now();

      return {
        result,
        solveTime: (endTime - startTime).toFixed(0),
      };
    },
  });

  return (
    <div className={cn('flex w-full flex-col gap-20 md:flex-row')}>
      <div className="w-full md:w-96">
        <div className="mb-14">
          <h1 className="mb-4 text-xl">1. Challenge from server</h1>
          <div className="mb-6 space-y-6">
            <div>
              <div className="mb-2 text-sm">Raw</div>
              <pre className="mb-2 h-16 w-full rounded-md bg-gray-100 p-2 text-xs break-all whitespace-pre-wrap">
                {challengeMutation.data}
              </pre>
            </div>
            <div>
              <div className="mb-2 text-sm">Parsed</div>
              <pre className="h-[112px] w-full rounded-md bg-gray-100 p-2 text-xs">
                {challengeParsed ? JSON.stringify(challengeParsed, null, 2) : ' '}
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              onClick={() => challengeMutation.mutate()}
              disabled={challengeMutation.isPending}
            >
              Fetch challenge
            </Button>
            {challengeMutation.isPending && (
              <CgSpinner
                className={cn('animate-spin duration-300')}
                size={32}
              />
            )}
          </div>
        </div>
        <div className="mb-14">
          <h1 className="mb-4 text-xl">2. Request</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="space-y-6">
              <form.Field name="challenge">
                {(field) => (
                  <div>
                    <div className="mb-2 text-sm">Challenge</div>
                    <TextArea
                      className="h-24 w-full resize-none text-xs"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="data">
                {(field) => (
                  <div>
                    <div className="mb-2 text-sm">Data</div>
                    <TextArea
                      className="h-32 w-full resize-none text-xs"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </div>
                )}
              </form.Field>
              <div className="flex gap-4">
                <form.Field name="difficulty">
                  {(field) => (
                    <div className="w-full">
                      <div className="mb-2 text-sm">Difficulty</div>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 - 000...</SelectItem>
                          <SelectItem value="4">4 - 0000...</SelectItem>
                          <SelectItem value="5">5 - 00000...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
                <form.Field name="count">
                  {(field) => (
                    <div className="w-full">
                      <div className="mb-2 text-sm">Count</div>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={powMutation.isPending}
                >
                  Mine request
                </Button>
                {powMutation.isPending && (
                  <CgSpinner
                    className={cn('animate-spin duration-300')}
                    size={32}
                  />
                )}
                {powMutation.data?.result && (
                  <div className="flex items-center gap-3 text-sm">
                    <div>⏱️ {powMutation.data.solveTime} ms</div>
                    <div>
                      #️⃣ {powMutation.data.result.debug.hashes.toLocaleString(undefined, {})} hashes
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {powMutation.data?.result && (
        <div className="w-full md:w-96">
          <h1 className="mb-4 text-xl">3. Request to send</h1>
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm">Headers</div>
              <pre className="w-full rounded-md bg-gray-100 p-2 text-xs break-all whitespace-pre-wrap">
                x-pow-challenge: {challengeMutation.data}
                <br />
                <br />
                x-pow-nonces:
                {JSON.stringify(powMutation.data.result.nonces)}
              </pre>
            </div>
            <div>
              <div className="mb-2 text-sm">Body</div>
              <pre className="w-full rounded-md bg-gray-100 p-2 text-xs">
                {JSON.stringify(powMutation.data.result.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
