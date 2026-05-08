"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

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
      }).then(() => {});
    }
  }, [isLoaded, user, agency]);

  if (!isLoaded || agency === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar agency={agency} />
      <main className="flex-1 ml-64 p-8 overflow-auto">{children}</main>
    </div>
  );
}
