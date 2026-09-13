"use client";

import { createContext, useContext, useState } from "react";
import { initialCars } from "@/data/cars";

const CarStoreContext = createContext(null);

export function CarStoreProvider({ children }) {
  const [cars, setCars] = useState(initialCars);

  const addCar = (car) => {
    setCars((prev) => [...prev, { ...car, id: Date.now() }]);
  };

  const deleteCar = (id) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CarStoreContext.Provider value={{ cars, addCar, deleteCar }}>
      {children}
    </CarStoreContext.Provider>
  );
}

export function useCarStore() {
  const ctx = useContext(CarStoreContext);
  if (!ctx) throw new Error("useCarStore must be used within CarStoreProvider");
  return ctx;
}
