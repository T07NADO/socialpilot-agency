"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

type Platform = "LINKEDIN";

function buildPersonContext(intake: any): string {
  const lines: string[] = [];
  const add = (label: string, val: any) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return;
    lines.push(`${label}: ${Array.isArray(val) ? val.join(", ") : val}`);
  };

  lines.push("You are ghostwriting for a real person. Write in first person, in their voice.");
  lines.push("");
  lines.push("ABOUT THIS PERSON:");
  add("Name", intake.fullName);
  add("Role", intake.roleAndCompany);
  add("Day to day", intake.dayToDay);
  add("Years of experience", intake.yearsExperience);
  add("Background before current role", intake.backgroundBefore);
  add("Unique background", intake.uniqueBackground);
  lines.push("");
  lines.push("LINKEDIN STRATEGY:");
  add("Goals", intake.linkedinGoals);
  add("What success looks like", intake.successMeasure);
  add("Target audience", intake.targetAudience);
  add("What audience currently thinks", intake.audiencePerception);
  lines.push("");
  lines.push("VOICE AND TONE:");
  add("Communication style", intake.communicationStyle);
  add("Words and phrases they naturally use", intake.commonPhrases);
  add("Language to avoid", intake.cringeWords);
  if (intake.writingSamples) {
    lines.push("");
    lines.push("REAL WRITING SAMPLES (match this voice exactly):");
    lines.push(intake.writingSamples);
  }
  lines.push("");
  lines.push("EXPERTISE AND BELIEFS:");
  add("Controversial opinions about their field", intake.controversialBeliefs);
  add("Hard lesson learned", intake.hardLesson);
  add("What they know now vs 3 years ago", intake.wishKnewEarlier);
  add("What people ask them most", intake.frequentQuestion);
  add("Proud result", intake.proudResult);
  lines.push("");
  lines.push("CONSTRAINTS:");
  add("Cannot talk about publicly", intake.cantTalkAbout);
  add("Content formats to avoid", intake.avoidFormats);

  return lines.join("\n");
}

