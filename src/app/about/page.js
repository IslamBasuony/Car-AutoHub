"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/Dialog";

const team = [
  { name: "Elon", role: "Founder & CEO", img: "/imges/about/download (1).jpeg" },
  { name: "Elen", role: "Head of Sales", img: "/imges/about/download (2).jpeg" },
  { name: "Ahmed", role: "Lead Engineer", img: "/imges/about/download.jpeg" },
];

export default function Page() {
  const [readMoreOpen, setReadMoreOpen] = useState(false);

  return (
    <div className="page-container max-w-5xl space-y-14 pb-16">
      <div className="animate-fade-up">
        <span className="eyebrow mb-2">
          <Icon name="info" size={14} />
          Who we are
        </span>
        <h1 className="page-title mb-3">About AutoHub</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
          Everything you need to know about how we help buyers find the right
          car.
        </p>
      </div>

      <Reveal>
        <section className="card p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center section-fade">
          <div className="relative w-full md:w-72 h-56 shrink-0 rounded-2xl overflow-hidden">
            <Image
              src="/imges/about/sddefault.jpg"
              alt="AutoHub company"
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover"
            />
          </div>
          <div>
            <Badge tone="brand" className="mb-3">
              Company
            </Badge>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">
              Company of Selling Cars
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We help buyers find the right car — new or used, across sedans,
              SUVs, and premium models — with a simple, straightforward browsing
              and buying experience.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="card p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="order-2 md:order-1 flex-1">
            <Badge tone="neutral" className="mb-3">
              <Icon name="map-pin" size={13} />
              Leadership
            </Badge>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Manager</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              Sports car by Kia company — the Kia Optima, the K5, is currently
              the best-selling sedan around the world within the Kia fleet of
              production cars, with a modern, youthful, sporty design.
            </p>
            <Button onClick={() => setReadMoreOpen(true)}>
              Read more
              <Icon name="arrow-right" size={15} />
            </Button>
          </div>
          <div className="relative w-full md:w-64 h-52 shrink-0 rounded-2xl overflow-hidden order-1 md:order-2">
            <Image
              src="/imges/about/download (1).jpeg"
              alt="AutoHub manager"
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover"
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <span className="eyebrow mb-1.5 block">
                <Icon name="car" size={14} />
                Meet the people
              </span>
              <h2 className="section-title">Our Team</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((person, i) => (
              <Reveal key={person.name} delay={i * 80} className="h-full">
                <article className="card card-hover p-6 text-center h-full group">
                  <div className="card-image-frame w-24 h-24 mx-auto mb-4 rounded-full ring-4 ring-[var(--brand-color)]/10 overflow-hidden">
                    <Image
                      src={person.img}
                      alt={`${person.name} — AutoHub team member`}
                      fill
                      sizes="96px"
                      className="object-cover card-zoom-image"
                    />
                  </div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{person.role}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Dialog open={readMoreOpen} onOpenChange={setReadMoreOpen}>
        {readMoreOpen && (
          <DialogContent
            title="About our leadership"
            description="A closer look at how we run AutoHub."
            footer={
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            }
          >
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              AutoHub is built around one idea: make finding and buying a car as
              simple as possible. Our leadership team combines deep automotive
              experience with a modern, digital-first approach to commerce.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              From transparent listings to end-to-end buying support, every
              decision is made with the buyer in mind.
            </p>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}