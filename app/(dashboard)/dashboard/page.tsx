"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "chip-draft",
    PENDING_APPROVAL: "chip-pending",
    APPROVED: "chip-approved",
    SCHEDULED: "chip-scheduled",
    PUBLISHED: "chip-published",
    FAILED: "chip-failed",
  };
  const label: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_APPROVAL: "Needs approval",
    APPROVED: "Approved",
    SCHEDULED: "Scheduled",
    PUBLISHED: "Published",
    FAILED: "Failed",
  };
  return (
    <span className={`chip ${map[status] ?? "chip-draft"}`}>
      <span className="chip-dot" />
      {label[status] ?? status}
    </span>
  );
}

function ClientAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0"
      style={{ background: `hsl(${hue},55%,42%)` }}
    >
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const pendingPosts = useQuery(api.posts.listPendingApprovals);

  const today = format(new Date(), "EEEE · MMM d");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Active clients",    value: stats?.totalClients ?? 0,        delta: null },
    { label: "Posts this week",   value: stats?.scheduledPosts ?? 0,      delta: null },
    { label: "Pending approval",  value: stats?.pendingApprovals ?? 0,    accent: true },
    { label: "Published · 30d",   value: stats?.publishedThisMonth ?? 0,  delta: null },
  ];

  return (
    <div>
      {/* Hero */}
      <div
        className="relative rounded-xl mb-7 overflow-hidden"
        style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(14,16,20,0.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            maskImage: "linear-gradient(135deg, transparent 0%, transparent 30%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div className="relative flex justify-between items-end gap-6 px-8 py-7">
          <div>
            <div
              className="text-[11px] font-medium uppercase tracking-[0.12em] mb-2.5"
              style={{ color: "var(--ink-3)" }}
            >
              {today}
            </div>
            <h1 className="font-display text-[38px] font-semibold tracking-[-0.024em] leading-[1.05]">
              {greeting}.
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--ink-3)", maxWidth: 480 }}>
              {stats?.pendingApprovals
                ? `${stats.pendingApprovals} post${stats.pendingApprovals > 1 ? "s" : ""} waiting for your review.`
                : "All caught up. Nothing needs review right now."}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/approvals"
              className="flex items-center gap-2 text-sm font-medium h-9 px-4 rounded-lg"
              style={{ background: "var(--sand)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
            >
              Approvals
            </Link>
            <Link
              href="/clients/new"
              className="flex items-center gap-2 text-sm font-semibold h-9 px-4 rounded-lg"
              style={{ background: "var(--ink)", color: "var(--ink-on)" }}
            >
              + New client
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {statCards.map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-xl px-4 py-4"
            style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
          >
            <div className="text-[12px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: "var(--ink-3)" }}>
              {label}
            </div>
            <div
              className="font-display text-[32px] font-semibold tracking-[-0.02em] leading-none"
              style={{ color: accent && value > 0 ? "var(--gold-cta-ink)" : "var(--ink)" }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Queue + signals two-col */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 320px" }}>
        {/* Queue card */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
            <h3 className="font-display text-[18px] font-semibold tracking-[-0.01em]">Pending approvals</h3>
            <Link href="/approvals" className="text-[13px]" style={{ color: "var(--ink-3)" }}>
              View all →
            </Link>
          </div>

          {!pendingPosts ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "var(--sand)" }} />
              ))}
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
              Nothing pending. All clear
            </div>
          ) : (
            pendingPosts.slice(0, 6).map((post: any) => (
              <div
                key={post._id}
                className="grid items-center gap-4 px-5 py-3.5"
                style={{
                  gridTemplateColumns: "32px 1fr auto auto auto",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <ClientAvatar name={post.client?.name ?? "?"} />
                <p
                  className="text-[13px] overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: "var(--ink-2)" }}
                >
                  {post.contentText}
                </p>
                <Image
                  src={post.platform === "LINKEDIN" ? "/badge-linkedin.svg" : "/badge-instagram.svg"}
                  width={18} height={18} alt={post.platform}
                />
                <StatusChip status={post.status} />
                <Link
                  href="/approvals"
                  className="text-[12px] font-semibold h-7 px-3 rounded-lg flex items-center"
                  style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
                >
                  Review
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Signals card */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
        >
          <h3 className="font-display text-base font-semibold mb-3.5">Signals</h3>
          <div className="space-y-0">
            <Signal
              icon={<path d="M20 6 9 17l-5-5"/>}
              iconBg="var(--sage-soft)" iconColor="var(--sage)"
              title="System ready"
              body="LinkedIn OAuth configured. Connect client accounts in Settings."
              time="now"
            />
            {stats?.pendingApprovals ? (
              <Signal
                icon={<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>}
                iconBg="var(--pending-soft)" iconColor="var(--pending)"
                title={`${stats.pendingApprovals} posts waiting`}
                body="Review and approve posts to keep the queue flowing."
                time="pending"
              />
            ) : null}
            <Signal
              icon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>}
              iconBg="var(--sky-soft)" iconColor="var(--sky)"
              title="Scheduler active"
              body="Approved posts will publish automatically at their scheduled time."
              time="always on"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal({ icon, iconBg, iconColor, title, body, time }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; body: string; time: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px dashed var(--line)" }}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          {icon}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-[1.45]" style={{ color: "var(--ink-2)" }}>
          <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{title}</strong>
          {" "}{body}
        </p>
        <p className="text-[11px] mt-0.5 font-mono" style={{ color: "var(--ink-4)" }}>{time}</p>
      </div>
    </div>
  );
}
