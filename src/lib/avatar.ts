const palette = [
  "bg-sage-light text-sage-darker",
  "bg-gold-light text-gold",
  "bg-status-done-bg text-status-done",
  "bg-status-wait-bg text-status-wait",
  "bg-status-alert-bg text-status-alert",
];

export function getAvatarColorClass(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
