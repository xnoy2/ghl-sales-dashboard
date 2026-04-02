import { TrendingUp, Phone, FileText, Clock, CheckCircle2 } from "lucide-react";
import type { DashboardStats } from "@/types";

const STATS = [
  { key: "newLeadsToday",      label: "New Leads Today", icon: TrendingUp,   color: "bg-blue-600",    light: "bg-blue-50",    text: "text-blue-600"   },
  { key: "contacted",          label: "Contacted",       icon: Phone,        color: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-600"  },
  { key: "quoted",             label: "Quoted",          icon: FileText,     color: "bg-violet-600",  light: "bg-violet-50",  text: "text-violet-600" },
  { key: "followUps",          label: "Follow-Ups",      icon: Clock,        color: "bg-orange-500",  light: "bg-orange-50",  text: "text-orange-600" },
  { key: "closedDeals",        label: "Closed Deals",    icon: CheckCircle2, color: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-600"},
] as const;

export default function StatGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {STATS.map(({ key, label, icon: Icon, color, light, text }, i) => (
        <div
          key={key}
          className={`card p-4 animate-slide-up stagger-${i + 1} group hover:-translate-y-0.5 transition-transform duration-150`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-slate-500 leading-tight">{label}</p>
            <div className={`${light} ${text} p-1.5 rounded-lg`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900">
            {stats[key]}
          </p>
          <div className={`mt-3 h-1 rounded-full ${light} overflow-hidden`}>
            <div
              className={`h-full ${color} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min((stats[key] / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
