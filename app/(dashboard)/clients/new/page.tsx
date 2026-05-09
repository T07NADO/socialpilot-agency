"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// ─── Design tokens helpers ──────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "var(--sand)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "'Geist', sans-serif",
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.outline = "none";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--line)";
}

// ─── Reusable components ─────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: "var(--ink-3)" }}>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] mt-1.5 leading-[1.5]" style={{ color: "var(--ink-4)" }}>
      {children}
    </p>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
      style={inputStyle}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg px-3.5 py-3 text-[14px] leading-[1.55] resize-none outline-none"
      style={inputStyle}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

function TagGroup({
  options,
  selected,
  onChange,
  multi = false,
  otherValue,
  onOtherChange,
}: {
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  multi?: boolean;
  otherValue: string;
  onOtherChange: (v: string) => void;
}) {
  function toggle(opt: string) {
    if (multi) {
      if (selected.includes(opt)) {
        onChange(selected.filter((s) => s !== opt));
        if (opt === "Other") onOtherChange("");
      } else {
        onChange([...selected, opt]);
      }
    } else {
      if (selected.includes(opt)) {
        onChange([]);
        if (opt === "Other") onOtherChange("");
      } else {
        if (selected.includes("Other") && opt !== "Other") onOtherChange("");
        onChange([opt]);
      }
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors"
              style={
                active
                  ? { background: "var(--ink)", color: "var(--ink-on)", borderColor: "var(--ink)" }
                  : { background: "var(--paper)", color: "var(--ink-2)", borderColor: "var(--line)" }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected.includes("Other") && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Tell us more"
          className="mt-3 w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

type F = {
  fullName: string;
  roleAndCompany: string;
  dayToDay: string;
  yearsExperience: string[];
  yearsExperienceOther: string;
  backgroundBefore: string;
  uniqueBackground: string;
  linkedinGoals: string[];
  linkedinGoalsOther: string;
  successMeasure: string;
  targetAudience: string;
  audiencePerception: string;
  communicationStyle: string[];
  communicationStyleOther: string;
  writingSamples: string;
  commonPhrases: string;
  cringeWords: string;
  resonantPost: string;
  controversialBeliefs: string;
  hardLesson: string;
  wishKnewEarlier: string;
  frequentQuestion: string;
  proudResult: string;
  failureMistake: string;
  cantTalkAbout: string;
  postsPerWeek: string[];
  postsPerWeekOther: string;
  avoidFormats: string[];
  avoidFormatsOther: string;
  admiredProfiles: string;
  anythingElse: string;
};

const empty: F = {
  fullName: "", roleAndCompany: "", dayToDay: "",
  yearsExperience: [], yearsExperienceOther: "",
  backgroundBefore: "", uniqueBackground: "",
  linkedinGoals: [], linkedinGoalsOther: "",
  successMeasure: "", targetAudience: "", audiencePerception: "",
  communicationStyle: [], communicationStyleOther: "",
  writingSamples: "", commonPhrases: "", cringeWords: "", resonantPost: "",
  controversialBeliefs: "", hardLesson: "", wishKnewEarlier: "", frequentQuestion: "",
  proudResult: "", failureMistake: "", cantTalkAbout: "",
  postsPerWeek: [], postsPerWeekOther: "",
  avoidFormats: [], avoidFormatsOther: "",
  admiredProfiles: "", anythingElse: "",
};

const SECTIONS = [
  "Who they are",
  "LinkedIn goals",
  "Voice and tone",
  "What they know",
  "Proof and results",
  "Content preferences",
];

function resolveTagValue(selected: string[], otherValue: string): string[] {
  const tags = selected.filter((s) => s !== "Other");
  if (selected.includes("Other") && otherValue.trim()) tags.push(otherValue.trim());
  return tags;
}

function resolveSingleTag(selected: string[], otherValue: string): string {
  if (selected.includes("Other")) return otherValue.trim() || "Other";
  return selected[0] ?? "";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewClientPage() {
  const router = useRouter();
  const createWithIntake = useMutation(api.clients.createWithIntake);
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>(empty);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof F>(key: K, val: F[K]) {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (!f.fullName.trim()) return;
    setLoading(true);
    try {
      const clientId = await createWithIntake({
        name: f.fullName.trim(),
        industry: f.roleAndCompany.trim() || "LinkedIn professional",
        intake: {
          fullName: f.fullName || undefined,
          roleAndCompany: f.roleAndCompany || undefined,
          dayToDay: f.dayToDay || undefined,
          yearsExperience: resolveSingleTag(f.yearsExperience, f.yearsExperienceOther) || undefined,
          backgroundBefore: f.backgroundBefore || undefined,
          uniqueBackground: f.uniqueBackground || undefined,
          linkedinGoals: resolveTagValue(f.linkedinGoals, f.linkedinGoalsOther).length ? resolveTagValue(f.linkedinGoals, f.linkedinGoalsOther) : undefined,
          successMeasure: f.successMeasure || undefined,
          targetAudience: f.targetAudience || undefined,
          audiencePerception: f.audiencePerception || undefined,
          communicationStyle: resolveTagValue(f.communicationStyle, f.communicationStyleOther).length ? resolveTagValue(f.communicationStyle, f.communicationStyleOther) : undefined,
          writingSamples: f.writingSamples || undefined,
          commonPhrases: f.commonPhrases || undefined,
          cringeWords: f.cringeWords || undefined,
          resonantPost: f.resonantPost || undefined,
          controversialBeliefs: f.controversialBeliefs || undefined,
          hardLesson: f.hardLesson || undefined,
          wishKnewEarlier: f.wishKnewEarlier || undefined,
          frequentQuestion: f.frequentQuestion || undefined,
          proudResult: f.proudResult || undefined,
          failureMistake: f.failureMistake || undefined,
          cantTalkAbout: f.cantTalkAbout || undefined,
          postsPerWeek: resolveSingleTag(f.postsPerWeek, f.postsPerWeekOther) || undefined,
          avoidFormats: resolveTagValue(f.avoidFormats, f.avoidFormatsOther).length ? resolveTagValue(f.avoidFormats, f.avoidFormatsOther) : undefined,
          admiredProfiles: f.admiredProfiles || undefined,
          anythingElse: f.anythingElse || undefined,
        },
      });
      router.push(`/clients/${clientId}`);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow-edge)",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" style={{ color: "var(--ink-4)" }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: "var(--ink-3)" }}>
            New client
          </div>
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.018em]">
            {SECTIONS[step]}
          </h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {SECTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i <= step ? "var(--ink)" : "var(--line)" }}
          />
        ))}
      </div>

      {/* Section 1 — Who they are */}
      {step === 0 && (
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <Label>Full name</Label>
            <TextInput value={f.fullName} onChange={(v) => set("fullName", v)} placeholder="Sarah Chen" />
          </div>
          <div>
            <Label>Current role and company</Label>
            <TextInput value={f.roleAndCompany} onChange={(v) => set("roleAndCompany", v)} placeholder="Head of Product at Acme Inc." />
          </div>
          <div>
            <Label>What do you actually do day to day</Label>
            <TextArea value={f.dayToDay} onChange={(v) => set("dayToDay", v)} placeholder="Not the job title — describe the decisions you make, problems you solve, and who you work with." rows={3} />
            <Hint>Not the job title. Describe the decisions you make, problems you solve, and who you work with.</Hint>
          </div>
          <div>
            <Label>Years of experience</Label>
            <TagGroup
              options={["0 to 2 years", "3 to 5 years", "6 to 10 years", "10+ years", "Other"]}
              selected={f.yearsExperience}
              onChange={(v) => set("yearsExperience", v)}
              otherValue={f.yearsExperienceOther}
              onOtherChange={(v) => set("yearsExperienceOther", v)}
            />
          </div>
          <div>
            <Label>What did you do before this role</Label>
            <TextArea value={f.backgroundBefore} onChange={(v) => set("backgroundBefore", v)} rows={3} />
            <Hint>Past roles, career pivots, industries. This often holds the most interesting content angles.</Hint>
          </div>
          <div>
            <Label>What is something about your background that most people in your industry do not have</Label>
            <TextArea value={f.uniqueBackground} onChange={(v) => set("uniqueBackground", v)} rows={3} />
            <Hint>A skill, perspective, or combination that is genuinely rare.</Hint>
          </div>
        </div>
      )}

      {/* Section 2 — LinkedIn goals */}
      {step === 1 && (
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <Label>Primary goal for LinkedIn in the next 6 months</Label>
            <TagGroup
              options={["Get hired", "Get clients", "Build authority", "Raise funding", "Build a network", "Grow my personal brand", "Get speaking gigs", "Other"]}
              selected={f.linkedinGoals}
              onChange={(v) => set("linkedinGoals", v)}
              multi
              otherValue={f.linkedinGoalsOther}
              onOtherChange={(v) => set("linkedinGoalsOther", v)}
            />
          </div>
          <div>
            <Label>What does success look like in concrete terms</Label>
            <TextArea value={f.successMeasure} onChange={(v) => set("successMeasure", v)} rows={3} />
            <Hint>Not "grow my following." What specific outcome tells you it is working.</Hint>
          </div>
          <div>
            <Label>Who specifically needs to see your content for that goal to happen</Label>
            <TextArea value={f.targetAudience} onChange={(v) => set("targetAudience", v)} rows={3} />
            <Hint>Their title, company size, industry, what they care about.</Hint>
          </div>
          <div>
            <Label>What does that person currently think about people in your role or space</Label>
            <TextArea value={f.audiencePerception} onChange={(v) => set("audiencePerception", v)} rows={3} />
            <Hint>What assumptions do they hold, what are they skeptical of.</Hint>
          </div>
        </div>
      )}

      {/* Section 3 — Voice and tone */}
      {step === 2 && (
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <Label>Which of these feels closest to how you naturally communicate</Label>
            <TagGroup
              options={["Direct and no fluff", "Warm and conversational", "Data-led and analytical", "Story-driven", "Provocative and opinionated", "Calm and thoughtful", "Dry humour", "Motivational", "Other"]}
              selected={f.communicationStyle}
              onChange={(v) => set("communicationStyle", v)}
              multi
              otherValue={f.communicationStyleOther}
              onOtherChange={(v) => set("communicationStyleOther", v)}
            />
          </div>
          <div>
            <Label>Paste 3 to 5 messages or emails you have actually written</Label>
            <TextArea value={f.writingSamples} onChange={(v) => set("writingSamples", v)} rows={8} />
            <Hint>Slack messages, client emails, WhatsApp messages to colleagues. Raw and unedited is better than polished.</Hint>
          </div>
          <div>
            <Label>Words or phrases you use a lot</Label>
            <TextArea value={f.commonPhrases} onChange={(v) => set("commonPhrases", v)} rows={3} />
            <Hint>Phrases that show up naturally in how you write or speak.</Hint>
          </div>
          <div>
            <Label>Words or phrases that make you cringe on LinkedIn</Label>
            <TextArea value={f.cringeWords} onChange={(v) => set("cringeWords", v)} rows={3} />
            <Hint>Language you want completely avoided in your posts.</Hint>
          </div>
          <div>
            <Label>A LinkedIn post whose tone or point of view resonated with you</Label>
            <TextArea value={f.resonantPost} onChange={(v) => set("resonantPost", v)} rows={3} />
            <Hint>Paste the link or copy the text.</Hint>
          </div>
        </div>
      )}

      {/* Section 4 — What they know and believe */}
      {step === 3 && (
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <Label>Three things you believe about your field that most people get wrong</Label>
            <TextArea value={f.controversialBeliefs} onChange={(v) => set("controversialBeliefs", v)} rows={5} />
            <Hint>Not safe opinions. The things where you privately disagree with mainstream advice.</Hint>
          </div>
          <div>
            <Label>A hard lesson you learned that changed how you work</Label>
            <TextArea value={f.hardLesson} onChange={(v) => set("hardLesson", v)} rows={4} />
          </div>
          <div>
            <Label>What do you know now that you wish you had known 3 years ago</Label>
            <TextArea value={f.wishKnewEarlier} onChange={(v) => set("wishKnewEarlier", v)} rows={4} />
          </div>
          <div>
            <Label>What question do people ask you the most</Label>
            <TextArea value={f.frequentQuestion} onChange={(v) => set("frequentQuestion", v)} rows={3} />
            <Hint>In meetings, DMs, conversations. The question that tells you what you are known for.</Hint>
          </div>
        </div>
      )}

      {/* Section 5 — Proof and results */}
      {step === 4 && (
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <Label>A specific result you have produced that you are proud of</Label>
            <TextArea value={f.proudResult} onChange={(v) => set("proudResult", v)} rows={4} />
            <Hint>Numbers, timelines, context. Company names can be kept confidential.</Hint>
          </div>
          <div>
            <Label>A failure or mistake you can talk about honestly</Label>
            <TextArea value={f.failureMistake} onChange={(v) => set("failureMistake", v)} rows={4} />
            <Hint>Needs to be real, not performed humility.</Hint>
          </div>
          <div>
            <Label>Anything you cannot talk about publicly</Label>
            <TextArea value={f.cantTalkAbout} onChange={(v) => set("cantTalkAbout", v)} rows={3} />
            <Hint>NDAs, sensitive company information, former employers.</Hint>
          </div>
        </div>
      )}

      {/* Section 6 — Content preferences */}
      {step === 5 && (
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <Label>How many posts per week are you willing to maintain</Label>
            <TagGroup
              options={["1 post a week", "2 to 3 posts a week", "Daily", "Flexible", "Other"]}
              selected={f.postsPerWeek}
              onChange={(v) => set("postsPerWeek", v)}
              otherValue={f.postsPerWeekOther}
              onOtherChange={(v) => set("postsPerWeekOther", v)}
            />
          </div>
          <div>
            <Label>Content formats you want to avoid</Label>
            <TagGroup
              options={["Numbered lists", "Long posts", "Personal stories", "Polls", "Carousels", "Motivational content", "Hot takes", "Other"]}
              selected={f.avoidFormats}
              onChange={(v) => set("avoidFormats", v)}
              multi
              otherValue={f.avoidFormatsOther}
              onOtherChange={(v) => set("avoidFormatsOther", v)}
            />
          </div>
          <div>
            <Label>LinkedIn profiles you admire</Label>
            <TextArea value={f.admiredProfiles} onChange={(v) => set("admiredProfiles", v)} rows={3} />
            <Hint>People whose posts you read fully. Paste 2 to 3 profile links.</Hint>
          </div>
          <div>
            <Label>Anything else that would help</Label>
            <TextArea value={f.anythingElse} onChange={(v) => set("anythingElse", v)} rows={3} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="h-10 px-5 rounded-lg text-sm font-medium"
            style={{ background: "var(--paper)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
          >
            Back
          </button>
        )}
        {step < SECTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !f.fullName.trim()}
            className="flex-1 h-10 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !f.fullName.trim()}
            className="flex-1 h-10 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
          >
            {loading ? "Creating client…" : "Create client"}
          </button>
        )}
      </div>

      {/* Skip link */}
      {step < SECTIONS.length - 1 && (
        <p className="text-center mt-3 text-[13px]" style={{ color: "var(--ink-4)" }}>
          <button type="button" onClick={() => setStep(SECTIONS.length - 1)} className="underline underline-offset-2">
            Skip to end
          </button>
        </p>
      )}
    </div>
  );
}
