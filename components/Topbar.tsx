"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();

  // Derive a sensible CTA from the current route
  const isClients = pathname.startsWith("/clients");
  const ctaLabel = isClients ? "+ New client" : "+ New post";
  const ctaHref  = isClients ? "/clients/new" : "/clients";

  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-4 px-8 h-14"
      style={{
        background: "rgba(250,246,238,0.82)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {/* Search (visual only — functionality can be added later) */}
      <div
        className="flex items-center gap-2 flex-1 max-w-[400px] rounded-lg px-3 py-[7px] text-[13px] cursor-text"
        style={{ background: "var(--sand)", color: "var(--ink-3)", border: "1px solid transparent" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 flex-shrink-0">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <span>Search clients, posts…</span>
        <kbd
          className="ml-auto font-mono text-[11px] px-1 py-px rounded"
          style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-3)" }}
        >
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href={ctaHref}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 h-[34px] rounded-lg transition-colors"
          style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
