const stats = [
  { value: "Free", label: "No account needed" },
  { value: "Private", label: "Data stays in your browser" },
  { value: "8 checks", label: "Real ATS scoring rules" },
  { value: "PDF & PNG", label: "Instant export" },
];

export default function SocialProof() {
  return (
    <section className="bg-ink px-6 py-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.value} className="flex flex-col items-center gap-1 px-4 py-4 text-center">
            <span className="font-display text-2xl font-bold text-white md:text-3xl">
              {stat.value}
            </span>
            <span className="text-xs uppercase tracking-wide text-white/60">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
