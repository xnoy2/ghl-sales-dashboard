"use client";

import {
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  DollarSign,
} from "lucide-react";
import type { Lead, StageId } from "@/types";
import clsx from "clsx";
import { formatCurrency, CURRENCY } from "@/lib/currency";
import { useDraggable } from "@dnd-kit/core";
import { useEffect, useState } from "react";

const STAGE_ICON: Record<StageId, React.ReactNode> = {
  new: <Plus className="w-3 h-3" />,
  warm: <Clock className="w-3 h-3" />,
  quote: <DollarSign className="w-3 h-3" />,
  no_response: <XCircle className="w-3 h-3 text-red-500" />,
  deposit: <DollarSign className="w-3 h-3" />,
  install: <Clock className="w-3 h-3" />,
  scheduled: <Clock className="w-3 h-3" />,
  won: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
  lost: <XCircle className="w-3 h-3 text-red-500" />,
};

const STAGE_ICON_BG: Record<StageId, string> = {
  new: "bg-blue-50 text-blue-500",
  warm: "bg-orange-50 text-orange-500",
  quote: "bg-green-50 text-green-500",
  no_response: "bg-gray-100 text-gray-500",
  deposit: "bg-yellow-50 text-yellow-600",
  install: "bg-purple-50 text-purple-600",
  scheduled: "bg-green-100 text-green-700",
  won: "bg-emerald-50 text-emerald-600",
  lost: "bg-red-50 text-red-600",
};

export default function LeadCard({
  lead,
  onMove,
}: {
  lead: Lead;
  onMove?: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });

  // ✅ Prevent hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUrgent =
    lead.daysInStage >= 3 && lead.stage !== "won";

  return (
  <div
    ref={mounted ? setNodeRef : undefined}
    className={clsx(
      "group relative bg-white border rounded-lg p-3",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-150",
      isUrgent ? "border-red-200" : "border-slate-200",
      isDragging && "opacity-50"
    )}
  >
    {/* 🔥 DRAG HANDLE */}
    <div
      {...(mounted ? listeners : {})}
      {...(mounted ? attributes : {})}
      className="absolute top-2 left-2 cursor-grab text-slate-400 hover:text-slate-600"
      onClick={(e) => e.stopPropagation()} // 🚀 prevent click conflict
    >
      ⠿
    </div>

    {/* 🔴 Urgent indicator */}
    {isUrgent && (
      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />
    )}

    {/* CLICK AREA (SAFE NOW) */}
    <div onClick={() => onMove?.(lead)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-100 text-slate-600">
            {lead.name.charAt(0)}
          </div>

          <span className="text-sm font-medium text-slate-800 truncate">
            {lead.name}
          </span>
        </div>

        <div
          className={clsx(
            "w-5 h-5 rounded-full flex items-center justify-center",
            STAGE_ICON_BG[lead.stage as keyof typeof STAGE_ICON_BG]
          )}
        >
          {STAGE_ICON[lead.stage as keyof typeof STAGE_ICON]}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {lead.assignedTo || "Unassigned"}
        </span>

        <span className="text-xs font-medium text-slate-600">
          {formatCurrency(lead.value)}
        </span>
      </div>
    </div>
  </div>
);
}