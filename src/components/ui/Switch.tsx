import * as RadixSwitch from '@radix-ui/react-switch';

import { cn } from '@/utils/utils';

interface SwitchProps {
  checked: boolean;
  id?: string;
  className?: string;
  onChange?: (value: boolean) => void;
}

export default function Switch(props: SwitchProps) {
  return (
    <RadixSwitch.Root
      id={props.id}
      className={cn(
        'data-[state=checked]:bg-text h-[20px] w-[36px] cursor-pointer rounded-full bg-[#ccd5dd] transition-colors outline-none',
        props.className,
      )}
      checked={props.checked}
      onCheckedChange={(value) => props.onChange?.(value)}
    >
      <RadixSwitch.Thumb className="block size-[16px] translate-x-0.5 rounded-full bg-white transition-transform duration-300 will-change-transform data-[state=checked]:translate-x-[18px]" />
    </RadixSwitch.Root>
  );
}
