"use client";

type Props = {
  url: string;
  title: string;
  priceText?: string;
};

export default function ShareButton({ url, title, priceText }: Props) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: priceText ? `${title} – ${priceText}` : title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado");
      }
    } catch {
      // usuario canceló o no disponible
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(255,255,255,.06)",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      Compartir
    </button>
  );
}