export default function ComposePage({ params }: { params: { clientId: string } }) {
  const clientId = params.clientId as Id<"clients">;
  const router = useRouter();

  const client = useQuery(api.clients.get, { clientId });
  const intake = useQuery(api.clients.getIntake, { clientId });
  const generatePost = useAction(api.ai.generatePost);
  const createPost   = useMutation(api.posts.create);

  const platform: Platform = "LINKEDIN";
  const [brief, setBrief]             = useState("");
  const [generating, setGenerating]   = useState(false);
  const [versions, setVersions]       = useState<any[]>([]);
  const [selected, setSelected]       = useState(0);
  const [editedContent, setEdited]    = useState("");
  const [submitting, setSubmitting]   = useState(false);

  async function handleGenerate() {
    if (!brief.trim() || !client) return;
    setGenerating(true);
    try {
      const personContext = intake ? buildPersonContext(intake) : undefined;
      const result = await generatePost({
        clientName: client.name,
        industry:   client.industry,
        platform,
        brief,
        brandVoice: client.brandVoice ?? undefined,
        personContext,
      });
      const v = result.versions ?? [];
      setVersions(v);
      setSelected(0);
      setEdited(v[0]?.contentText ?? "");
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
    <div>
      {/* Page head */}
      <div className="flex items-center gap-3 mb-7">
        <Link href={`/clients/${clientId}`} style={{ color: "var(--ink-4)" }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] flex items-center gap-2 mb-1" style={{ color: "var(--ink-3)" }}>
            {client?.name} · Composer
          </div>
          <h1 className="font-display text-[32px] font-semibold tracking-[-0.022em]">What's the post about?</h1>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        {/* Left — brief + versions */}
        <div>
          {/* Brief card */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
          >
            <label className="block text-[12px] font-medium uppercase tracking-[0.08em] mb-2" style={{ color: "var(--ink-2)" }}>
              Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3.5 py-3.5 text-[15px] leading-[1.5] resize-none outline-none transition-shadow"
              placeholder="In one or two sentences…"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                fontFamily: "'Geist', sans-serif",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
            />

            {/* Platform indicator */}
            <div className="flex gap-2 mt-4">
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px] font-medium"
                style={{ background: "var(--ink)", color: "var(--ink-on)", borderColor: "var(--ink)" }}
              >
                <Image src="/badge-linkedin.svg" width={16} height={16} alt="LinkedIn" />
                LinkedIn
              </div>
            </div>

            {/* Generate */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleGenerate}
                disabled={generating || !brief.trim()}
                className="flex items-center gap-2 text-sm font-semibold h-11 px-5 rounded-lg disabled:opacity-40 transition-colors"
                style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                {generating ? "Generating…" : "Generate 3 versions"}
              </button>
              <span className="text-[12px] font-mono" style={{ color: "var(--ink-4)" }}>
                llama-3.3-70b
              </span>
            </div>
          </div>

          {/* Version cards */}
          {versions.length > 0 && (
            <div className="grid grid-cols-3 gap-3.5">
              {versions.map((v, i) => (
                <button
                  key={i}
                  onClick={() => { setSelected(i); setEdited(v.contentText); }}
                  className="text-left rounded-xl p-4 flex flex-col gap-2.5 transition-shadow cursor-pointer"
                  style={
                    selected === i
                      ? { background: "var(--paper)", border: "2px solid var(--ink)", boxShadow: "var(--shadow-1)" }
                      : { background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.05em]" style={{ color: "var(--ink-3)" }}>
                      v{i + 1} · LI
                    </span>
                    {selected === i ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "var(--ink)" }}>
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "var(--ink-4)" }}>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-[14px] leading-[1.55] line-clamp-4" style={{ color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                    {v.contentText}
                  </p>
                  {v.hashtags?.length > 0 && (
                    <p className="text-[12px]" style={{ color: "var(--sky-ink)" }}>
                      {v.hashtags.map((h: string) => `#${h}`).join(" · ")}
                    </p>
                  )}
                  <div
                    className="flex justify-between text-[11px] font-mono pt-2 mt-auto"
                    style={{ borderTop: "1px dashed var(--line)", color: "var(--ink-4)" }}
                  >
                    <span>{v.contentText.split(" ").length} words</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — brand voice + edit + schedule */}
        <div className="space-y-4">
          {/* Brand voice */}
          {client?.brandVoice && (
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
            >
              <h3 className="font-display text-[16px] font-semibold mb-3">Brand voice</h3>
              {[
                { label: "Tone",      val: client.brandVoice.tone },
                { label: "Audience",  val: client.brandVoice.targetAudience },
                { label: "CTA style", val: client.brandVoice.callToActionStyle },
              ].map(({ label, val }) => val && (
                <div key={label} className="py-2.5" style={{ borderBottom: "1px dashed var(--line)" }}>
                  <div className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: "var(--ink-3)" }}>{label}</div>
                  <div className="text-[14px]" style={{ color: "var(--ink-2)" }}>{val}</div>
                </div>
              ))}
              {client.brandVoice.bannedWords?.length > 0 && (
                <div className="py-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: "var(--ink-3)" }}>Banned</div>
                  <div className="flex flex-wrap gap-1">
                    {client.brandVoice.bannedWords.map((w: string) => (
                      <span key={w} className="text-[12px] px-2.5 py-0.5 rounded-full line-through" style={{ background: "var(--rust-soft)", color: "var(--rust-ink)" }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit content */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" }}
          >
            <h3 className="font-display text-[16px] font-semibold mb-3">Edit post</h3>
            <textarea
              value={editedContent}
              onChange={(e) => setEdited(e.target.value)}
              rows={8}
              className="w-full rounded-lg px-3.5 py-3 text-[14px] leading-[1.55] resize-none outline-none transition-shadow"
              placeholder="Post content will appear here after generation, or type directly…"
              style={{
                background: "var(--sand)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                fontFamily: "'Geist', sans-serif",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
            />
            {versions[selected]?.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {versions[selected].hashtags.map((h: string) => (
                  <span key={h} className="text-[12px] px-2.5 py-0.5 rounded-full" style={{ background: "var(--sky-soft)", color: "var(--sky-ink)" }}>
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit("DRAFT")}
              disabled={submitting || !editedContent.trim()}
              className="flex-1 text-sm font-medium h-10 rounded-lg disabled:opacity-40"
              style={{ background: "var(--paper)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
            >
              Save draft
            </button>
            <button
              onClick={() => handleSubmit("PENDING_APPROVAL")}
              disabled={submitting || !editedContent.trim()}
              className="flex-1 text-sm font-semibold h-10 rounded-lg disabled:opacity-40"
              style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
            >
              {submitting ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
