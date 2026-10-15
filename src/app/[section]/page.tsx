import { notFound } from "next/navigation";
import { sections, type Section } from "@/config/sections";
import SectionPage from "@/page/wiki/SectionPage";
import { pageMetadata } from "@/seo/metadata";
// Full-document navigation resolves URL params before rendering, including 404s.
export const instant = false;
export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const info = Object.hasOwn(sections, section)
    ? sections[section as Section]
    : undefined;
  return info ? pageMetadata("/" + section) : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  return <SectionPage section={section as Section} />;
}
