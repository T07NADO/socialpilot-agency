"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  PenSquare,
  Calendar,
  BarChart2,
  Settings2,
  Zap,
  Linkedin,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import PostsQueue from "@/components/PostsQueue";
import EngagementTab from "@/components/EngagementTab";
import AnalyticsTab from "@/components/AnalyticsTab";

const TABS = ["Queue", "Engagement", "Analytics", "Settings"] as const;
type Tab = typeof TABS[number];

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = params.id as Id<"clients">;
  const client = useQuery(api.clients.get, { clientId });
  const [tab, setTab] = useState<Tab>("Queue");

  if (!client) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const tabIcons: Record<Tab, any> = {
    Queue: Calendar, Engagement: Zap, Analytics: BarChart2, Settings: Settings2,
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/clients" style={{ color: "var(--ink-4)" }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.018em]">{client.name}</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-3)" }}>{client.industry}</p>
        </div>
        <Link
          href={`/compose/${client._id}`}
          className="flex items-center gap-2 text-sm font-semibold h-9 px-4 rounded-lg"
          style={{ background: "var(--ink)", color: "var(--ink-on)" }}
        >
          <PenSquare className="w-4 h-4" /> Compose
        </Link>
      </div>

      <div className="flex gap-6 mb-6" style={{ borderBottom: "1px solid var(--line)" }}>
        {TABS.map((t) => {
          const Icon = tabIcons[t];
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-0 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={tab === t
                ? { borderBottomColor: "var(--ink)", color: "var(--ink)" }
                : { borderBottomColor: "transparent", color: "var(--ink-3)" }}
            >
              <Icon className="w-4 h-4" /> {t}
            </button>
          );
        })}
      </div>

      {tab === "Queue" && <PostsQueue clientId={clientId} />}
      {tab === "Engagement" && <EngagementTab clientId={clientId} />}
      {tab === "Analytics" && <AnalyticsTab clientId={clientId} />}
      {tab === "Settings" && <ClientSettings client={client} />}
    </div>
  );
}

function ClientSettings({ client }: { client: any }) {
  const updateClient    = useMutation(api.clients.update);
  const saveSocialAccount   = useMutation(api.socialAccounts.save);
  const removeSocialAccount = useMutation(api.socialAccounts.remove);
  const socialAccounts  = useQuery(api.socialAccounts.listByClient, { clientId: client._id });

  const [name, setName] = useState(client.name);
  const [saving, setSaving] = useState(false);
  const [linkedinStatus, setLinkedinStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [linkedinError, setLinkedinError] = useState("");

  const linkedinAccount = socialAccounts?.find((a) => a.platform === "LINKEDIN");

  // After LinkedIn OAuth redirects back with ?linkedin_connected=1, read the
  // pending cookie and save the account to Convex.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("linkedin_connected") !== "1") return;

    url.searchParams.delete("linkedin_connected");
    window.history.replaceState({}, "", url.toString());

    setLinkedinStatus("loading");
    fetch("/api/auth/linkedin/complete")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) throw new Error(data.error);
        await saveSocialAccount({
          clientId: client._id,
          platform: "LINKEDIN",
          accessToken: data.accessToken,
          profileId: data.profileId,
          profileName: data.profileName,
          expiresAt: data.expiresAt,
        });
        setLinkedinStatus("success");
      })
      .catch((err) => {
        setLinkedinError(err.message ?? "Failed to connect LinkedIn");
        setLinkedinStatus("error");
      });
  }, []);

  const handleDisconnect = async (accountId: string) => {
    await removeSocialAccount({ accountId: accountId as Id<"socialAccounts"> });
  };

  const cardStyle = { background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" };
  const inputStyle = { background: "var(--sand)", border: "1px solid var(--line)", color: "var(--ink)", fontFamily: "'Geist', sans-serif" };

  return (
    <div className="space-y-5 max-w-lg">
      {/* Client name */}
      <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
        <h2 className="font-display text-[18px] font-semibold">Client settings</h2>
        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.08em] mb-2" style={{ color: "var(--ink-3)" }}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--line)")}
          />
        </div>
        <button
          onClick={async () => { setSaving(true); await updateClient({ clientId: client._id, name }); setSaving(false); }}
          disabled={saving}
          className="text-sm font-semibold h-9 px-4 rounded-lg disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--ink-on)" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Connected accounts */}
      <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
        <div>
          <h2 className="font-display text-[18px] font-semibold">Connected accounts</h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>Connect client accounts to enable auto-publishing.</p>
        </div>

        {/* LinkedIn */}
        <div className="rounded-lg p-4" style={{ border: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/badge-linkedin.svg" width={32} height={32} alt="LinkedIn" className="rounded-lg" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>LinkedIn</p>
                <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>Personal profile</p>
              </div>
            </div>

            {linkedinStatus === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--ink-4)" }} />
            ) : linkedinAccount ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "var(--sage)" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {linkedinAccount.profileName}
                </div>
                <button
                  onClick={() => handleDisconnect(linkedinAccount._id)}
                  className="text-[12px] font-medium"
                  style={{ color: "var(--rust)" }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <a
                href={`/api/auth/linkedin/connect?clientId=${client._id}`}
                className="flex items-center gap-1.5 text-[13px] font-semibold h-8 px-3 rounded-lg"
                style={{ background: "#0A66C2", color: "#fff" }}
              >
                <Linkedin className="w-3.5 h-3.5" /> Connect
              </a>
            )}
          </div>
          {linkedinStatus === "success" && (
            <p className="mt-2 text-[12px] flex items-center gap-1" style={{ color: "var(--sage)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected successfully
            </p>
          )}
          {linkedinStatus === "error" && (
            <p className="mt-2 text-[12px] flex items-center gap-1" style={{ color: "var(--rust)" }}>
              <XCircle className="w-3.5 h-3.5" /> {linkedinError}
            </p>
          )}
        </div>

        {/* Instagram — coming soon */}
        <div className="rounded-lg p-4 opacity-50" style={{ border: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/badge-instagram.svg" width={32} height={32} alt="Instagram" className="rounded-lg" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Instagram</p>
                <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>Coming soon</p>
              </div>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: "var(--sand)", color: "var(--ink-3)" }}>
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
