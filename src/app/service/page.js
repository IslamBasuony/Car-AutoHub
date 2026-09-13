import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/ui/Icon";

const services = [
  { icon: "droplet", title: "Oil Change", desc: "Fast, reliable oil changes to keep your engine running smoothly." },
  { icon: "headset", title: "Support", desc: "Round-the-clock assistance whenever and wherever you need it." },
  { icon: "shield", title: "Car Insurance", desc: "Comprehensive coverage plans tailored to your driving needs." },
  { icon: "wrench", title: "Parts Repair", desc: "Quality repairs using genuine parts for long-lasting results." },
  { icon: "car", title: "Car Selling", desc: "A straightforward process to sell your car at a fair price." },
  { icon: "battery", title: "Battery Replacement", desc: "Quick diagnostics and replacement for lasting power." },
];

export default function Page() {
  return (
    <div className="page-container max-w-6xl pb-16">
      <div className="max-w-2xl mb-12 animate-fade-up">
        <span className="eyebrow mb-2">
          <Icon name="wrench" size={14} />
          What we offer
        </span>
        <h1 className="page-title mb-3">Our Services</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Professional, reliable service handled by our team — from routine
          maintenance to full support.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={(i % 3) * 80} className="h-full">
            <article className="card card-hover p-7 flex flex-col items-start h-full group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-color)] mb-5 transition-transform duration-300 group-hover:scale-110">
                <Icon name={s.icon} size={22} strokeWidth={1.75} />
              </div>
              <h2 className="font-semibold text-lg mb-2">{s.title}</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {s.desc}
              </p>
              <Link
                href="/service"
                aria-label={`Learn more about ${s.title}`}
                tabIndex={-1}
                className="mt-auto pt-4 inline-flex w-full justify-center sm:justify-start"
              >
                <span className="btn btn-sm btn-ghost w-full sm:w-auto !text-[var(--brand-color)] hover:!bg-[var(--brand-soft)]">
                  Learn more
                  <Icon name="arrow-right" size={13} />
                </span>
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}