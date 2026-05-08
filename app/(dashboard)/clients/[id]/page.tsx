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
    Queue: Calendar,
    Engagement: Zap,
    Analytics: BarChart2,
    Settings: Settings2,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-400">{client.industry}</p>
        </div>
        <Link
          href={`/compose/${client._id}`}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          <PenSquare className="w-4 h-4" /> Compose
        </Link>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => {
          const Icon = tabIcons[t];
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
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
  const updateClient = useMutation(api.clients.update);
  const saveSocialAccount = useMutation(api.socialAccounts.save);
  const removeSocialAccount = useMutation(api.socialAccounts.remove);
  const socialAccounts = useQuery(api.socialAccounts.listByClient, {
    clientId: client._id,
  });

  const [name, setName] = useState(client.name);
  const [saving, setSaving] = useState(false);
  const [linkedinStatus, setLinkedinStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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

  return (
    <div className="space-y-6 max-w-lg">
      {/* ── Client name ── */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Client settings</h2>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button
          onClick={async () => {
            setSaving(true);
            await updateClient({ clientId: client._id, name });
            setSaving(false);
          }}
          disabled={saving}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* ── Connected social accounts ── */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Connected accounts</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Connect the client's social accounts to enable auto-publishing.
          </p>
        </div>

        {/* LinkedIn */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                <p className="text-xs text-gray-400">Personal profile</p>
              </div>
            </div>

            {linkedinStatus === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : linkedinAccount ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {linkedinAccount.profileName}
                  </span>
                </div>
                <button
                  onClick={() => handleDisconnect(linkedinAccount._id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <a
                href={`/api/auth/linkedin/connect?clientId=${client._id}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                Connect
              </a>
            )}
          </div>

          {linkedinStatus === "success" && (
            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> LinkedIn connected
              successfully
            </p>
          )}
          {linkedinStatus === "error" && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> {linkedinError}
            </p>
          )}
        </div>

        {/* Instagram — placeholder until Meta app is ready */}
        <div className="border rounded-lg p-4 opacity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Instagram</p>
                <p className="text-xs text-gray-400">Coming soon</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
