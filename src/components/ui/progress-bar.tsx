export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-soft">
        <div
          className="h-full rounded-full bg-sage transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {value} / {max} sessões realizadas
      </p>
    </div>
  );
}
