import Image from "next/image";

/** Rendering der Leistung aus der eigenen 3D-Maquette (public/renders/<id>.webp). */
export function ServiceVisual({
  id,
  alt = "",
  className = "",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
}: {
  id: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Image
      className={`sv ${className}`}
      src={`/renders/${id}.webp`}
      alt={alt}
      width={1600}
      height={1200}
      sizes={sizes}
      priority={priority}
    />
  );
}
