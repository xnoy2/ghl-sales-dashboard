import DashboardClient from "@/components/dashboard/DashboardClient";
import PipelineSwitcher from "@/components/dashboard/PipelineSwitcher";
import { headers } from "next/headers";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getDashboardStats,
  getOpportunities,
  getTeam,
  getActivity,
  getAlerts,
} from "@/lib/ghl";
import Navbar from "@/components/dashboard/Navbar";
import StatGrid from "@/components/dashboard/StatGrid";
import TeamActivity from "@/components/dashboard/TeamActivity";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import type { PipelineStage } from "@/types";
import { ACCOUNTS } from "@/lib/accounts"; // ✅ NEW
import PipelineBoard from "@/components/dashboard/PipelineBoard";
import { STAGE_MAP } from "@/lib/stageMap"; // adjust path if needed


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ pipeline?: string; account?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const params = await searchParams;

  // ✅ PIPELINE
  const pipeline =
    params?.pipeline === "SALES" ? "SALES" : "LEAD";

  // ✅ ACCOUNT (NEW)
  const account =
    params?.account === "BGR" ? "BGR" : "BCF";

  const config = ACCOUNTS[account];

  // ✅ DYNAMIC PIPELINE ID (BASED ON ACCOUNT)
  const pipelineId =
    pipeline === "SALES"
      ? config.pipelines.SALES
      : config.pipelines.LEAD;

  console.log("ACCOUNT:", account);
  console.log("PIPELINE:", pipeline);
  console.log("PIPELINE ID:", pipelineId);

  // ✅ FETCH DATA (NOW WITH ACCOUNT)
  const [stats, leads, team, activity, alerts] = await Promise.all([
    getDashboardStats(pipelineId, account),
    getOpportunities(pipelineId, account),
    getTeam(),
    getActivity(pipelineId, account),
    getAlerts(pipelineId, account),
  ]);

  const PIPELINE_STAGES: Record<
    "LEAD" | "SALES",
    Omit<PipelineStage, "leads">[]
  > = {
    LEAD: [
      {
        id: "new",
        label: "New Lead",
        color: "bg-blue-500",
        textColor: "text-blue-600",
        borderColor: "border-blue-200",
      },
      {
        id: "warm",
        label: "Warm",
        color: "bg-orange-500",
        textColor: "text-orange-600",
        borderColor: "border-orange-200",
      },
      {
        id: "quote",
        label: "Quote Sent",
        color: "bg-green-500",
        textColor: "text-green-600",
        borderColor: "border-green-200",
      },
      {
        id: "no_response",
        label: "No Response",
        color: "bg-gray-400",
        textColor: "text-gray-600",
        borderColor: "border-gray-200",
      },
    ],

    SALES: [
      {
        id: "deposit",
        label: "Deposit Taken",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
        borderColor: "border-yellow-200",
      },
      {
        id: "install",
        label: "Install Needed",
        color: "bg-purple-500",
        textColor: "text-purple-600",
        borderColor: "border-purple-200",
      },
      {
        id: "scheduled",
        label: "Installation Scheduled",
        color: "bg-green-600",
        textColor: "text-green-700",
        borderColor: "border-green-300",
      },
      {
        id: "won",
        label: "Completed",
        color: "bg-blue-600",
        textColor: "text-blue-700",
        borderColor: "border-blue-300",
      },
      {
        id: "lost",
        label: "Lost",
        color: "bg-red-500",
        textColor: "text-red-600",
        borderColor: "border-red-200",
      },
    ],
  };

  // ✅ MAP LEADS
  const stages = PIPELINE_STAGES[pipeline].map((s) => ({
    ...s,
    leads: leads.filter((l) => l.stage === s.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={session.user as any} />

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

        {/* 🔥 PIPELINE + ACCOUNT SWITCH */}
        <div className="flex gap-2">
          <PipelineSwitcher />
        </div>

        {/* KPI */}
        {/* KPI */}
        <StatGrid stages={stages} />

        {/* Pipeline */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {pipeline === "LEAD" ? "Lead Pipeline" : "Sales Pipeline"}
          </h2>

          <PipelineBoard
            stages={stages}
            pipeline={pipeline}
            pipelineId={pipelineId} // ✅ CRITICAL
          />
        </section>

        {/* Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TeamActivity team={team} />
          <AlertsPanel alerts={alerts} />
        </div>

        {/* Activity */}
        <ActivityFeed items={activity} />

        {/* Actions (ONLY modal + buttons) */}
        <DashboardClient
        stages={stages}
        pipeline={pipeline}
        pipelineId={pipelineId} // ✅ ADD THIS
      />
      </main>
    </div>
  );
}