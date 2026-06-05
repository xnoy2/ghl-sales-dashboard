import DashboardClient from "@/components/dashboard/DashboardClient";
import PipelineSwitcher from "@/components/dashboard/PipelineSwitcher";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllPipelines,
  getOpportunities,
  getPipelineStages,
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
import PipelineBoard from "@/components/dashboard/PipelineBoard";
import { ACCOUNTS } from "@/lib/accounts";

const STAGE_COLORS = [
  { color: "bg-blue-500",   textColor: "text-blue-600",   borderColor: "border-blue-200" },
  { color: "bg-orange-500", textColor: "text-orange-600", borderColor: "border-orange-200" },
  { color: "bg-green-500",  textColor: "text-green-600",  borderColor: "border-green-200" },
  { color: "bg-gray-400",   textColor: "text-gray-600",   borderColor: "border-gray-200" },
  { color: "bg-yellow-500", textColor: "text-yellow-600", borderColor: "border-yellow-200" },
  { color: "bg-purple-500", textColor: "text-purple-600", borderColor: "border-purple-200" },
  { color: "bg-red-500",    textColor: "text-red-600",    borderColor: "border-red-200" },
  { color: "bg-teal-500",   textColor: "text-teal-600",   borderColor: "border-teal-200" },
];


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ pipelineId?: string; account?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const params = await searchParams;

  const account = params?.account === "BGR" ? "BGR" : "BCF";

  // Fetch all pipelines for this account first (cached 60s by Next.js)
  const allPipelines = await getAllPipelines(account);

  // Use the pipelineId from the URL, or default to the first available pipeline
  const pipelineId = params?.pipelineId || allPipelines[0]?.id;

  if (!pipelineId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">No pipelines found for this account.</p>
      </div>
    );
  }

  const currentPipeline = allPipelines.find((p) => p.id === pipelineId) ?? allPipelines[0];

  // Fetch everything in parallel
  const [leads, ghlStages, team, activity, alerts] = await Promise.all([
    getOpportunities(pipelineId, account),
    getPipelineStages(pipelineId, account),
    getTeam(account),
    getActivity(pipelineId, account),
    getAlerts(pipelineId, account),
  ]);

  // Count open opportunities per team member for this pipeline
  const dealCounts: Record<string, number> = {};
  for (const lead of leads) {
    if (lead.assignedToId) {
      dealCounts[lead.assignedToId] = (dealCounts[lead.assignedToId] ?? 0) + 1;
    }
  }
  const teamWithDeals = team.map((m) => ({
    ...m,
    deals: dealCounts[m.id] ?? 0,
  }));

  // Build stage columns from GHL data — colors assigned by position
  const stages: PipelineStage[] = ghlStages.map((s, i) => ({
    id: s.id,
    label: s.name,
    ...STAGE_COLORS[i % STAGE_COLORS.length],
    leads: leads.filter((l) => l.stageId === s.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={session.user as any} />

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

        {/* PIPELINE + ACCOUNT SWITCHER */}
        <PipelineSwitcher
          pipelines={allPipelines}
          currentPipelineId={pipelineId}
        />

        {/* KPI CARDS */}
        <StatGrid stages={stages} />

        {/* PIPELINE BOARD */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {currentPipeline?.name ?? "Pipeline"}
          </h2>

          <PipelineBoard
            stages={stages}
            pipeline="LEAD"
            pipelineId={pipelineId}
            account={account}
          />
        </section>

        {/* TEAM + ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TeamActivity team={teamWithDeals} />
          <AlertsPanel alerts={alerts} />
        </div>

        {/* ACTIVITY FEED */}
        <ActivityFeed items={activity} />

        {/* QUICK ACTIONS / ADD LEAD MODAL */}
        <DashboardClient
          stages={stages}
          pipeline="LEAD"
          pipelineId={pipelineId}
          account={account}
          locationId={ACCOUNTS[account].locationId}
        />
      </main>
    </div>
  );
}