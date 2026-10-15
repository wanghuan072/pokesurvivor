import LegalPage from "@/page/legal/LegalPage";
import { pageMetadata } from "@/seo/metadata";
export const metadata = pageMetadata("/legal/terms-of-service");
export default function Page() { return <LegalPage slug="terms-of-service" />; }
