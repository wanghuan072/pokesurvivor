import { PageHeader } from "@/components/common/PageHeader";
import faq from "@/data/guides/faq.json";
import s from "@/style/common/content.module.css";
export default function FaqPage() {
  return <div className={s.wrap}>
    <PageHeader title={faq.heading} description={faq.intro} path="/guides/faq" />
    <div className={s.faq}>{faq.questions.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    <div className={s.chips}><a href="/guides/beginner-guide">Read the beginner guide →</a><a href="/legal/contact-us">Ask a question →</a></div>
  </div>;
}
