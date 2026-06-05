"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import type { FollowUpAlert, AlertSeverity } from "@/types";
import clsx from "clsx";

const SEVERITY_STYLES: Record<AlertSeverity, {
  bg: string; border: string; icon: React.ElementType; iconColor: string;
}> = {
  critical: { bg: "bg-red-50",   border: "border-red-200",   icon: AlertCircle,   iconColor: "text-red-500"   },
  warning:  { bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500" },
  info:     { bg: "bg-blue-50",  border: "border-blue-200",  icon: Info,          iconColor: "text-blue-500"  },
};

const PER_PAGE = 5;

export default function AlertsPanel({ alerts }: { alerts: FollowUpAlert[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(alerts.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = alerts.slice(start, start + PER_PAGE);
  const urgentCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="card p-5 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Follow-Up Alerts</h2>
        {urgentCount > 0 && (
          <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            {urgentCount} urgent
          </span>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-2 flex-1">
        {visible.map((alert) => {
          const s = SEVERITY_STYLES[alert.severity];
          const Icon = s.icon;
          return (
            <div
              key={alert.id}
              className={clsx("flex items-start gap-3 p-3 rounded-lg border", s.bg, s.border)}
            >
              <Icon className={clsx("w-4 h-4 mt-0.5 shrink-0", s.iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{alert.leadName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{alert.daysOverdue}d</span>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400">No alerts — all caught up!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {start + 1}–{Math.min(start + PER_PAGE, alerts.length)} of {alerts.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number pills */}
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
