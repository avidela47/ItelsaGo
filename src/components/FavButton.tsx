"use client";

import { useEffect, useState } from "react";

const KEY = "itelsa:favs";

function readFavs(): Record<string, true> {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}
function writeFavs(map: Record<string, true>) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
}

export default function FavButton({ id }: { id: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const map = readFavs();
    setOn(Boolean(map[id]));
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const map = readFavs();
    if (map[id]) { delete map[id]; setOn(false); }
    else { map[id] = true; setOn(true); }
    writeFavs(map);
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Quitar de favoritos" : "Agregar a favoritos"}
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,.25)",
        background: on ? "rgba(255, 0, 80, .9)" : "rgba(255,255,255,.85)",
        color: on ? "white" : "#0b0b0f",
        fontWeight: 900,
        cursor: "pointer",
      }}
      title={on ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
