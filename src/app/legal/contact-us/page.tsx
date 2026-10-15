import LegalPage from "@/page/legal/LegalPage";
import { pageMetadata } from "@/seo/metadata";
export const metadata = pageMetadata("/legal/contact-us");
export default function Page() { return <LegalPage slug="contact-us" />; }
