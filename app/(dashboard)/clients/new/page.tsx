"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";

const INDUSTRIES = [
  "Technology", "E-commerce", "Healthcare", "Finance", "Education",
  "Real Estate", "Food & Beverage", "Fashion", "Travel", "SaaS",
  "Marketing Agency", "Consulting", "Media", "Non-profit", "Other",
];

const TONES = ["Professional", "Conversational", "Inspirational", "Witty", "Educational", "Bold"];

export default function NewClientPage() {
  const router = useRouter();
  const createClient = useMutation(api.clients.create);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    website: "",
    tone: "",
    targetAudience: "",
    callToActionStyle: "",
    bannedWords: [] as string[],
    bannedInput: "",
    examplePosts: [""],
  });

  function set(key: string, val: any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const clientId = await createClient({
        name: form.name,
        industry: form.industry,
        website: form.website || undefined,
        brandVoice: form.tone
          ? {
              tone: form.tone,
              targetAudience: form.targetAudience,
              callToActionStyle: form.callToActionStyle,
              bannedWords: form.bannedWords,
              examplePosts: form.examplePosts.filter(Boolean),
            }
          : undefined,
      });
      router.push(`/clients/${clientId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Client</h1>
          <p className="text-sm text-gray-500">Step {step} of 2</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-violet-600" : "bg-gray-200"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="font-semibold text-lg">Basic info</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Client name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry *</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => set("industry", ind)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.industry === ind
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-gray-200 text-gray-600 hover:border-violet-300"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://acmecorp.com"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!form.name || !form.industry}
            className="w-full bg-violet-600 text-white rounded-lg py-2 font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="font-semibold text-lg">Brand voice <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>

          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("tone", t)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.tone === t
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-gray-200 text-gray-600 hover:border-violet-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target audience</label>
            <input
              value={form.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Startup founders aged 25-40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CTA style</label>
            <input
              value={form.callToActionStyle}
              onChange={(e) => set("callToActionStyle", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="'Learn more', 'Book a demo', 'DM us'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banned words</label>
            <div className="flex gap-2 mb-2">
              <input
                value={form.bannedInput}
                onChange={(e) => set("bannedInput", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.bannedInput.trim()) {
                    set("bannedWords", [...form.bannedWords, form.bannedInput.trim()]);
                    set("bannedInput", "");
                  }
                }}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Type and press Enter"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {form.bannedWords.map((w) => (
                <span key={w} className="flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">
                  {w}
                  <button onClick={() => set("bannedWords", form.bannedWords.filter((x) => x !== w))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-violet-600 text-white rounded-lg py-2 font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create client"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
