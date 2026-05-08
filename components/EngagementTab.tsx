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

  const platforms = ["LINKEDIN", "INSTAGRAM"] as const;

  return (
    <div className="space-y-6">
      {platforms.map((platform) => {
        const platformRules = rules?.filter((r: any) => r.platform === platform) ?? [];
        return (
          <div key={platform} className="bg-white rounded-xl border p-5">
            <h3 className={`font-semibold mb-4 ${platform === "LINKEDIN" ? "text-blue-600" : "text-pink-500"}`}>
              {platform}
            </h3>
            <div className="space-y-3">
              {platformRules.map((rule: any) => (
                <div key={rule._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{RULE_LABELS[rule.ruleType]}</p>
                    <p className="text-xs text-gray-400">
                      {rule.enabled ? "Active, will run automatically" : "Disabled"}
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={rule.enabled}
                    onClick={() => toggleRule({ ruleId: rule._id, enabled: !rule.enabled })}
                    className={`relative w-10 h-6 rounded-full transition-colors ${rule.enabled ? "bg-violet-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.enabled ? "left-5" : "left-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
