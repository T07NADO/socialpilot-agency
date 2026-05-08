"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heart, MessageCircle, Eye, Send } from "lucide-react";

export default function AnalyticsTab({ clientId }: { clientId: Id<"clients"> }) {
  const stats = useQuery(api.analytics.getClientStats, { clientId });

  if (!stats) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;

  const metrics = [
    { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "text-red-500" },
    { label: "Comments", value: stats.totalComments, icon: MessageCircle, color: "text-blue-500" },
    { label: "Impressions", value: stats.totalImpressions, icon: Eye, color: "text-violet-500" },
    { label: "Published", value: stats.publishedPosts, icon: Send, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Posts by platform — last 8 weeks</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.weeklyBreakdown} barSize={10}>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="LINKEDIN" fill="#0A66C2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="INSTAGRAM" fill="#E1306C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(stats.byPlatform).map(([platform, count]) => (
          <div key={platform} className="bg-white rounded-xl border p-4">
            <p className={`text-sm font-medium mb-1 ${platform === "LINKEDIN" ? "text-blue-600" : "text-pink-500"}`}>
              {platform}
            </p>
            <p className="text-2xl font-bold">{count as number}</p>
            <p className="text-xs text-gray-400">published posts</p>
          </div>
        ))}
      </div>
    </div>
  );
}
