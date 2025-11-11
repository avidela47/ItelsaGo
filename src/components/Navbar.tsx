"use client";

import Link from "next/link";
import Image from "next/image";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const NavBtn = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`${styles.navBtn} ${active ? styles.active : ""}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className={styles.header}>
      <Box className={styles.wrap}>
        {/* Logo */}
        <Link href="/" className={styles.brand} aria-label="Inicio">
          <Image
            src="/logo-itelsa-go.svg"
            alt="ITELSA Go"
            width={150}
            height={32}
            priority
            className={styles.brandImg}
          />
        </Link>

        <nav className={styles.nav}>
          <NavBtn href="/inmuebles" label="Inmuebles" />
          <NavBtn href="/publicar" label="Publicar" />
          <NavBtn href="/panel" label="Panel" />
        </nav>
      </Box>
    </header>
  );
}




