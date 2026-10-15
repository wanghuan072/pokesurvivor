export const site = {
  name: "PokeSurvivor.me",
  url: "https://pokesurvivor.me",
  game: "https://pokesurvivor.com/en/",
  email: "support@pokesurvivor.me",
  reviewed: "2026-10-15",
  production: process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview",
};
