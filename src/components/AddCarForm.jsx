"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCarStore } from "./CarStore";
import Reveal from "./Reveal";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import { Field, Input } from "./ui/Field";
import Select from "./ui/Select";
import { useToast } from "./ui/Toast";
import { BODY_TYPES } from "@/data/cars";
import { MAKES, MODEL_YEARS, MODELS_BY_MAKE } from "@/data/vehicleCatalog";
import { getVehiclePhoto } from "@/lib/carApi";

const SPLASH_IMAGE = "/imges/logos/card_logo/splash.png";

const initialForm = {
  name: "",
  price: "",
  year: "",
  make: "",
  model: "",
  color: "",
  category: "",
  condition: "new",
  body: BODY_TYPES[0],
};

export default function AddCarForm() {
  const { addCar } = useCarStore();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  // Manual upload -> object URL; emptying it falls back to the auto photo.
  const [imagePreview, setImagePreview] = useState(null);
  // Auto-resolved photo metadata (via the /api/car-image proxy).
  const [apiPhoto, setApiPhoto] = useState(null);
  const [photoState, setPhotoState] = useState("idle"); // idle|loading|found|not-found|error
  const [lastAutoName, setLastAutoName] = useState("");
  const fetchTokenRef = useRef(0);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectionReady = Boolean(form.year && form.make && form.model);
  const previewUrl = imagePreview || (apiPhoto ? apiPhoto.url : null);

  // Auto-fill the name from the vehicle selection unless the user typed one.
  const autoName = useMemo(() => {
    if (!form.make || !form.model || !form.year) return null;
    return `${form.make} ${form.model} ${form.year}`;
  }, [form.make, form.model, form.year]);

  useEffect(() => {
    if (!autoName) return;
    setForm((f) => {
      if (f.name && f.name !== lastAutoName) return f;
      return { ...f, name: autoName };
    });
    setLastAutoName(autoName);
  }, [autoName, lastAutoName]);

  const loadPhoto = useCallback(async (make, model, year) => {
    fetchTokenRef.current += 1;
    const token = fetchTokenRef.current;
    setPhotoState("loading");
    const result = await getVehiclePhoto({ make, model, year });
    if (token !== fetchTokenRef.current) return;
    if (result.ok && result.found) {
      setApiPhoto({
        url: result.imageUrl,
        author: result.imageAuthor,
        license: result.imageLicense,
        attribution: result.imageAttribution,
        reference: result.imageReference,
        source: result.imageSource,
      });
      setPhotoState("found");
    } else if (result.ok) {
      setApiPhoto(null);
      setPhotoState("not-found");
    } else {
      setApiPhoto(null);
      setPhotoState("error");
    }
  }, []);

  // Fetch a real photo once Year + Make + Model are all selected.
  useEffect(() => {
    if (!selectionReady) return;
    setApiPhoto(null);
    loadPhoto(form.make, form.model, form.year);
  }, [selectionReady, form.make, form.model, form.year, loadPhoto]);

  const retryPhoto = () => {
    if (!selectionReady) return;
    loadPhoto(form.make, form.model, form.year);
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      return;
    }
    setApiPhoto(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.year) {
      toast({
        title: "Select a year",
        description: "Choose the model year for this car.",
        variant: "danger",
      });
      return;
    }

    const usesApiPhoto = !imagePreview && apiPhoto;

    const nextCar = {
      ...form,
      price: Number(form.price) || form.price,
      manufacturing_year: Number(form.year),
      image: previewUrl || SPLASH_IMAGE,
    };

    if (usesApiPhoto) {
      nextCar.imageSource = "wikimedia";
      nextCar.imageAuthor = apiPhoto.author;
      nextCar.imageLicense = apiPhoto.license;
      nextCar.imageAttribution = apiPhoto.attribution;
      nextCar.imageReference = apiPhoto.reference;
    }

    addCar(nextCar);
    toast({
      title: "Car listed successfully",
      description: `“${form.name}” is now live in the showroom.`,
    });
    router.push("/cars");
    router.refresh();
  };

  return (
    <div className="page-container max-w-2xl pb-16">
      <div className="mb-8 animate-fade-up">
        <span className="eyebrow mb-2">
          <Icon name="plus" size={14} />
          Sell your car
        </span>
        <h1 className="page-title mb-2">Add New Car</h1>
        <p className="text-[var(--text-secondary)]">
          Fill in the details below to list a car for sale.
        </p>
      </div>

      <Reveal variant="reveal-scale">
        <form onSubmit={handleSubmit} className="card overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-7 space-y-7">
            {/* Vehicle selection (photo) */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-color)]">
                  <Icon name="sliders" size={13} strokeWidth={2.5} />
                </span>
                Vehicle photo
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Select a year, make and model and the app fetches a real vehicle
                photo from Wikimedia Commons automatically.
              </p>
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label="Year" htmlFor="vehicle_year" required>
                  <Select
                    id="vehicle_year"
                    label="Year"
                    value={form.year}
                    onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}
                    items={MODEL_YEARS}
                    placeholder="Select year"
                  />
                </Field>
                <Field label="Make" htmlFor="vehicle_make">
                  <Select
                    id="vehicle_make"
                    label="Make"
                    value={form.make}
                    onValueChange={(v) => setForm((f) => ({ ...f, make: v, model: "" }))}
                    items={MAKES}
                    placeholder="Select make"
                  />
                </Field>
                <Field label="Model" htmlFor="vehicle_model">
                  <Select
                    id="vehicle_model"
                    label="Model"
                    value={form.model}
                    disabled={!form.make}
                    onValueChange={(v) => setForm((f) => ({ ...f, model: v }))}
                    items={form.make ? MODELS_BY_MAKE[form.make] || [] : []}
                    placeholder={form.make ? "Select model" : "Select make first"}
                  />
                </Field>
              </div>

              {selectionReady && (
                <div className="mt-4">
                  {photoState === "loading" && (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--input-border)] border-t-[var(--brand-color)]" />
                      Finding a real photo for {form.make} {form.model}…
                    </div>
                  )}
                  {photoState === "found" && apiPhoto && (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-color)] text-white">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          Vehicle photo found
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {apiPhoto.attribution || `Photo by ${apiPhoto.author || "Wikimedia Commons"}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {photoState === "not-found" && (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                      <Icon name="alert" size={16} className="shrink-0 text-[var(--warning-color)]" />
                      <span>
                        No photo found for <strong className="font-medium">{form.make} {form.model}</strong>.
                        You can upload your own image below.
                      </span>
                    </div>
                  )}
                  {photoState === "error" && (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                      <Icon name="alert" size={16} className="shrink-0 text-[var(--danger-color)]" />
                      <span className="flex-1">
                        Couldn&apos;t reach the vehicle photo service right now.
                      </span>
                      <Button type="button" variant="outline" size="sm" onClick={retryPhoto}>
                        <Icon name="refresh" size={14} />
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Product info */}
            <div className="border-t border-[var(--border-color)]" />
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-color)]">
                  <Icon name="car" size={13} strokeWidth={2.5} />
                </span>
                Product information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Field label="Car Name" htmlFor="name" required>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={update("name")}
                      placeholder="e.g. Kia Sportage 2023"
                    />
                  </Field>
                </div>
                <Field label="Price (USD)" htmlFor="price" required>
                  <Input
                    id="price"
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={update("price")}
                    placeholder="e.g. 28500"
                  />
                </Field>
              </div>
            </section>

            {/* Details */}
            <div className="border-t border-[var(--border-color)]" />
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-color)]">
                  <Icon name="sliders" size={13} strokeWidth={2.5} />
                </span>
                Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Color" htmlFor="color" required>
                  <Input
                    id="color"
                    required
                    value={form.color}
                    onChange={update("color")}
                    placeholder="e.g. White"
                  />
                </Field>
                <Field label="Category" htmlFor="category" required>
                  <Input
                    id="category"
                    required
                    value={form.category}
                    onChange={update("category")}
                    placeholder="e.g. Family"
                  />
                </Field>
                <Field label="Condition" htmlFor="condition">
                  <Select
                    id="condition"
                    label="Condition"
                    value={form.condition}
                    onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}
                    items={[
                      { value: "new", label: "New" },
                      { value: "used", label: "Used" },
                    ]}
                  />
                </Field>
                <Field label="Body Type" htmlFor="body">
                  <Select
                    id="body"
                    label="Body Type"
                    value={form.body}
                    onValueChange={(v) => setForm((f) => ({ ...f, body: v }))}
                    items={[
                      { value: "sedan", label: "Sedan" },
                      { value: "suv", label: "SUV" },
                      { value: "Premium", label: "Premium" },
                      { value: "Coupe", label: "Coupe" },
                      { value: "Hatchback", label: "Hatchback" },
                      { value: "Crossover", label: "Crossover" },
                    ]}
                  />
                </Field>
              </div>
            </section>

            {/* Image */}
            <div className="border-t border-[var(--border-color)]" />
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-color)]">
                  <Icon name="car" size={13} strokeWidth={2.5} />
                </span>
                Product image
              </h2>
              <div className="grid sm:grid-cols-[10rem_1fr] gap-5 items-start">
                {previewUrl ? (
                  <div>
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Car image preview"
                        className="w-full h-28 object-contain rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        aria-label="Remove image"
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--danger-color)] text-white shadow-md transition-transform hover:scale-110"
                      >
                        <Icon name="x" size={12} strokeWidth={3} />
                      </button>
                    </div>
                    {apiPhoto && !imagePreview && (
                      <p className="text-[11px] leading-snug text-[var(--text-muted)] mt-1.5 text-center">
                        Photo via Wikimedia Commons
                        {apiPhoto.attribution ? `: ${apiPhoto.attribution}` : ""}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-28 rounded-xl border-2 border-dashed border-[var(--input-border)] flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                    <Icon name="car" size={28} strokeWidth={1.5} />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
                <div className="w-full">
                  <Field label="Upload image" htmlFor="image" hint="Optional — a Wikimedia Commons photo is used automatically; a default image is used if none is available.">
                    <label
                      htmlFor="image"
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-secondary)] cursor-pointer px-4 py-3 transition-colors hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]"
                    >
                      <Icon name="plus" size={16} strokeWidth={2.5} />
                      Choose image
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      aria-label="Upload car image"
                      className="sr-only"
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 sm:px-8 py-5">
            <Link href="/cars" className="btn btn-outline w-full sm:w-auto">
              Cancel
            </Link>
            <Button type="submit" className="w-full sm:w-auto">
              <Icon name="check" size={15} strokeWidth={2.5} />
              Upload Product
            </Button>
          </div>
        </form>
      </Reveal>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        This form stores the new car in memory only (no backend) — refreshing
        the page resets the list back to the sample data.
      </p>
    </div>
  );
}