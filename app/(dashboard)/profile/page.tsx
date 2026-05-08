"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Camera, Loader2 } from "lucide-react";

function AgencyLogoUpload({
  logoUrl,
  agencyName,
  onUploaded,
}: {
  logoUrl: string | null | undefined;
  agencyName: string;
  onUploaded: (storageId: Id<"_storage">) => void;
}) {
  const generateUploadUrl = useMutation(api.agencies.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = agencyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = Array.from(agencyName).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      onUploaded(storageId as Id<"_storage">);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="relative w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center group flex-shrink-0"
        style={{ background: logoUrl ? "transparent" : `hsl(${hue},55%,42%)` }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Agency logo" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[22px] font-semibold text-white">{initials}</span>
        )}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </button>
      <div>
        <p className="text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>Agency logo</p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>
          PNG or JPG, square recommended
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-2 text-[12px] font-semibold h-7 px-3 rounded-lg disabled:opacity-40"
          style={{ background: "var(--sand)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const agency = useQuery(api.agencies.get);
  const updateProfile = useMutation(api.agencies.updateProfile);

  const [agencyName, setAgencyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingLogoId, setPendingLogoId] = useState<Id<"_storage"> | null>(null);
  const [savingAgency, setSavingAgency] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [agencySaved, setAgencySaved] = useState(false);
  const [userSaved, setUserSaved] = useState(false);

  useEffect(() => {
    if (agency) setAgencyName(agency.name);
  }, [agency?.name]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user?.id]);

  async function saveAgency() {
    setSavingAgency(true);
    try {
      await updateProfile({
        name: agencyName,
        logoStorageId: pendingLogoId ?? undefined,
      });
      setPendingLogoId(null);
      setAgencySaved(true);
      setTimeout(() => setAgencySaved(false), 2000);
    } finally {
      setSavingAgency(false);
    }
  }

  async function saveUser() {
    if (!user) return;
    setSavingUser(true);
    try {
      await user.update({ firstName, lastName });
      setUserSaved(true);
      setTimeout(() => setUserSaved(false), 2000);
    } finally {
      setSavingUser(false);
    }
  }

  const cardStyle = {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow-edge)",
  };
  const inputStyle = {
    background: "var(--sand)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    fontFamily: "'Geist', sans-serif",
  };
  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 6,
    color: "var(--ink-3)",
  };

  if (!isLoaded || agency === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--ink-4)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.12em] mb-2"
          style={{ color: "var(--ink-3)" }}
        >
          Settings
        </div>
        <h1 className="font-display text-[36px] font-semibold tracking-[-0.022em] leading-[1.1]">
          Profile
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--ink-3)" }}>
          Manage your agency and account settings.
        </p>
      </div>

      <div className="space-y-5 max-w-lg">
        {/* Agency card */}
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <h2 className="font-display text-[18px] font-semibold">Agency</h2>
            <p className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
              Branding and name shown across the app.
            </p>
          </div>

          <AgencyLogoUpload
            logoUrl={pendingLogoId ? null : agency?.logoUrl}
            agencyName={agencyName || "Agency"}
            onUploaded={(id) => setPendingLogoId(id)}
          />

          <div>
            <label style={labelStyle}>Agency name</label>
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
            />
          </div>

          <button
            onClick={saveAgency}
            disabled={savingAgency || (!agencyName.trim())}
            className="text-sm font-semibold h-9 px-4 rounded-lg disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--ink-on)" }}
          >
            {savingAgency ? "Saving…" : agencySaved ? "Saved" : "Save changes"}
          </button>
        </div>

        {/* User card */}
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <div>
            <h2 className="font-display text-[18px] font-semibold">Account</h2>
            <p className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
              Your personal account details.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <div
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ ...inputStyle, opacity: 0.6, cursor: "default" }}
            >
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </div>
          </div>

          <button
            onClick={saveUser}
            disabled={savingUser}
            className="text-sm font-semibold h-9 px-4 rounded-lg disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--ink-on)" }}
          >
            {savingUser ? "Saving…" : userSaved ? "Saved" : "Save changes"}
          </button>
        </div>

        {/* Plan card */}
        <div className="rounded-xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[18px] font-semibold">Plan</h2>
              <p className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
                You are on the{" "}
                <span className="font-semibold" style={{ color: "var(--ink)" }}>
                  {agency?.plan ?? "Free"}
                </span>{" "}
                plan.
              </p>
            </div>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.06em]"
              style={{ background: "var(--gold-cta)", color: "var(--gold-cta-ink)" }}
            >
              {agency?.plan ?? "FREE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
