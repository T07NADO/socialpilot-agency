"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileNav from "@/components/MobileNav";

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
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <div className="hidden md:block">
        <Sidebar agency={agency} />
      </div>
      <div className="flex flex-col min-w-0">
        <Topbar agency={agency} />
        <main className="flex-1 px-4 py-5 md:px-10 md:py-8 max-w-[1280px] w-full self-center pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
