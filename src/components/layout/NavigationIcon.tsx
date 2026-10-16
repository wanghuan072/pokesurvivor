import type { ReactNode } from "react";

const shapes: Record<string, ReactNode> = {
  home: <><path d="m3 9 7-6 7 6v8H4V9" /><path d="M8 17v-5h4v5M3 9h14" /></>,
  play: <><path d="M4 3h12v14H4z" /><path d="m8 7 5 3-5 3z" fill="currentColor" stroke="none" /></>,
  pokedex: <><path d="M5 3h10l3 3v8l-3 3H5l-3-3V6zM2 10h5m6 0h5" /><path d="M7 7h6v6H7z" /></>,
  cards: <><path d="M3 6h10v12H3zM7 2h10v12h-4" /><path d="m7 9 3 3-3 3" /></>,
  crown: <><path d="m2 5 4 4 4-6 4 6 4-4-2 11H4zM4 13h12" /></>,
  builds: <><path d="M3 3h6v6H3zM11 11h6v6h-6zM9 6h5v5M6 9v5h5" /></>,
  book: <><path d="M10 5 7 3H2v13h5l3 2 3-2h5V3h-5zM10 5v13M5 7h2M5 10h2M13 7h2M13 10h2" /></>,
  updates: <><path d="M5 2h10v16H5zM3 5h2M3 9h2M3 13h2M8 6h4M8 10h5M8 14h3" /></>,
  search: <><path d="M3 3h8v8H3zM11 11l6 6" /></>,
  arrow: <path d="m7 4 6 6-6 6" />,
  menu: <path d="M3 5h14M3 10h14M3 15h14" />,
  close: <path d="m4 4 12 12M16 4 4 16" />,
};

export function NavigationIcon({ name }: { name: keyof typeof shapes }) {
  return <svg viewBox="0 0 20 20" width="20" height="20" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" strokeLinecap="square"
    aria-hidden="true" focusable="false">{shapes[name]}</svg>;
}
