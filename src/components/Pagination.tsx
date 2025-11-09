"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  pages: number;
};

export default function Pagination({ page, pages }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (p: number) => {
    const q = new URLSearchParams(sp.toString());
    if (p <= 1) q.delete("page"); else q.set("page", String(p));
    router.push(`/inmuebles?${q.toString()}`);
  };

  if (pages <= 1) return null;

  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        className="px-3 py-2 rounded bg-white/10 disabled:opacity-50"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
      >
        ◀
      </button>
      <span className="px-3 py-2 rounded bg-white/10">
        {page} / {pages}
      </span>
      <button
        className="px-3 py-2 rounded bg-white/10 disabled:opacity-50"
        onClick={() => go(page + 1)}
        disabled={page >= pages}
      >
        ▶
      </button>
    </div>
  );
}
