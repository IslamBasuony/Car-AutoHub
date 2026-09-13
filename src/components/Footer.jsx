import Image from "next/image";
import Link from "next/link";
import Icon from "./ui/Icon";

const carList = ["Sedan", "SUV", "Premium", "Coupe", "Hatchback", "Crossover"];

const services = [
  { label: "To Repair", icon: "wrench" },
  { label: "Maintenance", icon: "car" },
  { label: "Accidents", icon: "alert" },
  { label: "Change Oil", icon: "droplet" },
  { label: "External Faults", icon: "battery" },
  { label: "Customer Service", icon: "headset" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "New Cars", href: "/new" },
  { label: "Used Cars", href: "/cars" },
  { label: "Add a Car", href: "/cars/add" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--brand-color)]/40 to-transparent" />
      <div className="page-container py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <Image
              src="/imges/logos/nav_logo/logoCar.svg"
              alt="AutoHub logo"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <span className="text-lg font-bold tracking-tight">
              AutoHub<span className="text-[var(--brand-color)]">.</span>
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
            Browse, compare, and find your next car — sedans, SUVs, and premium
            vehicles in one place.
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Icon name="map-pin" size={14} />
            <span>New Cairo, Egypt</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
            Car List
          </h4>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {carList.map((c) => (
              <li key={c}>
                <Link href="/cars" className="link !gap-1 !text-inherit hover:text-[var(--brand-color)]">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
            Service
          </h4>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {services.map((s) => (
              <li key={s.label}>
                <Link
                  href="/service"
                  className="link !gap-1.5 !text-inherit hover:text-[var(--brand-color)]"
                >
                  <Icon name={s.icon} size={15} className="text-[var(--text-muted)]" />
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {quickLinks.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="link !gap-1 !text-inherit hover:text-[var(--brand-color)]">
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border-color)]">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} AutoHub. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Icon name="sparkles" size={14} className="text-[var(--brand-color)]" />
            Designed for a better car-buying experience.
          </p>
        </div>
      </div>
    </footer>
  );
}