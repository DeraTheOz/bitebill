"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { formatMoney } from "@/lib/format";

export function AnimatedAmount({
  value,
  currency,
}: {
  value: number;
  currency: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{formatMoney(displayValue, currency)}</span>;
}

