import LegalPage from "@/page/legal/LegalPage";
import { pageMetadata } from "@/seo/metadata";
export const metadata = pageMetadata("/legal/privacy-policy");
export default function Page() { return <LegalPage slug="privacy-policy" />; }
