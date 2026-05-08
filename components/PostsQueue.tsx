"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import { Trash2, Calendar } from "lucide-react";

const STATUS_CHIP: Record<string, string> = {
  DRAFT: "chip-draft",
  PENDING_APPROVAL: "chip-pending",
  APPROVED: "chip-approved",
  SCHEDULED: "chip-scheduled",
  PUBLISHED: "chip-published",
  FAILED: "chip-failed",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Needs approval",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  FAILED: "Failed",
};

export default function PostsQueue({ clientId }: { clientId: Id<"clients"> }) {
  const posts    = useQuery(api.posts.listByClient, { clientId });
  const approve  = useMutation(api.posts.approve);
  const remove   = useMutation(api.posts.remove);
  const schedule = useMutation(api.posts.schedule);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");

  if (!posts) return <div className="h-48 rounded-xl animate-pulse" style={{ background: "var(--sand)" }} />;

  if (posts.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-xl"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <p className="text-[14px]" style={{ color: "var(--ink-4)" }}>No posts yet. Compose your first one</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
    >
      {posts.map((post: any, idx: number) => (
        <div
          key={post._id}
          style={{ borderBottom: idx < posts.length - 1 ? "1px solid var(--line)" : undefined }}
        >
          <div
            className="grid items-center gap-4 px-5 py-4"
            style={{ gridTemplateColumns: "auto 1fr auto auto auto" }}
          >
            {/* Platform badge */}
            {post.platform === "LINKEDIN" && (
              <Image src="/badge-linkedin.svg" width={18} height={18} alt="LinkedIn" />
            )}

            {/* Content */}
            <div className="min-w-0">
              <p className="text-[14px] line-clamp-2 leading-[1.5]" style={{ color: "var(--ink-2)" }}>
                {post.contentText}
              </p>
              {post.scheduledAt && (
                <p className="text-[12px] font-mono mt-1" style={{ color: "var(--sky-ink)" }}>
                  {format(new Date(post.scheduledAt), "MMM d · h:mm a")}
                </p>
              )}
            </div>

            {/* Status */}
            <span className={`chip ${STATUS_CHIP[post.status] ?? "chip-draft"}`}>
              <span className="chip-dot" />
              {STATUS_LABEL[post.status] ?? post.status}
            </span>

            {/* Approve if pending */}
            {post.status === "PENDING_APPROVAL" && (
              <button
                onClick={() => approve({ postId: post._id })}
                className="text-[12px] font-semibold h-7 px-3 rounded-lg"
                style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
              >
                Approve
              </button>
            )}

            {/* Schedule if approved */}
            {post.status === "APPROVED" && (
              <button
                onClick={() => setSchedulingId(post._id)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: "var(--sky-soft)", color: "var(--sky-ink)" }}
                title="Schedule"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => remove({ postId: post._id })}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "var(--rust-soft)", color: "var(--rust)" }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Schedule picker */}
          {schedulingId === post._id && (
            <div
              className="flex gap-2 px-5 pb-4"
              style={{ borderTop: "1px dashed var(--line)" }}
            >
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--sand)", border: "1px solid var(--line)", color: "var(--ink)", fontFamily: "'Geist', sans-serif" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--line)")}
              />
              <button
                onClick={async () => {
                  if (!scheduleTime) return;
                  await schedule({ postId: post._id, scheduledAt: new Date(scheduleTime).getTime() });
                  setSchedulingId(null);
                  setScheduleTime("");
                }}
                className="text-sm font-semibold h-9 px-4 rounded-lg"
                style={{ background: "var(--ink)", color: "var(--ink-on)" }}
              >
                Confirm
              </button>
              <button
                onClick={() => setSchedulingId(null)}
                className="text-sm font-medium h-9 px-3 rounded-lg"
                style={{ color: "var(--ink-3)", border: "1px solid var(--line)" }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
