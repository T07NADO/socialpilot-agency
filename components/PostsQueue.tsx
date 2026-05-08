"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle, Trash2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function PostsQueue({ clientId }: { clientId: Id<"clients"> }) {
  const posts = useQuery(api.posts.listByClient, { clientId });
  const approve = useMutation(api.posts.approve);
  const remove = useMutation(api.posts.remove);
  const schedule = useMutation(api.posts.schedule);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");

  const statuses = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"];

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING_APPROVAL: "bg-yellow-50 text-yellow-700",
    APPROVED: "bg-green-50 text-green-700",
    SCHEDULED: "bg-blue-50 text-blue-700",
    PUBLISHED: "bg-violet-50 text-violet-700",
    FAILED: "bg-red-50 text-red-600",
  };

  if (!posts) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border">
        <p className="text-gray-400">No posts yet — compose your first one</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post: any) => (
        <div key={post._id} className="bg-white rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${statusColor[post.status] ?? "bg-gray-100"}`}>
                  {post.status.replace("_", " ")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md ${post.platform === "LINKEDIN" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                  {post.platform}
                </span>
                {post.scheduledAt && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {format(new Date(post.scheduledAt), "MMM d, h:mm a")}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{post.contentText}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {post.status === "PENDING_APPROVAL" && (
                <button
                  onClick={() => approve({ postId: post._id })}
                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {post.status === "APPROVED" && (
                <button
                  onClick={() => setSchedulingId(post._id)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  title="Schedule"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => remove({ postId: post._id })}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {schedulingId === post._id && (
            <div className="mt-3 flex gap-2 border-t pt-3">
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={async () => {
                  if (!scheduleTime) return;
                  await schedule({ postId: post._id, scheduledAt: new Date(scheduleTime).getTime() });
                  setSchedulingId(null);
                  setScheduleTime("");
                }}
                className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-violet-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setSchedulingId(null)}
                className="border px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
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
