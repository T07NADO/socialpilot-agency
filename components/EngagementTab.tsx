"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const RULE_LABELS: Record<string, string> = {
  AUTO_REPLY: "Auto-reply to comments",
  AUTO_LIKE: "Auto-like comments",
  AUTO_FOLLOW: "Auto-follow commenters",
};

export default function EngagementTab({ clientId }: { clientId: Id<"clients"> }) {
  const rules = useQuery(api.engagement.getRules, { clientId });
  const toggleRule = useMutation(api.engagement.toggleRule);

  const linkedinRules = rules?.filter((r: any) => r.platform === "LINKEDIN") ?? [];
  const cardStyle = { background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-edge)" };

  if (!rules) {
    return <div className="animate-pulse h-48 rounded-xl" style={{ background: "var(--sand)" }} />;
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <img src="/badge-linkedin.svg" width={18} height={18} alt="LinkedIn" />
          <h3 className="font-display text-[16px] font-semibold">LinkedIn automation</h3>
        </div>

        {linkedinRules.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>No engagement rules configured.</p>
        ) : (
          <div className="space-y-0">
            {linkedinRules.map((rule: any, idx: number) => (
              <div
                key={rule._id}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: idx < linkedinRules.length - 1 ? "1px solid var(--line)" : undefined }}
              >
                <div>
                  <p className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>
                    {RULE_LABELS[rule.ruleType]}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>
                    {rule.enabled ? "Active, will run automatically" : "Disabled"}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={rule.enabled}
                  onClick={() => toggleRule({ ruleId: rule._id, enabled: !rule.enabled })}
                  className="relative flex-shrink-0 w-10 h-6 rounded-full transition-colors"
                  style={{ background: rule.enabled ? "var(--ink)" : "var(--line)" }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full shadow transition-all"
                    style={{
                      background: "var(--paper)",
                      left: rule.enabled ? "1.25rem" : "0.25rem",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
