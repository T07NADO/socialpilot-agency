"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Topbar({ agency }: { agency?: any }) {
  const pathname = usePathname();

  const isClients = pathname.startsWith("/clients");
  const ctaLabel = isClients ? "+ New client" : "+ New post";
  const ctaHref  = isClients ? "/clients/new" : "/clients";

  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3 px-4 md:px-8 h-14"
      style={{
        background: "rgba(250,246,238,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {/* Brand — visible on mobile only */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden flex-shrink-0">
        <Image src="/logo-glyph.svg" width={24} height={24} alt="SocialPilot" />
        <span className="font-display font-semibold text-[15px] tracking-tight" style={{ color: "var(--ink)" }}>
          SocialPilot
        </span>
      </Link>

      {/* Search */}
      <div
        className="flex items-center gap-2 flex-1 max-w-[400px] rounded-lg px-3 py-[7px] text-[13px] cursor-text"
        style={{ background: "var(--sand)", color: "var(--ink-3)", border: "1px solid transparent" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 flex-shrink-0">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <span className="hidden sm:inline">Search clients, posts…</span>
        <span className="sm:hidden">Search…</span>
        <kbd
          className="ml-auto font-mono text-[11px] px-1 py-px rounded hidden sm:block"
          style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-3)" }}
        >
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href={ctaHref}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 h-[34px] rounded-lg transition-colors whitespace-nowrap"
          style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
