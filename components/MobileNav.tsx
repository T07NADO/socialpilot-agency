"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const NAV = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/clients",
    label: "Clients",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="w-5 h-5">
        <circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
      </svg>
    ),
  },
  {
    href: "/approvals",
    label: "Approvals",
    hasBadge: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="w-5 h-5">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="w-5 h-5">
        <circle cx="12" cy="8" r="3"/><path d="M12 14c-4 0-6 1.5-6 3v1h12v-1c0-1.5-2-3-6-3z"/>
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const pendingPosts = useQuery(api.posts.listPendingApprovals);
  const pendingCount = pendingPosts?.length ?? 0;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "var(--paper)",
        borderTop: "1px solid var(--line)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV.map(({ href, label, icon, hasBadge }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative"
            style={{ color: active ? "var(--ink)" : "var(--ink-4)" }}
          >
            <span className="relative">
              {icon(active)}
              {hasBadge && pendingCount > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-semibold"
                  style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
                >
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </span>
            <span
              className="text-[10px] font-medium leading-none"
              style={{ color: active ? "var(--ink)" : "var(--ink-4)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
