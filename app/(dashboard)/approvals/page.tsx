"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

function ClientAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue},55%,42%)` }}
    >
      {initials}
    </div>
  );
}

export default function ApprovalsPage() {
  const posts = useQuery(api.posts.listPendingApprovals);
  const approve = useMutation(api.posts.approve);
  const reject  = useMutation(api.posts.reject);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPost = posts?.find((p: any) => p._id === selected) ?? posts?.[0] ?? null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-edge)",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        minHeight: "calc(100vh - 128px)",
      }}
    >
      {/* Inbox */}
      <div style={{ borderRight: "1px solid var(--line)" }}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <h2 className="font-display text-[18px] font-semibold">Approvals</h2>
          {posts && posts.length > 0 && (
            <span className="chip chip-pending">
              <span className="chip-dot" />{posts.length} waiting
            </span>
          )}
        </div>

        {!posts ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "var(--sand)" }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
            All caught up
          </div>
        ) : (
          posts.map((post: any) => {
            const isActive = (selected ?? posts[0]?._id) === post._id;
            const age = formatDistanceToNow(new Date(post._creationTime), { addSuffix: false });
            const isUrgent = post._creationTime < Date.now() - 86400000;
            return (
              <button
                key={post._id}
                onClick={() => setSelected(post._id)}
                className="w-full text-left grid items-start gap-2.5 px-5 py-3.5 transition-colors"
                style={{
                  gridTemplateColumns: "28px 1fr auto",
                  borderBottom: "1px solid var(--line)",
                  background: isActive ? "var(--sand)" : undefined,
                  borderLeft: isActive ? "3px solid var(--gold-cta)" : "3px solid transparent",
                }}
              >
                <ClientAvatar name={post.client?.name ?? "?"} size={28} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>
                    {post.client?.name} · {post.contentText.slice(0, 28)}…
                  </div>
                  <div className="text-[12px] mt-0.5 line-clamp-1" style={{ color: "var(--ink-3)" }}>
                    {post.contentText}
                  </div>
                </div>
                <div className="text-[11px] font-mono" style={{ color: isUrgent ? "var(--rust)" : "var(--ink-4)" }}>
                  {age}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Review panel */}
      <div className="p-8" style={{ background: "var(--cream)" }}>
        {!selectedPost ? (
          <div className="h-full flex items-center justify-center text-[14px]" style={{ color: "var(--ink-4)" }}>
            Select a post to review
          </div>
        ) : (
          <>
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-5 text-[13px]" style={{ color: "var(--ink-3)" }}>
              <ClientAvatar name={selectedPost.client?.name ?? "?"} size={32} />
              <div>
                <div className="font-semibold" style={{ color: "var(--ink)" }}>{selectedPost.client?.name}</div>
                <div>{selectedPost.contentText.slice(0, 40)}…</div>
              </div>
              <span className="chip chip-pending ml-auto"><span className="chip-dot" />Pending</span>
              {selectedPost.platform === "LINKEDIN" && (
                <Image src="/badge-linkedin.svg" width={22} height={22} alt="LinkedIn" />
              )}
            </div>

            {/* Post shell */}
            <div
              className="rounded-xl p-6 mb-5 max-w-2xl"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <ClientAvatar name={selectedPost.client?.name ?? "?"} size={40} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {selectedPost.client?.name}
                  </div>
                  <div className="text-[12px] font-mono" style={{ color: "var(--ink-3)" }}>
                    {selectedPost.platform}
                  </div>
                </div>
                {selectedPost.platform === "LINKEDIN" && (
                  <Image src="/badge-linkedin.svg" width={20} height={20} alt="" className="ml-auto" />
                )}
              </div>

              <p
                className="text-[16px] leading-[1.6] whitespace-pre-wrap mb-4"
                style={{ color: "var(--ink)" }}
              >
                {selectedPost.contentText}
              </p>

              {selectedPost.hashtags?.length > 0 && (
                <p className="text-[13px] mb-4" style={{ color: "var(--sky-ink)" }}>
                  {selectedPost.hashtags.map((h: string) => `#${h}`).join(" · ")}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 max-w-2xl">
              <button
                onClick={() => approve({ postId: selectedPost._id as Id<"posts"> })}
                className="flex items-center gap-2 text-sm font-semibold h-10 px-5 rounded-lg"
                style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
              >
                Approve & schedule
              </button>
              <button
                onClick={() => reject({ postId: selectedPost._id as Id<"posts"> })}
                className="flex items-center gap-2 text-sm font-semibold h-10 px-5 rounded-lg"
                style={{ background: "var(--ink)", color: "var(--ink-on)" }}
              >
                Request changes
              </button>
              <button
                onClick={() => reject({ postId: selectedPost._id as Id<"posts"> })}
                className="ml-auto flex items-center gap-2 text-sm font-medium h-10 px-5 rounded-lg"
                style={{ color: "var(--ink-3)" }}
              >
                Back to drafts
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
