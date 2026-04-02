import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardStats, getOpportunities, getTeam, getActivity, getAlerts } from "@/lib/ghl";
import { mockPipelineStages } from "@/lib/mock-data";
import Navbar           from "@/components/dashboard/Navbar";
import StatGrid         from "@/components/dashboard/StatGrid";
import PipelineBoard    from "@/components/dashboard/PipelineBoard";
import TeamActivity     from "@/components/dashboard/TeamActivity";
import AlertsPanel      from "@/components/dashboard/AlertsPanel";
import ActivityFeed     from "@/components/dashboard/ActivityFeed";
import QuickActions     from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Parallel data fetch (mocked until GHL keys are set)
  const [stats, leads, team, activity, alerts] = await Promise.all([
    getDashboardStats(),
    getOpportunities(),
    getTeam(),
    getActivity(),
    getAlerts(),
  ]);

  // Enrich pipeline stages with fetched leads
  const stages = mockPipelineStages.map(s => ({
    ...s,
    leads: leads.filter(l => l.stage === s.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={session.user as any} />

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* KPI row */}
        <StatGrid stats={stats} />

        {/* Pipeline kanban */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Sales Pipeline
          </h2>
          <PipelineBoard stages={stages} />
        </section>

        {/* Bottom two-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TeamActivity team={team} />
          <AlertsPanel  alerts={alerts} />
        </div>

        {/* Activity feed */}
        <ActivityFeed items={activity} />

        {/* Action bar */}
        <QuickActions />
      </main>
    </div>
  );
}
