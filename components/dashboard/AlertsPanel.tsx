import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { FollowUpAlert, AlertSeverity } from "@/types";
import clsx from "clsx";

const SEVERITY_STYLES: Record<AlertSeverity, {
  bg: string; border: string; icon: React.ElementType; iconColor: string; dot: string;
}> = {
  critical: { bg: "bg-red-50",    border: "border-red-200",    icon: AlertCircle,   iconColor: "text-red-500",    dot: "bg-red-500"    },
  warning:  { bg: "bg-amber-50",  border: "border-amber-200",  icon: AlertTriangle, iconColor: "text-amber-500",  dot: "bg-amber-500"  },
  info:     { bg: "bg-blue-50",   border: "border-blue-200",   icon: Info,          iconColor: "text-blue-500",   dot: "bg-blue-400"   },
};

export default function AlertsPanel({ alerts }: { alerts: FollowUpAlert[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Follow-Up Alerts</h2>
        {alerts.filter(a => a.severity === "critical").length > 0 && (
          <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            {alerts.filter(a => a.severity === "critical").length} urgent
          </span>
        )}
      </div>

      <div className="space-y-2">
        {alerts.map(alert => {
          const s = SEVERITY_STYLES[alert.severity];
          const Icon = s.icon;
          return (
            <div
              key={alert.id}
              className={clsx("flex items-start gap-3 p-3 rounded-lg border", s.bg, s.border)}
            >
              <Icon className={clsx("w-4 h-4 mt-0.5 flex-shrink-0", s.iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{alert.leadName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{alert.daysOverdue}d</span>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400">No alerts — all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
