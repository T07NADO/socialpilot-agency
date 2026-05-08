"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const agency = useQuery(api.agencies.get);
  const getOrCreate = useMutation(api.agencies.getOrCreate);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || agency === undefined) return;
    if (!user) { router.push("/sign-in"); return; }
    if (agency === null) {
      getOrCreate({
        name: user.fullName ?? user.username ?? "My Agency",
        email: user.primaryEmailAddress?.emailAddress ?? "",
      });
    }
  }, [isLoaded, user, agency]);

  if (!isLoaded || agency === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <Sidebar agency={agency} />
      <div className="flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-10 py-8 max-w-[1280px] w-full self-center">
          {children}
        </main>
      </div>
    </div>
  );
}
