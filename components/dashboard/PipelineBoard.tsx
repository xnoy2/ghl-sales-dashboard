"use client";

import { useState } from "react";
import clsx from "clsx";
import type { PipelineStage, Lead } from "@/types";
import LeadCard from "./LeadCard";
import AddLeadModal from "./AddLeadModal";

export default function PipelineBoard({ stages }: { stages: PipelineStage[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);
  const [addOpen, setAddOpen]   = useState(false);

  return (
    <>
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
          {stages.map((stage, si) => (
            <div key={stage.id} className={clsx("animate-slide-up", `stagger-${si + 1}`)}>
              {/* Column header */}
              <div className={clsx("rounded-lg px-3 py-2 mb-3 flex items-center justify-between", stage.color)}>
                <span className="text-xs font-semibold text-white">{stage.label}</span>
                <span className="text-xs font-bold text-white/80 bg-white/20 rounded-full px-1.5 py-0.5">
                  {stage.leads.length}
                </span>
              </div>

              {/* Lead cards */}
              <div className="space-y-2 min-h-[80px] max-h-[300px] overflow-y-auto pr-1">
                {stage.leads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onMove={setSelected} />
                ))}

                {stage.leads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg h-16 flex items-center justify-center">
                    <span className="text-xs text-slate-400">Empty</span>
                  </div>
                )}
              </div>

              {/* Column value total */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Total:{" "}
                  <span className="font-medium text-slate-600">
                    ${stage.leads.reduce((a, l) => a + l.value, 0).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead detail drawer */}
      {selected && (
        <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />
      )}

      {/* Add lead modal */}
      {addOpen && <AddLeadModal onClose={() => setAddOpen(false)} />}
    </>
  );
}

// ─── Inline detail sheet ──────────────────────────────────────────────────────

function LeadDetailSheet({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">{lead.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Row label="Email"       value={lead.email} />
          <Row label="Phone"       value={lead.phone} />
          <Row label="Assigned to" value={lead.assignedTo} />
          <Row label="Stage"       value={lead.stage.replace("_", " ")} />
          <Row label="Deal value"  value={`$${lead.value.toLocaleString()}`} />
          <Row label="Days in stage" value={String(lead.daysInStage)} />
          {lead.tags.length > 0 && (
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tags</span>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {lead.tags.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
          <button className="btn-primary flex-1 justify-center text-xs">Move to Next Stage</button>
          <button onClick={onClose} className="btn-secondary px-3 text-xs">Close</button>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <p className="text-sm text-slate-800 mt-0.5 capitalize">{value}</p>
    </div>
  );
}
