"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle, XCircle, Linkedin, Instagram, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApprovalsPage() {
  const posts = useQuery(api.posts.listPendingApprovals);
  const approve = useMutation(api.posts.approve);
  const reject = useMutation(api.posts.reject);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">{posts?.length ?? 0} posts waiting</p>
        </div>
        {posts && posts.length > 0 && (
          <button
            onClick={() => posts.forEach((p: any) => approve({ postId: p._id }))}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" /> Approve all
          </button>
        )}
      </div>

      {!posts ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">All caught up — no pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <div key={post._id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {post.platform === "LINKEDIN" ? (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md">
                        <Instagram className="w-3 h-3" /> Instagram
                      </span>
                    )}
                    <span className="text-xs font-medium text-gray-700">{post.client?.name}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{post.contentText}</p>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags.map((h: string) => (
                        <span key={h} className="text-xs text-violet-500">#{h}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve({ postId: post._id as Id<"posts"> })}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => reject({ postId: post._id as Id<"posts"> })}
                    className="flex items-center gap-1.5 border border-red-200 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
