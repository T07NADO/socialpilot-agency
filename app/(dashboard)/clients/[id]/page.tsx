"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, PenSquare, Calendar, BarChart2, Settings2, Zap } from "lucide-react";
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
  const [name, setName] = useState(client.name);
  const [saving, setSaving] = useState(false);

  return (
    <div className="bg-white rounded-xl border p-6 max-w-lg space-y-4">
      <h2 className="font-semibold">Client settings</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
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
  );
}
