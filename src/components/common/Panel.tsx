import type { ReactNode } from "react";
import s from "@/style/common/panel.module.css";
export function Panel({
  title,
  icon,
  href,
  more = "View More",
  children,
  className = "",
}: {
  title: string;
  icon: string;
  href?: string;
  more?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${s.panel} ${className}`}>
      <div className={s.panelHead}>
        <h2>
          <span>{icon}</span>
          {title}
        </h2>
        {href && (
          <a href={href}>
            {more} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
      {children}
    </section>
  );
}
