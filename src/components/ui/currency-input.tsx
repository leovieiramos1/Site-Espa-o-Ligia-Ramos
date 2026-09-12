"use client";

import { useState } from "react";
import { centsToCurrencyDisplay, formatCurrencyMask, parseCurrencyDisplay } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function CurrencyInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(() => (value ? centsToCurrencyDisplay(value) : ""));

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
        R$
      </span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder ?? "0,00"}
        value={display}
        onChange={(e) => {
          const formatted = formatCurrencyMask(e.target.value);
          setDisplay(formatted);
          onChange(parseCurrencyDisplay(formatted));
        }}
        className="w-full rounded-xl border border-line bg-card py-2 pl-10 pr-3.5 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none"
      />
    </div>
  );
}
