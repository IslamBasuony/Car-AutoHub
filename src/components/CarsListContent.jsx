"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCarStore } from "./CarStore";
import Reveal from "./Reveal";
import CarCard from "./CarCard";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import { IconButton } from "./ui/Button";
import Badge from "./ui/Badge";
import { Field, Input } from "./ui/Field";
import { Dialog, DialogContent, DialogClose } from "./ui/Dialog";
import { AlertDialog, AlertDialogContent } from "./ui/AlertDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./ui/DropdownMenu";
import { Tooltip } from "./ui/Tooltip";
import { useToast } from "./ui/Toast";

export default function CarsListContent() {
  const { cars, deleteCar } = useCarStore();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [activeCar, setActiveCar] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    if (!query) return cars;
    const q = query.toLowerCase();
    return cars.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)
    );
  }, [cars, query]);

  const handleDelete = () => {
    deleteCar(deleteTarget.id);
    toast({
      title: "Car deleted",
      description: `“${deleteTarget.name}” was removed from the listing.`,
      variant: "danger",
    });
    setDeleteTarget(null);
  };

  const handleBuying = () => {
    toast({
      title: "Buying request",
      description: "Our team will reach out to finalize your purchase soon.",
    });
  };

  return (
    <div className="page-container pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <span className="eyebrow mb-2">
            <Icon name="car" size={14} />
            Pre-owned showroom
          </span>
          <h1 className="page-title mb-1">Used Cars</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Find the right pre-owned car for your lifestyle.
          </p>
        </div>
        <Badge tone="neutral" dot={false} className="self-start sm:self-end">
          {filtered.length} {filtered.length === 1 ? "used car" : "used cars"} available
        </Badge>
      </div>

      <form className="mb-8" onSubmit={(e) => e.preventDefault()} role="search">
        <Field label="Search" htmlFor="car-search" hint="Search by name or body type.">
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              id="car-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search used cars…"
              aria-label="Search used cars"
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
      </form>

      {filtered.length === 0 ? (
        <div className="card p-12 sm:p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            <Icon name={query ? "search" : "car"} size={26} />
          </div>
          <h3 className="font-semibold text-lg mb-1">
            {query ? "No cars found" : "No cars available"}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            {query
              ? "Nothing matches your search. Try a different name or body type."
              : "Be the first to list a car for sale."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {query && (
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            )}
            <Link href="/cars/add" className="btn">
              <Icon name="plus" size={15} strokeWidth={2.5} />
              Add a car
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car, i) => (
            <Reveal key={car.id} delay={Math.min(i, 8) * 50} className="h-full">
              <CarCard car={car}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-[var(--brand-color)]">
                    ${car.price.toLocaleString("en-US")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <DropdownMenu>
                    <Tooltip content="Actions">
                      <DropdownMenuTrigger asChild>
                        <IconButton label={`Actions for ${car.name}`}>
                          <Icon name="dots" size={18} />
                        </IconButton>
                      </DropdownMenuTrigger>
                    </Tooltip>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={handleBuying}>
                          <Icon name="car" size={15} className="text-[var(--text-muted)]" />
                          Buying
                        </DropdownMenuItem>
                        <DropdownMenuItem danger onSelect={() => setDeleteTarget(car)}>
                          <Icon name="trash" size={15} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" onClick={() => setActiveCar(car)}>
                      Details
                    </Button>
                  </div>
                </div>
              </CarCard>
            </Reveal>
          ))}
        </div>
      )}

      {/* ---------- Details dialog ---------- */}
      <Dialog
        open={!!activeCar}
        onOpenChange={(open) => {
          if (!open) setActiveCar(null);
        }}
      >
        {activeCar && (
          <DialogContent
            size="compact"
            title="Car Details"
            description={activeCar.name}
            footer={
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            }
          >
            <div className="card-image-frame w-full h-48 mb-5 rounded-xl">
              <Image
                src={activeCar.image}
                alt={activeCar.name}
                fill
                sizes="(max-width: 456px) 100vw, 424px"
                className="object-contain p-3"
              />
            </div>
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold text-lg tracking-tight">{activeCar.name}</h4>
              <Badge tone={activeCar.condition === "new" ? "success" : "warning"}>
                {activeCar.condition}
              </Badge>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ["Price", `$${activeCar.price.toLocaleString("en-US")}`],
                ["Year", activeCar.manufacturing_year],
                ...(activeCar.make && activeCar.model
                  ? [
                      ["Make", activeCar.make],
                      ["Model", activeCar.model],
                    ]
                  : []),
                ["Color", activeCar.color],
                ["Category", activeCar.category],
                ["Body", activeCar.body],
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
            {activeCar.imageAttribution ? (
              <p className="text-[11px] leading-snug text-[var(--text-muted)] mt-4">
                Photo: {activeCar.imageAttribution}
              </p>
            ) : null}
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- Delete confirmation ---------- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        {deleteTarget && (
          <AlertDialogContent
            title={`Delete ${deleteTarget.name}?`}
            description="This will permanently remove the car from the listing. This action cannot be undone."
            confirmLabel="Delete"
            icon="trash"
            onConfirm={handleDelete}
          />
        )}
      </AlertDialog>
    </div>
  );
}