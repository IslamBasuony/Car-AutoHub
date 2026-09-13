# Car-AutoHub — Next.js rebuild

**Live demo:** https://car-auto-hub.vercel.app/

This is a Next.js (App Router) rebuild of the original **Car-Product-app**
(originally Laravel + Blade + MySQL). Per request, this version has **no
real backend** — no database, no auth, no file uploads to a server. All car
data lives in memory on the client.

## What was carried over from the original

- Pages: Home (hero, body-type tabs, Kia K5 section, benefits, best
  sellers), Cars (search, details modal, delete), Add Car (form fields),
  About, Service — all mirror the original `resources/views/*.blade.php`.
- Visual theme: light/dark mode toggle and the blue accent color
  (`#337ab7` / `#204361` in dark mode), recreated from the original
  `public/css/style.css` CSS variables.
- Real image assets copied over from `public/imges/` (logos, car photos,
  team photos) — nothing here is AI-generated.
- The `Car` data shape (`name, price, manufacturing_year, color, category,
  condition, body, image`) matches `app/Models/Car.php` exactly.

## What's different (and why)

- **No database.** The original stored cars in MySQL
  (`database/migrations/2024_04_27_103422_create_cars_table.php`) and
  seeded them with `database/factories/CarFactory.php` (randomly generated
  data — not real listings). Since there's no backend here, `src/data/cars.js`
  has a small set of sample cars in the same shape. Replace this with real
  data, or wire up a Next.js API route / external API if you add a backend
  later.
- **No login/auth.** The original used Laravel Fortify for authentication;
  this rebuild is public, matching "no real backend."
- **Add Car form** stores the new car in React state only — it resets on
  page refresh. Wire it up to an API route if you want persistence.

## Getting started

Live URL: https://car-auto-hub.vercel.app/

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
src/
├── app/
│   ├── layout.js          # root layout (navbar, footer, providers)
│   ├── page.js            # home page
│   ├── about/page.js
│   ├── service/page.js
│   └── cars/
│       ├── page.js        # car listing + search + modal
│       └── add/page.js    # add car form
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ThemeProvider.jsx  # dark/light mode
│   ├── CarStore.jsx       # in-memory car list (add/delete)
│   ├── HomeContent.jsx
│   ├── CarsListContent.jsx
│   └── AddCarForm.jsx
└── data/
    └── cars.js            # sample car data
```
