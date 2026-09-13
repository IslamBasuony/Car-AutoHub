"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTheme } from "./ThemeProvider";
import Switch from "./ui/Switch";
import Icon from "./ui/Icon";
import { IconButton } from "./ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/new", label: "New Cars" },
  { href: "/cars", label: "Used Cars" },
  { href: "/about", label: "About" },
  { href: "/service", label: "Service" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-[box-shadow,border-color,background-color] duration-300 ${
          scrolled
            ? "bg-[var(--bg-card)]/85 backdrop-blur-xl border-b border-[var(--border-color)] shadow-[var(--shadow-card)]"
            : "bg-[var(--bg-card)]/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="page-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/imges/logos/nav_logo/logoCar.svg"
              alt="AutoHub logo"
              width={36}
              height={36}
              className="w-9 h-9 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight hidden sm:inline-flex items-baseline gap-1">
              AutoHub
              <span className="text-[var(--brand-color)] font-black">.</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link"
                data-active={isActive(l.href)}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            <Link href="/cars/add" className="btn btn-sm">
              <Icon name="plus" size={14} strokeWidth={2.5} />
              Add Car
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1.5">
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            <IconButton
              label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Icon name={mobileOpen ? "x" : "menu"} size={20} />
            </IconButton>
          </div>
        </div>
      </header>

      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="md:hidden fixed inset-0 z-40 bg-black/40" />
          <DialogPrimitive.Content className="mobile-sheet md:hidden">
            <nav aria-label="Mobile" className="page-container py-4">
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l.href}>
                    <DialogPrimitive.Close asChild>
                      <Link
                        href={l.href}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                          isActive(l.href)
                            ? "bg-[var(--brand-soft)] text-[var(--brand-color)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {l.label}
                        <Icon name="chevron-right" size={16} className="text-[var(--text-muted)]" />
                      </Link>
                    </DialogPrimitive.Close>
                  </li>
                ))}
              </ul>
              <div className="pt-3 mt-3 border-t border-[var(--border-color)]">
                <DialogPrimitive.Close asChild>
                  <Link href="/cars/add" className="btn btn-lg w-full">
                    <Icon name="plus" size={16} strokeWidth={2.5} />
                    Add a Car
                  </Link>
                </DialogPrimitive.Close>
              </div>
            </nav>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}