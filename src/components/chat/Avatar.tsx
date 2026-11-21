const palette = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-teal-500"];

function colorFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
