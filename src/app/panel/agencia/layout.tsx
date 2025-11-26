import Breadcrumbs from "./breadcrumbs.jsonld";

export default function AgenciaLayout({ children }: { children: React.ReactNode }) {
  return <><Breadcrumbs />{children}</>;
}
