import { redirect } from "next/navigation";

// Redirige la home directamente al listado de inmuebles porque la portada no aporta valor.
export default function Page() {
  redirect("/inmuebles");
}
