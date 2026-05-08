"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

function ClientAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35, background: `hsl(${hue},55%,42%)` }}
    >
      {initials}
    </div>
  );
}

export default function ClientsPage() {
  const clients = useQuery(api.clients.list);

  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] mb-2" style={{ color: "var(--ink-3)" }}>
            Clients
          </div>
          <h1 className="font-display text-[36px] font-semibold tracking-[-0.022em] leading-[1.1]">
            {clients == null ? "…" : clients.length === 0 ? "No clients yet" : `${clients.length} client${clients.length === 1 ? "" : "s"}`}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--ink-3)" }}>
            Click any card to manage posts and settings.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-1.5 text-sm font-semibold h-9 px-4 rounded-lg"
          style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
        >
          + New client
        </Link>
      </div>

      {!clients ? (
        <div className="grid grid-cols-2 gap-3.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl h-36 animate-pulse" style={{ background: "var(--paper)" }} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl"
          style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <p className="text-[15px] mb-4" style={{ color: "var(--ink-4)" }}>No clients yet</p>
          <Link
            href="/clients/new"
            className="inline-flex text-sm font-semibold px-5 h-9 items-center rounded-lg"
            style={{ background: "var(--ink)", color: "var(--ink-on)" }}
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {clients.map((client: any) => (
            <Link
              key={client._id}
              href={`/clients/${client._id}`}
              className="block rounded-xl p-5 transition-shadow hover:shadow-1"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
            >
              {/* Top */}
              <div className="flex items-center gap-3 mb-3.5">
                <ClientAvatar name={client.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[18px] font-semibold tracking-[-0.012em] truncate">{client.name}</div>
                  <div className="text-xs truncate" style={{ color: "var(--ink-3)" }}>{client.industry}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {client.socialAccounts?.some((a: any) => a.platform === "LINKEDIN") && (
                    <Image src="/badge-linkedin.svg" width={18} height={18} alt="LinkedIn" />
                  )}
                  {client.socialAccounts?.some((a: any) => a.platform === "INSTAGRAM") && (
                    <Image src="/badge-instagram.svg" width={18} height={18} alt="Instagram" />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div
                className="grid grid-cols-3 gap-3 pt-3.5"
                style={{ borderTop: "1px dashed var(--line)" }}
              >
                {[
                  { k: "Posts · 30d", v: client.postCount ?? 0 },
                  { k: "Pending", v: client.pendingCount ?? 0, accent: (client.pendingCount ?? 0) > 0 },
                  { k: "Accounts", v: client.socialAccounts?.length ?? 0 },
                ].map(({ k, v, accent }) => (
                  <div key={k}>
                    <div className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: "var(--ink-3)" }}>
                      {k}
                    </div>
                    <div
                      className="font-display text-[20px] font-semibold tracking-[-0.012em]"
                      style={{ color: accent ? "var(--gold-cta-ink)" : "var(--ink)" }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
