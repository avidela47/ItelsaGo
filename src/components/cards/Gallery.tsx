"use client";

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
      <div
        className="rounded-xl"
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: "rgba(255,255,255,.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,.6)",
        }}
      >
        Sin imagen
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Principal 16:9 con recorte */}
      <div
        className="rounded-xl"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          background: "#111",
        }}
      >
        <img
          src={pics[idx]}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          loading="eager"
        />
      </div>

      {/* Miniaturas opcionales */}
      {pics.length > 1 && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, overflowX: "auto" }}>
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              style={{
                position: "relative",
                height: 80,
                width: 120,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: 8,
                border: i === idx ? "2px solid #fff" : "1px solid rgba(255,255,255,.2)",
                padding: 0,
                cursor: "pointer",
                background: "transparent",
              }}
              aria-label={`Imagen ${i + 1}`}
            >
              <img
                src={src}
                alt={`${title} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

