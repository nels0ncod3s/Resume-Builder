const stats = [
  { value: "9", label: "Matching document templates" },
  { value: "8", label: "Practical resume checks" },
  { value: "Private", label: "Saved only in your browser" },
  { value: "PDF + PNG", label: "Export when you are ready" },
];

export default function SocialProof() {
  return (
    <section className="border-y border-line bg-paper px-6 py-7">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-line md:grid-cols-4 md:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.value} className="flex flex-col items-center gap-1 px-4 py-4 text-center">
            <span className="font-display text-2xl font-bold text-ink md:text-3xl">
              {stat.value}
            </span>
            <span className="max-w-[150px] text-[10px] font-semibold uppercase text-ink-soft">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
