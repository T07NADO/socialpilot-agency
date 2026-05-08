"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Users, FileText, Clock, BarChart2, CheckCircle, Plus } from "lucide-react";

export default function DashboardPage() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const pendingPosts = useQuery(api.posts.listPendingApprovals);

  const statCards = [
    { label: "Total Clients", value: stats?.totalClients ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Approval", value: stats?.pendingApprovals ?? 0, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Scheduled", value: stats?.scheduledPosts ?? 0, icon: FileText, color: "bg-violet-50 text-violet-600" },
    { label: "Published This Month", value: stats?.publishedThisMonth ?? 0, icon: BarChart2, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your agency</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" /> New Client
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {pendingPosts && pendingPosts.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
            <Link href="/approvals" className="text-sm text-violet-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {pendingPosts.slice(0, 3).map((post: any) => (
              <div key={post._id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${post.platform === "LINKEDIN" ? "bg-blue-500" : "bg-pink-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{post.client?.name}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{post.contentText}</p>
                </div>
                <Link
                  href="/approvals"
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-md hover:bg-violet-100"
                >
                  <CheckCircle className="w-3 h-3" /> Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
