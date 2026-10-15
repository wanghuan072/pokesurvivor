import LegalPage from "@/page/legal/LegalPage";
import { pageMetadata } from "@/seo/metadata";
export const metadata = pageMetadata("/legal/copyright");
export default function Page() { return <LegalPage slug="copyright" />; }
