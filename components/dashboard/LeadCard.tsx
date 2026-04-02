"use client";

import { CheckCircle2, Clock, XCircle, Plus, DollarSign } from "lucide-react";
import type { Lead, StageId } from "@/types";
import clsx from "clsx";

const STAGE_ICON: Record<StageId, React.ReactNode> = {
  new:        <Plus       className="w-3 h-3" />,
  contacted:  <Clock      className="w-3 h-3" />,
  quoted:     <DollarSign className="w-3 h-3" />,
  follow_up:  <XCircle    className="w-3 h-3 text-red-500" />,
  closed:     <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
};

const STAGE_ICON_BG: Record<StageId, string> = {
  new:        "bg-blue-50 text-blue-500",
  contacted:  "bg-amber-50 text-amber-500",
  quoted:     "bg-violet-50 text-violet-500",
  follow_up:  "bg-red-50 text-red-500",
  closed:     "bg-emerald-50 text-emerald-600",
};

export default function LeadCard({
  lead,
  onMove,
}: {
  lead: Lead;
  onMove?: (lead: Lead) => void;
}) {
  const isUrgent = lead.daysInStage >= 3 && lead.stage !== "closed";

  return (
    <div
      onClick={() => onMove?.(lead)}
      className={clsx(
        "group relative bg-white border rounded-lg p-3 cursor-pointer",
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-150",
        isUrgent ? "border-red-200" : "border-slate-200"
      )}
    >
      {isUrgent && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
            "bg-slate-100 text-slate-600"
          )}>
            {lead.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-slate-800 truncate">{lead.name}</span>
        </div>
        <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", STAGE_ICON_BG[lead.stage])}>
          {STAGE_ICON[lead.stage]}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">{lead.assignedTo}</span>
        <span className="text-xs font-medium text-slate-600">
          ${lead.value.toLocaleString()}
        </span>
      </div>

      {lead.tags.length > 0 && (
        <div className="mt-1.5 flex gap-1 flex-wrap">
          {lead.tags.map(tag => (
            <span
              key={tag}
              className={clsx(
                "text-[10px] px-1.5 py-0.5 rounded font-medium",
                tag === "hot"    && "bg-orange-50 text-orange-600",
                tag === "urgent" && "bg-red-50 text-red-600",
                tag === "won"    && "bg-emerald-50 text-emerald-600",
                tag === "referral" && "bg-blue-50 text-blue-600",
                tag === "web"    && "bg-slate-100 text-slate-500",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
