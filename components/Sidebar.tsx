"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 flex-shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/clients",
    label: "Clients",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 flex-shrink-0">
        <circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
      </svg>
    ),
  },
  {
    href: "/approvals",
    label: "Approvals",
    hasBadge: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 flex-shrink-0">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
  },
];

export default function Sidebar({ agency }: { agency: any }) {
  const pathname = usePathname();
  const { user } = useUser();
  const pendingPosts = useQuery(api.posts.listPendingApprovals);
  const pendingCount = pendingPosts?.length ?? 0;

  return (
    <aside
      className="sticky top-0 h-screen flex flex-col"
      style={{ background: "var(--paper)", borderRight: "1px solid var(--line)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 pb-5" style={{ borderBottom: "1px solid var(--line)" }}>
        <Image src="/logo-glyph.svg" width={28} height={28} alt="SocialPilot" />
        <span className="font-display font-semibold text-base tracking-tight text-ink">SocialPilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 p-3 pt-2">
        {NAV.map(({ href, label, icon, hasBadge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[6px] text-sm transition-colors"
              style={
                active
                  ? { background: "var(--ink)", color: "var(--ink-on)" }
                  : { color: "var(--ink-3)" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--row-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "var(--ink-3)";
                }
              }}
            >
              {icon}
              <span className="flex-1 font-medium">{label}</span>
              {hasBadge && pendingCount > 0 && (
                <span
                  className="font-mono text-[11px] px-1.5 py-px rounded-full leading-[1.4]"
                  style={
                    active
                      ? { background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }
                      : { background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }
                  }
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}

        <div
          className="text-[11px] font-medium uppercase tracking-[0.08em] px-2.5 pt-4 pb-1.5"
          style={{ color: "var(--ink-3)" }}
        >
          Operations
        </div>

        <button
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[6px] text-sm text-left w-full transition-colors cursor-not-allowed opacity-50"
          style={{ color: "var(--ink-3)" }}
          disabled
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 flex-shrink-0">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="font-medium">Engagement</span>
        </button>

        <button
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[6px] text-sm text-left w-full transition-colors cursor-not-allowed opacity-50"
          style={{ color: "var(--ink-3)" }}
          disabled
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 flex-shrink-0">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
          <span className="font-medium">Analytics</span>
        </button>
      </nav>

      {/* Footer */}
      <div
        className="flex items-center gap-2.5 p-3 px-4"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <UserButton />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink truncate">{user?.fullName ?? user?.username}</div>
          {agency && (
            <div className="text-[11px] truncate" style={{ color: "var(--ink-3)" }}>{agency.name}</div>
          )}
        </div>
      </div>
    </aside>
  );
}
