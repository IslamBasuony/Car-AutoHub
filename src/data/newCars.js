// New Vehicles showroom data.
//
// Real vehicle photos are resolved at runtime for each entry's make + model
// + year via Wikimedia Commons (with attribution), proxied through the
// same-origin /api/car-image route (see src/lib/vehicleImageProvider.js).
// The "New Cars" inventory is a curated showroom selection drawn (and
// validated against) the bundled reference catalog used by the Add Car form
// (src/data/vehicleCatalog.js).

import { MAKES, MODELS_BY_MAKE } from "./vehicleCatalog";
import { buildCarImageUrl } from "@/lib/carApi";

const RAW_ENTRIES = [
  { make: "Toyota", model: "RAV4", year: 2026 },
  { make: "Toyota", model: "Camry", year: 2025 },
  { make: "Toyota", model: "Corolla", year: 2025 },
  { make: "Toyota", model: "Tacoma", year: 2024 },
  { make: "Honda", model: "CR-V", year: 2026 },
  { make: "Honda", model: "Accord", year: 2025 },
  { make: "Honda", model: "Civic", year: 2025 },
  { make: "Kia", model: "Sportage", year: 2025 },
  { make: "Kia", model: "K5", year: 2025 },
  { make: "Hyundai", model: "Tucson", year: 2025 },
  { make: "Hyundai", model: "Sonata", year: 2025 },
  { make: "BMW", model: "X5", year: 2025 },
  { make: "BMW", model: "X3", year: 2025 },
  { make: "Mercedes-Benz", model: "GLE", year: 2025 },
  { make: "Audi", model: "Q5", year: 2025 },
  { make: "Volkswagen", model: "Tiguan", year: 2025 },
  { make: "Volkswagen", model: "Golf", year: 2024 },
  { make: "Ford", model: "Explorer", year: 2025 },
  { make: "Ford", model: "F-150", year: 2025 },
  { make: "Chevrolet", model: "Tahoe", year: 2024 },
  { make: "Peugeot", model: "508", year: 2024 },
  { make: "Mazda", model: "CX-5", year: 2025 },
  { make: "Tesla", model: "Model 3", year: 2026 },
  { make: "Tesla", model: "Model Y", year: 2025 },
  { make: "Volvo", model: "XC60", year: 2025 },
  { make: "Land Rover", model: "Defender", year: 2025 },
  { make: "Jeep", model: "Wrangler", year: 2025 },
  { make: "Lexus", model: "RX", year: 2025 },
];

function isInCatalog(entry) {
  return (
    MAKES.includes(entry.make) &&
    (MODELS_BY_MAKE[entry.make] || []).includes(entry.model)
  );
}

const key = (e) => `${e.make}|${e.model}|${e.year}`;

export const NEW_CARS = RAW_ENTRIES.filter(isInCatalog)
  .filter((e, i, arr) => arr.findIndex((x) => key(x) === key(e)) === i)
  .map((e, i) => ({ id: `new-${i + 1}`, ...e }));

export function availableMakes(cars = NEW_CARS) {
  return [...new Set(cars.map((c) => c.make))].sort();
}

export function availableYears(cars = NEW_CARS) {
  return [...new Set(cars.map((c) => c.year))].sort((a, b) => b - a);
}

// Adapter: maps a New Vehicles entry (photo URL + identity from the photo
// integration) onto the shape that CarCard and the details dialog expect.
export function toVehicleCard(entry) {
  return {
    id: entry.id,
    name: `${entry.make} ${entry.model} ${entry.year}`,
    image: buildCarImageUrl(entry.make, entry.model, entry.year),
    manufacturing_year: entry.year,
    color: null,
    condition: "new",
    make: entry.make,
    model: entry.model,
    year: entry.year,
  };
}

export const NEW_CAR_CARDS = NEW_CARS.map(toVehicleCard);