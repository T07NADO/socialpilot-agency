"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Linkedin, Instagram, Check } from "lucide-react";
import Link from "next/link";

type Platform = "LINKEDIN" | "INSTAGRAM";

export default function ComposePage({ params }: { params: { clientId: string } }) {
  const clientId = params.clientId as Id<"clients">;
  const router = useRouter();

  const client = useQuery(api.clients.get, { clientId });
  const generatePost = useAction(api.ai.generatePost);
  const createPost = useMutation(api.posts.create);

  const [platform, setPlatform] = useState<Platform>("LINKEDIN");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);
  const [editedContent, setEditedContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerate() {
    if (!brief.trim() || !client) return;
    setGenerating(true);
    try {
      const result = await generatePost({
        clientName: client.name,
        industry: client.industry,
        platform,
        brief,
        brandVoice: client.brandVoice
          ? {
              tone: client.brandVoice.tone,
              targetAudience: client.brandVoice.targetAudience,
              callToActionStyle: client.brandVoice.callToActionStyle,
              bannedWords: client.brandVoice.bannedWords,
              examplePosts: client.brandVoice.examplePosts,
            }
          : undefined,
      });
      const v = result.versions ?? [];
      setVersions(v);
      setSelected(0);
      setEditedContent(v[0]?.contentText ?? "");
    } catch (err: any) {
      alert(err.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(status: "DRAFT" | "PENDING_APPROVAL") {
    if (!editedContent.trim()) return;
    setSubmitting(true);
    try {
      await createPost({
        clientId,
        platform,
        contentText: editedContent,
        hashtags: versions[selected]?.hashtags ?? [],
        status,
      });
      router.push(`/clients/${clientId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/clients/${clientId}`} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compose Post</h1>
          {client && <p className="text-sm text-gray-400">{client.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — inputs */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-3">Platform</p>
            <div className="flex gap-3">
              {(["LINKEDIN", "INSTAGRAM"] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    platform === p
                      ? p === "LINKEDIN"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-pink-500 text-white border-pink-500"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p === "LINKEDIN" ? <Linkedin className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                  {p === "LINKEDIN" ? "LinkedIn" : "Instagram"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <label className="block text-sm font-medium mb-2">Content brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Describe what the post should be about, key message, any links or announcements…"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !brief.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-violet-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Generating…" : "Generate with AI"}
            </button>
          </div>

          {versions.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm font-medium mb-3">Choose a version</p>
              <div className="space-y-2">
                {versions.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelected(i); setEditedContent(v.contentText); }}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      selected === i ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === i ? "border-violet-600 bg-violet-600" : "border-gray-300"}`}>
                        {selected === i && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <p className="line-clamp-3 text-gray-700">{v.contentText}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — editor */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-2">Edit post</p>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={10}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Your post content will appear here after generation, or type directly…"
            />
            {versions[selected]?.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {versions[selected].hashtags.map((h: string) => (
                  <span key={h} className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded-md">
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit("DRAFT")}
              disabled={submitting || !editedContent.trim()}
              className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              onClick={() => handleSubmit("PENDING_APPROVAL")}
              disabled={submitting || !editedContent.trim()}
              className="flex-1 bg-violet-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
