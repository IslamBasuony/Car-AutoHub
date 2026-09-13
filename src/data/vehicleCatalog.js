// Vehicle reference catalog for the Add Car form.
//
// NOTE: real vehicle *photos* are resolved at runtime from Wikimedia Commons
// through the same-origin /api/car-image proxy (see
// src/lib/vehicleImageProvider.js). There is no photo-related catalog API,
// so the selection lists below are a small bundled reference dataset.

// Top model year for the Year selector. The app's original year field
// accepted 1990–2100; we mirror the historical part of that range.
export const MODEL_YEARS = [
  "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018",
  "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009",
  "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000",
  "1999", "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991",
  "1990",
];

export const MAKES = [
  "Toyota",
  "Honda",
  "Nissan",
  "Kia",
  "Hyundai",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Ford",
  "Chevrolet",
  "Peugeot",
  "Renault",
  "Skoda",
  "Opel",
  "Seat",
  "Lada",
  "Mazda",
  "Subaru",
  "Volvo",
  "Jeep",
  "Land Rover",
  "Tesla",
  "Mini",
  "Lexus",
  "Mitsubishi",
];

export const MODELS_BY_MAKE = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Land Cruiser", "Prius", "Tacoma", "4Runner"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "HR-V"],
  Nissan: ["Altima", "Sentra", "Rogue", "Pathfinder", "Frontier", "Leaf"],
  Kia: ["Sportage", "K5", "Optima", "Telluride", "Rio", "Sorento", "Carnival"],
  Hyundai: ["Tucson", "Elantra", "Santa Fe", "Sonata", "Kona", "Palisade", "Ioniq"],
  BMW: ["X5", "X3", "3 Series", "5 Series", "7 Series", "M3"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS"],
  Audi: ["A4", "A6", "Q5", "Q7", "e-tron"],
  Volkswagen: ["Golf", "Jetta", "Passat", "Tiguan", "Touareg", "Polo"],
  Ford: ["Mustang", "F-150", "Escape", "Explorer", "Focus", "Ranger"],
  Chevrolet: ["Malibu", "Cruze", "Camaro", "Tahoe", "Silverado", "Equinox"],
  Peugeot: ["508", "208", "3008", "408"],
  Renault: ["Clio", "Megane", "Captur", "Duster"],
  Skoda: ["Octavia", "Superb", "Kodiaq", "Fabia"],
  Opel: ["Astra", "Corsa", "Insignia", "Mokka"],
  Seat: ["Leon", "Ibiza", "Ateca", "Arona"],
  Lada: ["Niva", "Vesta", "Granta", "Largus"],
  Mazda: ["3", "6", "CX-5", "CX-30", "MX-5"],
  Subaru: ["Impreza", "Outback", "Forester", "Legacy"],
  Volvo: ["XC40", "XC60", "XC90", "S60", "S90"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Renegade"],
  "Land Rover": ["Range Rover", "Discovery", "Defender", "Evoque"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Mini: ["Cooper", "Countryman", "Clubman"],
  Lexus: ["RX", "NX", "ES", "LS"],
  Mitsubishi: ["Outlander", "L200", "ASX", "Pajero"],
};