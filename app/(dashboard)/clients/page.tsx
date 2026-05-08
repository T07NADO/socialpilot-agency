"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Plus, Linkedin, Instagram, PenSquare } from "lucide-react";

export default function ClientsPage() {
  const clients = useQuery(api.clients.list);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients?.length ?? 0} active clients</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" /> New Client
        </Link>
      </div>

      {!clients ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <p className="text-gray-400 text-lg mb-4">No clients yet</p>
          <Link href="/clients/new" className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client: any) => (
            <div key={client._id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{client.industry}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                  {client.postCount} posts
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {client.socialAccounts.some((a: any) => a.platform === "LINKEDIN") ? (
                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </span>
                ) : null}
                {client.socialAccounts.some((a: any) => a.platform === "INSTAGRAM") ? (
                  <span className="flex items-center gap-1 text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-md">
                    <Instagram className="w-3 h-3" /> Instagram
                  </span>
                ) : null}
                {client.socialAccounts.length === 0 && (
                  <span className="text-xs text-gray-400">No accounts connected</span>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/clients/${client._id}`}
                  className="flex-1 text-center text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Manage
                </Link>
                <Link
                  href={`/compose/${client._id}`}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700"
                >
                  <PenSquare className="w-3 h-3" /> Compose
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
