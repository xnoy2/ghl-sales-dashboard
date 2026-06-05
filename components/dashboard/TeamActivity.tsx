"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import type { TeamMember } from "@/types";
import clsx from "clsx";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
];

const PER_PAGE = 5;

export default function TeamActivity({ team }: { team: TeamMember[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(team.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = team.slice(start, start + PER_PAGE);

  const totalDeals = team.reduce((sum, m) => sum + m.deals, 0);

  return (
    <div className="card p-5 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Team Activity</h2>
          {totalDeals > 0 && (
            <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {totalDeals} deals
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {team.length} members
        </span>
      </div>

      {/* Member list — always renders PER_PAGE rows so height is consistent */}
      <div className="flex flex-col flex-1 divide-y divide-slate-50">
        {Array.from({ length: PER_PAGE }).map((_, i) => {
          const member = visible[i];
          const globalIndex = start + i;

          if (!member) {
            // Empty placeholder row — keeps card height stable
            return (
              <div key={`empty-${i}`} className="flex items-center gap-3 flex-1 opacity-0 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full" />
              </div>
            );
          }

          const pct = member.target > 0
            ? Math.min(100, Math.round((member.deals / member.target) * 100))
            : 0;

          return (
            <div key={member.id} className="flex items-center gap-3 flex-1">

              {/* Avatar */}
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                  AVATAR_COLORS[globalIndex % AVATAR_COLORS.length]
                )}
              >
                {member.initials}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate pr-2">
                    {member.name}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {member.deals}/{member.target}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  {pct > 0 ? (
                    <div
                      className={clsx("h-full rounded-full transition-all duration-700", BAR_COLORS[globalIndex % BAR_COLORS.length])}
                      style={{ width: `${pct}%` }}
                    />
                  ) : (
                    <div className="h-full w-full rounded-full border border-dashed border-slate-300" />
                  )}
                </div>
              </div>

              {/* Percentage */}
              <span className={clsx("text-xs font-semibold w-9 text-right shrink-0", pct === 0 ? "text-slate-300" : "text-slate-600")}>
                {pct}%
              </span>
            </div>
          );
        })}

        {team.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-slate-400">No team members found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {start + 1}–{Math.min(start + PER_PAGE, team.length)} of {team.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx(
                  "w-7 h-7 rounded-lg text-xs font-medium transition-colors",
                  p === page
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
