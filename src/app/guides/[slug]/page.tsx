import { notFound } from "next/navigation";
import { getGuide, guides } from "@/lib/data/guides";
import GuidePage from "@/page/guides/GuidePage";
import FaqPage from "@/page/guides/FaqPage";
import { pageMetadata } from "@/seo/metadata";
// Full-document navigation resolves URL params before rendering, including 404s.
export const instant = false;
export function generateStaticParams() {
  return [...guides.map((g) => ({ slug: g.slug })), { slug: "faq" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "faq") return pageMetadata("/guides/faq");
  const g = getGuide(slug);
  return g ? pageMetadata(`/guides/${slug}`) : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "faq") return <FaqPage />;
  const g = getGuide(slug);
  if (!g) notFound();
  return <GuidePage guide={g} />;
}
