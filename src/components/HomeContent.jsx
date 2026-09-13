"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCarStore } from "./CarStore";
import { BODY_TYPES } from "@/data/cars";
import Reveal from "./Reveal";
import Badge from "./ui/Badge";
import Icon from "./ui/Icon";
import CarCard from "./CarCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/Tabs";

export default function HomeContent() {
  const { cars } = useCarStore();
  const [activeTab, setActiveTab] = useState(BODY_TYPES[0]);

  const getCarsForType = (type) =>
    cars.filter((c) => c.body.toLowerCase() === type.toLowerCase());

  const stats = [
    { value: cars.length, label: "Used cars listed", icon: "car" },
    { value: BODY_TYPES.length, label: "Body types", icon: "sliders" },
    { value: "24/7", label: "Buying support", icon: "headset" },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="page-container pt-10 sm:pt-14">
          <div className="card hero-surface p-8 sm:p-12 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(700px 480px at 88% -10%, rgba(37,99,235,0.1), transparent 62%)",
              }}
            />
            <div className="relative grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
              <div className="text-center md:text-left animate-hero-in">
                <Badge tone="brand" dot={false} className="mb-5">
                  <Icon name="sparkles" size={13} strokeWidth={2.25} />
                  New arrivals weekly
                </Badge>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-balance leading-[1.08]">
                  Easy &amp; Fast <span className="text-gradient">Car Shopping</span>
                </h1>
                <p className="text-[var(--text-secondary)] text-lg mb-7 max-w-lg mx-auto md:mx-0 leading-relaxed">
                  Browse new and pre-owned sedans, SUVs, and premium vehicles —
                  find the car that fits your lifestyle.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link href="/new" className="btn btn-lg">
                    New Cars
                    <Icon name="arrow-right" size={16} />
                  </Link>
                  <Link href="/cars" className="btn btn-outline btn-lg">
                    Used Cars
                  </Link>
                  <Link href="/cars/add" className="btn btn-outline btn-lg">
                    Sell Your Car
                  </Link>
                </div>
                <dl className="mt-9 flex items-center justify-center md:justify-start gap-6 sm:gap-8">
                  {stats.map((s) => (
                    <div key={s.label} className="text-center md:text-left">
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="flex items-center justify-center md:justify-start gap-1.5 text-xl sm:text-2xl font-bold tracking-tight">
                        <Icon
                          name={s.icon}
                          size={18}
                          className="text-[var(--brand-color)]"
                        />
                        <span>{s.value}</span>
                      </dd>
                      <dd className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative hidden md:block animate-hero-in-late">
                <div className="relative w-full aspect-[4/3]">
                  <div className="absolute inset-6 rounded-[2rem] bg-[var(--brand-color)]/[0.08] blur-2xl" />
                  <div className="relative card-glass w-full h-full overflow-hidden">
                    <Image
                      src="/imges/imge_car/suv/Kia-Sportage-2023-1-transformed.png"
                      alt="Kia Sportage 2023"
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      className="object-contain p-6 image-fade"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-3 left-6 flex items-center gap-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--shadow-card-hover)] px-4 py-2 animate-float">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-color)] text-white">
                      <Icon name="check" size={13} strokeWidth={3} />
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap">Ready for pickup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Browse by Type ---------- */}
      <Reveal>
        <section className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <span className="eyebrow mb-2">
                <Icon name="sliders" size={14} />
                Explore the lineup
              </span>
              <h2 className="section-title">Browse by Type</h2>
            </div>
            <Link href="/cars" className="link">
              View all used cars <Icon name="arrow-right" size={15} />
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-2 mb-8" aria-label="Car body types">
              {BODY_TYPES.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            {BODY_TYPES.map((type) => {
              const carsForTab = getCarsForType(type);
              return (
                <TabsContent key={type} value={type} className="outline-none">
                  {carsForTab.length === 0 ? (
                    <div className="card p-12 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-color)]">
                        <Icon name="car" size={26} />
                      </div>
                      <h3 className="font-semibold mb-1">
                        No {type} cars yet
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-5">
                        Be the first to list a {type} under &ldquo;{type}&rdquo;.
                      </p>
                      <Link href="/cars/add" className="btn btn-outline btn-sm inline-flex">
                        <Icon name="plus" size={14} strokeWidth={2.5} />
                        Add the first one
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {carsForTab.map((car, i) => (
                        <Reveal key={car.id} delay={Math.min(i, 5) * 70} className="h-full">
                          <CarCard car={car}>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-[var(--brand-color)]">
                                ${car.price.toLocaleString("en-US")}
                              </span>
                              <Link href="/cars" className="btn btn-sm">
                                Details
                                <Icon name="arrow-right" size={13} />
                              </Link>
                            </div>
                          </CarCard>
                        </Reveal>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      </Reveal>

      {/* ---------- Featured: Kia K5 ---------- */}
      <Reveal>
        <section className="page-container">
          <div className="card card-hover p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center section-fade group">
            <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden card-image-frame">
              <Image
                src="/imges/logos/card_logo/kia5.jpg"
                alt="Kia K5"
                fill
                className="object-cover card-zoom-image"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <Badge tone="brand" dot={false} className="mb-4">
                <Icon name="sparkles" size={13} />
                Featured model
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                Kia K5
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-7">
                Sports car by Kia. The Kia Optima — the K5 — is currently the
                best-selling sedan around the world within the Kia fleet of
                production cars, and the new generation of it has a very modern
                design with a youthful, sporty character.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/cars/add" className="btn btn-lg">
                  <Icon name="arrow-right" size={16} />
                  Buy Now
                </Link>
                <Link href="/cars" className="btn btn-outline btn-lg">
                  View All Models
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ---------- Benefits ---------- */}
      <section className="page-container">
        <Reveal>
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow mb-2">
              <Icon name="shield" size={14} />
              Why AutoHub
            </span>
            <h2 className="section-title">Built around your journey</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Save Time",
              desc: "The car is like a technical assistant that takes you from one place to another effortlessly.",
              icon: "clock",
            },
            {
              title: "Modern Comfort",
              desc: "A qualitative leap in human life — turning luxuries into everyday necessities.",
              icon: "sparkles",
            },
            {
              title: "Trusted Quality",
              desc: "Vehicles you can rely on — new or used, backed by transparent information.",
              icon: "shield",
            },
          ].map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 80} className="h-full">
              <div className="card card-hover p-7 h-full group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-color)] mb-5 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={benefit.icon} size={22} strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- People ---------- */}
      <Reveal>
        <section className="page-container">
          <div className="card p-7 sm:p-8 flex flex-col md:flex-row gap-7 items-center section-fade-reverse">
            <div className="relative w-32 h-32 shrink-0 rounded-full overflow-hidden ring-4 ring-[var(--brand-color)]/15">
              <Image
                src="/imges/imge_car/elonmask.jpg"
                alt="Elon Musk"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h4 className="text-lg font-semibold mb-2">Elon Musk</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                A perspective on how modern vehicles are reshaping transportation —
                electric drivetrains, software-defined features, and a renewed
                focus on efficiency are changing what buyers expect from a car.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ---------- Best sellers ---------- */}
      <section className="page-container">
        <Reveal>
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow mb-2">
              <Icon name="car" size={14} />
              Most popular
            </span>
            <h2 className="section-title">Best Sellers</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              img: "/imges/imge_car/suv/Kia-Sportage-2023-1-transformed.png",
              alt: "Kia Sportage 2023",
              title: "Kia Sportage 2023",
              p1: "Kia Sportage is a best seller in the global market, with Kia selling more than half a million cars in 2022.",
              p2: "The 2023 Kia Sportage comes with a bold design and a hybrid powertrain, increasing length by 7 inches over the previous generation and competing closely with the Nissan Qashqai and Hyundai Tucson.",
            },
            {
              img: "/imges/imge_car/suv/tucson-transformed.png",
              alt: "Hyundai Tucson 2023",
              title: "Hyundai Tucson 2023",
              p1: "Hyundai Tucson is a best seller in the global market, with Hyundai selling more than half a million cars in 2022.",
              p2: "The 2023 Tucson comes with a distinctive design and a hybrid powertrain, competing closely with the Nissan Qashqai and Kia Sportage.",
            },
          ].map((car, i) => (
            <Reveal key={car.title} delay={i * 100} className="h-full">
              <article className="card card-hover p-7 h-full group">
                <div className="card-image-frame h-48 mb-5 rounded-xl">
                  <Image
                    src={car.img}
                    alt={car.alt}
                    fill
                    className="object-contain p-2 card-zoom-image"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{car.title}</h3>
                  <Badge tone="warning" dot={false}>
                    <Icon name="car" size={13} />
                    Best seller
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                  {car.p1}
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {car.p2}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}