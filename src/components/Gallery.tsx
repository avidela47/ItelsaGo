"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  images?: string[];
  title?: string;
};

export default function Gallery({ images = [], title = "Imagen" }: Props) {
  const pics = useMemo(
    () => images.filter(Boolean).map((s) => String(s).trim()).filter(Boolean),
    [images]
  );
  const [idx, setIdx] = useState(0);

  if (pics.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-black/20 rounded-xl flex items-center justify-center text-white/60">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Principal: SIEMPRE contenido en 16:9 y recortado */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src={pics[idx]}
          alt={title}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          quality={100}
          priority={false}
        />
      </div>

      {/* Miniaturas */}
      {pics.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md border ${
                i === idx ? "border-white" : "border-white/20"
              }`}
              aria-label={`Imagen ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                sizes="140px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
