"use client";

import { GripVertical } from "lucide-react";
import type { Lead } from "@/types";
import clsx from "clsx";
import { formatCurrency } from "@/lib/currency";
import { useDraggable } from "@dnd-kit/core";
import { useEffect, useState } from "react";

export default function LeadCard({
  lead,
  onMove,
  overlay = false,
}: {
  lead: Lead;
  onMove?: (lead: Lead) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isUrgent = lead.daysInStage >= 3;

  // When used as the DragOverlay floating card
  if (overlay) {
    return (
      <div
        className={clsx(
          "bg-white rounded-xl p-3 w-[220px]",
          "border-2 border-blue-400",
          "shadow-[0_20px_40px_rgba(0,0,0,0.18)]",
          "rotate-2 scale-105",
          "pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 shrink-0">
            {lead.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-slate-800 truncate">
            {lead.name}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">{lead.assignedTo || "Unassigned"}</span>
          <span className="text-xs font-semibold text-slate-700">{formatCurrency(lead.value)}</span>
        </div>
      </div>
    );
  }

  // Ghost placeholder shown in the source column while dragging
  if (isDragging) {
    return (
      <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/40 h-[72px] flex items-center justify-center">
        <span className="text-xs text-blue-300 font-medium">Moving…</span>
      </div>
    );
  }

  return (
    <div
      ref={mounted ? setNodeRef : undefined}
      className={clsx(
        "group relative bg-white border rounded-lg p-3",
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-default",
        isUrgent ? "border-red-200" : "border-slate-200"
      )}
    >
      {/* Urgent dot */}
      {isUrgent && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />
      )}

      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...(mounted ? listeners : {})}
          {...(mounted ? attributes : {})}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 shrink-0 touch-none"
          onClick={(e) => e.stopPropagation()}
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Clickable content */}
        <div className="flex-1 min-w-0" onClick={() => onMove?.(lead)}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-100 text-slate-600 shrink-0">
              {lead.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-800 truncate">
              {lead.name}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">{lead.assignedTo || "Unassigned"}</span>
            <span className="text-xs font-medium text-slate-600">{formatCurrency(lead.value)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
