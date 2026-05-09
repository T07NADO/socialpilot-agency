"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, MessageCircle, Eye, Send, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AnalyticsTab({ clientId }: { clientId: Id<"clients"> }) {
  const stats = useQuery(api.analytics.getClientStats, { clientId });
  const syncStats = useAction(api.linkedin.syncClientStats);
  const [syncing, setSyncing] = useState(false);

  const [syncError, setSyncError] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    try {
      await syncStats({ clientId });
    } catch (e: any) {
      setSyncError(e?.message ?? "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (!stats) return <div className="animate-pulse h-48 rounded-xl" style={{ background: "var(--sand)" }} />;

  const metrics = [
    { label: "Total Likes",  value: stats.totalLikes,       icon: Heart,          color: "var(--rust)" },
    { label: "Comments",     value: stats.totalComments,    icon: MessageCircle,  color: "var(--sky-ink)" },
    { label: "Impressions",  value: stats.totalImpressions, icon: Eye,            color: "var(--ink-3)" },
    { label: "Published",    value: stats.publishedPosts,   icon: Send,           color: "var(--sage)" },
  ];

  const cardStyle = { background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" };

  return (
    <div className="space-y-5">
      {/* Sync button */}
      <div className="flex justify-end">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 text-[13px] font-medium h-8 px-3.5 rounded-lg disabled:opacity-40 transition-colors"
          style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync from LinkedIn"}
        </button>
      </div>

      {syncError && (
        <p className="text-[12px] text-right" style={{ color: "var(--rust)" }}>{syncError}</p>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-4" style={cardStyle}>
            <Icon className="w-4 h-4 mb-2.5" style={{ color }} />
            <p className="font-display text-[28px] font-semibold tracking-[-0.02em] leading-none" style={{ color: "var(--ink)" }}>
              {value.toLocaleString()}
            </p>
            <p className="text-[12px] mt-1.5 font-medium uppercase tracking-[0.06em]" style={{ color: "var(--ink-3)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <h3 className="font-display text-[15px] font-semibold mb-4" style={{ color: "var(--ink)" }}>
          Posts published, last 8 weeks
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.weeklyBreakdown} barSize={12}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--ink-4)", fontFamily: "Geist Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--ink-4)", fontFamily: "Geist Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "var(--sand)" }}
            />
            <Bar dataKey="LINKEDIN" fill="#0A66C2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LinkedIn summary */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-center gap-2 mb-1">
          <img src="/badge-linkedin.svg" width={18} height={18} alt="LinkedIn" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--ink-2)" }}>LinkedIn</span>
        </div>
        <p className="font-display text-[28px] font-semibold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
          {stats.byPlatform.LINKEDIN}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>published posts</p>
      </div>
    </div>
  );
}
