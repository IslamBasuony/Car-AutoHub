"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import CarCard from "./CarCard";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import { IconButton } from "./ui/Button";
import Badge from "./ui/Badge";
import { Field, Input } from "./ui/Field";
import Select from "./ui/Select";
import { Dialog, DialogContent, DialogClose } from "./ui/Dialog";
import {
  NEW_CAR_CARDS,
  availableMakes,
  availableYears,
} from "@/data/newCars";
import { checkPhotoServiceStatus, getVehiclePhoto } from "@/lib/carApi";

const ALL_MAKES = "__all_makes__";
const ALL_YEARS = "__all_years__";

async function loadMeta(card) {
  const result = await getVehiclePhoto({
    make: card.make,
    model: card.model,
    year: card.year,
  });
  if (!result.ok) return { status: "error", data: result };
  if (!result.found) return { status: "not-found", data: result };
  return { status: "found", data: result };
}

export default function NewCarsContent() {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState(ALL_MAKES);
  const [year, setYear] = useState(ALL_YEARS);
  const [active, setActive] = useState(null);
  const [meta, setMeta] = useState({ status: "idle", data: null });
  const [service, setService] = useState("checking"); // checking|ok|unavailable

  const probeService = async () => {
    setService("checking");
    const result = await checkPhotoServiceStatus();
    setService(result.ok ? "ok" : "unavailable");
  };

  useEffect(() => {
    probeService();
  }, []);

  const makes = useMemo(() => availableMakes(), []);
  const years = useMemo(() => availableYears(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NEW_CAR_CARDS.filter((c) => {
      if (make !== ALL_MAKES && c.make !== make) return false;
      if (year !== ALL_YEARS && c.year !== year) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, make, year]);

  const resetFilters = () => {
    setQuery("");
    setMake(ALL_MAKES);
    setYear(ALL_YEARS);
  };

  const openDetails = async (card) => {
    setActive(card);
    setMeta({ status: "loading", data: null });
    setMeta(await loadMeta(card));
  };

  const retryMeta = async () => {
    if (!active) return;
    setMeta({ status: "loading", data: null });
    setMeta(await loadMeta(active));
  };

  return (
    <div className="page-container pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <span className="eyebrow mb-2">
            <Icon name="sparkles" size={14} />
            New arrivals
          </span>
          <h1 className="page-title mb-1">New Cars</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl">
            A curated showroom of the latest models. Each vehicle photo is a
            real photograph fetched live from Wikimedia Commons with proper
            attribution and licensing.
          </p>
        </div>
        <Badge tone="brand" dot={false} className="self-start sm:self-end">
          {filtered.length} {filtered.length === 1 ? "new vehicle" : "new vehicles"}
        </Badge>
      </div>

      <form
        className="mb-8 grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-4"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <Field label="Search" htmlFor="new-cars-search" hint="Search by make or model.">
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              id="new-cars-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search new cars…"
              aria-label="Search new cars"
              className="pl-9 pr-10"
            />
            {query && (
              <IconButton
                label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <Icon name="x" size={14} />
              </IconButton>
            )}
          </div>
        </Field>

        <Field label="Make" htmlFor="new-cars-make">
          <Select
            id="new-cars-make"
            label="Make"
            value={make}
            onValueChange={setMake}
            items={[
              { value: ALL_MAKES, label: "All makes" },
              ...makes.map((m) => ({ value: m, label: m })),
            ]}
          />
        </Field>

        <Field label="Year" htmlFor="new-cars-year">
          <Select
            id="new-cars-year"
            label="Year"
            value={year}
            onValueChange={setYear}
            items={[
              { value: ALL_YEARS, label: "All years" },
              ...years.map((y) => ({ value: String(y), label: String(y) })),
            ]}
          />
        </Field>
      </form>

      {service === "unavailable" && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[var(--danger-color)]/30 bg-[var(--bg-secondary)] px-4 py-3">
          <div className="flex items-start gap-3 flex-1 text-sm text-[var(--text-secondary)]">
            <Icon name="alert" size={16} className="shrink-0 mt-0.5 text-[var(--danger-color)]" />
            <span>
              The vehicle photo service (<span className="font-medium">Wikimedia Commons</span>) is
              currently unreachable, so cards show the app placeholder instead of real photos. Real photos will
              appear automatically once the service recovers.
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={probeService}>
            <Icon name="refresh" size={14} />
            Check again
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 sm:p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            <Icon name={query ? "search" : "car"} size={26} />
          </div>
          <h3 className="font-semibold text-lg mb-1">No new vehicles found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            Nothing matches your search. Try a different make, year or keyword.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car, i) => (
            <Reveal key={car.id} delay={Math.min(i, 8) * 50} className="h-full">
              <CarCard car={car}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-tertiary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
                      title="Pricing is provided on request — the photo service does not publish vehicle prices."
                    >
                      <Icon name="phone" size={13} className="text-[var(--brand-color)]" />
                      Contact for price
                    </span>
                    <Button size="sm" onClick={() => openDetails(car)}>
                      Details
                    </Button>
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    {service === "ok" && (
                      <>
                        <Icon name="sparkles" size={12} />
                        Live photo — Wikimedia Commons
                      </>
                    )}
                    {service === "checking" && "Checking photo source…"}
                    {service === "unavailable" && (
                      <>
                        <Icon name="alert" size={12} className="text-[var(--warning-color)]" />
                        Photo service offline — placeholder
                      </>
                    )}
                  </p>
                </div>
              </CarCard>
            </Reveal>
          ))}
        </div>
      )}

      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        {active && (
          <DialogContent
            size="compact"
            title="New Vehicle Details"
            description={active.name}
            footer={
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            }
          >
            <div className="card-image-frame w-full h-48 mb-5 rounded-xl">
              <Image
                src={active.image}
                alt={active.name}
                fill
                sizes="(max-width: 456px) 100vw, 424px"
                className="object-contain p-3"
              />
            </div>

            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold text-lg tracking-tight">{active.name}</h4>
              <Badge tone="success">New</Badge>
            </div>

            {meta.status === "loading" ? (
              <div
                className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                role="status"
              >
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--input-border)] border-t-[var(--brand-color)]" />
                Fetching vehicle photo…
              </div>
            ) : (
              <>
                <dl className="space-y-3 text-sm">
                  {[
                    ["Make", meta.data?.make || active.make],
                    ["Model", meta.data?.model || active.model],
                    ["Year", meta.data?.year ?? active.year],
                    ["Price", "Contact for price"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-lg bg-[var(--bg-secondary)] px-3.5 py-2.5"
                    >
                      <dt className="text-[var(--text-secondary)]">{label}</dt>
                      <dd className="font-semibold text-right capitalize text-[var(--text-primary)]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-[11px] leading-snug text-[var(--text-muted)]">
                  The photo service returns photos and attribution only — it does not publish vehicle prices, so
                  AutoHub provides pricing on request.
                </p>

                {meta.status === "found" && (
                  <div className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-color)] text-white">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                      Real photo — Wikimedia Commons
                    </div>
                    <p className="text-[11px] leading-snug text-[var(--text-muted)] mt-2">
                      {meta.data.imageAuthor ? `Author: ${meta.data.imageAuthor}. ` : ""}
                      {meta.data.imageLicense ? `License: ${meta.data.imageLicense}. ` : ""}
                      {meta.data.imageAttribution || "Photo used with attribution from Wikimedia Commons."}
                    </p>
                  </div>
                )}

                {meta.status === "not-found" && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                    <Icon name="alert" size={16} className="shrink-0 text-[var(--warning-color)]" />
                    <span>
                      No Wikimedia photo found for this vehicle — showing the app placeholder.
                    </span>
                  </div>
                )}

                {meta.status === "error" && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                    <Icon name="alert" size={16} className="shrink-0 text-[var(--danger-color)]" />
                    <span className="flex-1">
                      Couldn&apos;t reach the vehicle photo service right now.
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={retryMeta}>
                      <Icon name="refresh" size={14} />
                      Retry
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}