// src/lib/favorites.ts
// Persistencia simple en localStorage + eventos para sincronizar entre componentes/tabs.

const KEY = "itelsa:favorites";
const EVT = "itelsa:favorites:changed";

// Leer lista (ids) desde localStorage
export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
}

// Guardar
function setFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
  // Notificar a listeners del mismo tab
  window.dispatchEvent(new CustomEvent(EVT));
}

// ¿es favorito?
export function isFav(id: string): boolean {
  return getFavorites().includes(id);
}

// Alternar
export function toggleFav(id: string) {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(id);
  }
  setFavorites(list);
}

// Contador
export function countFav(): number {
  return getFavorites().length;
}

// Suscripción a cambios (mismo tab + otras pestañas)
export function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(EVT as any, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) cb();
  });
  return () => {
    window.removeEventListener(EVT as any, handler);
  };
}
