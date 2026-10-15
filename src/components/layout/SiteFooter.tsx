"use client";
import { useSyncExternalStore } from "react";
import { legalLinks } from "@/config/legal";
import s from "@/style/layout/shell.module.css";
const subscribe = () => () => {};
export default function SiteFooter() {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => 2026);
  return <footer className={s.footer}>
    <a className={s.footerBrand} href="/">PokeSurvivor<em>.me</em></a>
    <nav aria-label="Legal"><strong>Legal</strong>{legalLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
    <small>Copyright © {year} pokesurvivor.me. All rights reserved.<br />An independent fan site. Not affiliated with the official game operator, Nintendo or The Pokémon Company. Third-party names and artwork remain their owners’ property.</small>
  </footer>;
}
