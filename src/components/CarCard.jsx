import Image from "next/image";
import Badge from "./ui/Badge";

export default function CarCard({ car, children, className = "" }) {
  return (
    <article
      className={`card card-hover overflow-hidden h-full flex flex-col group ${className}`.trim()}
    >
      <div className="card-image-frame relative w-full h-48">
        <Image
          src={car.image}
          alt={car.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-4 card-zoom-image"
        />
        <div className="absolute top-3 left-3">
          <Badge tone={car.condition === "new" ? "success" : "warning"}>
            {car.condition}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-semibold mb-1 truncate text-[var(--text-primary)]">
          {car.name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          {car.manufacturing_year}
          {car.color ? ` · ${car.color}` : ""}
        </p>
        <div className="mt-auto">{children}</div>
      </div>
    </article>
  );
}