import type { TeamMember } from "@/types";
import clsx from "clsx";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

const BAR_COLORS = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"];

export default function TeamActivity({ team }: { team: TeamMember[] }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Team Activity</h2>
      <div className="space-y-4">
        {team.map((member, i) => {
          const pct = Math.round((member.deals / member.target) * 100);
          return (
            <div key={member.id} className="flex items-center gap-3">
              <div className={clsx(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                AVATAR_COLORS[i % AVATAR_COLORS.length]
              )}>
                {member.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-800">{member.name}</span>
                  <span className="text-xs text-slate-500">
                    {member.deals}/{member.target} deals
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full transition-all duration-700", BAR_COLORS[i % BAR_COLORS.length])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-600 w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
