import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { useTranslation } from "$hooks/useTranslation.ts";

interface CounterProps {
  count: Signal<number>;
  text: string;
}

export default function Counter(props: CounterProps) {
  const { t } = useTranslation();
  return (
    <div class="flex gap-8 py-6">
      {t(props.text)}
      <Button onClick={() => props.count.value += 10}>+10</Button>
      <Button onClick={() => props.count.value -= 1}>-1</Button>
      <p class="text-3xl tabular-nums">{props.count}</p>
      <Button onClick={() => props.count.value += 1}>+1</Button>
    </div>
  );
}
