import { notFound } from "next/navigation";
import { getPokemon, pokemon } from "@/lib/data/pokemon";
import PokemonDetailPage from "@/page/pokedex/PokemonDetailPage";
import { pageMetadata } from "@/seo/metadata";

export const instant = false;
export function generateStaticParams() {
  return pokemon.filter(p=>p.hasDetailPage).map(p=>({slug:p.slug}));
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const partner=getPokemon(slug);
  if(!partner?.hasDetailPage || !partner.detail) notFound();
  return pageMetadata(`/pokedex/${slug}`);
}
export default async function Page({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const partner=getPokemon(slug);
  if(!partner?.hasDetailPage || !partner.detail) notFound();
  return <PokemonDetailPage partner={partner}/>;
}
