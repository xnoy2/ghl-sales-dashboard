"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { PipelineStage, Lead } from "@/types";
import LeadCard from "./LeadCard";
import AddLeadModal from "./AddLeadModal";
import { formatCurrency, CURRENCY } from "@/lib/currency";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/core";

export default function PipelineBoard({
  stages: initialStages,
  pipeline: _pipeline,
  pipelineId,
  account,
}: {
  stages: PipelineStage[];
  pipeline: string;
  pipelineId: string;
  account: string;
}) {
  const [stages, setStages] = useState(initialStages);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setStages(initialStages);
  }, [initialStages]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The lead being dragged — used to render the DragOverlay floating card
  const activeLead = activeId
    ? stages.flatMap((s) => s.leads).find((l) => l.id === activeId) ?? null
    : null;

  // ─── Drag start ──────────────────────────────────────────────
  function handleDragStart(event: any) {
    setActiveId(event.active.id as string);
  }

  // ─── Drag end ────────────────────────────────────────────────
  async function handleDragEnd(event: any) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStageId = over.id as string;

    const fromStage = stages.find((s) => s.leads.some((l) => l.id === leadId));
    if (!fromStage || fromStage.id === newStageId) return;

    const movingLead = fromStage.leads.find((l) => l.id === leadId)!;
    const snapshot = stages;

    // Optimistic update — update stageId on the moved lead too
    setStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        leads:
          stage.id === fromStage.id
            ? stage.leads.filter((l) => l.id !== leadId)
            : stage.id === newStageId
            ? [...stage.leads, { ...movingLead, stage: newStageId, stageId: newStageId }]
            : stage.leads,
      }))
    );

    try {
      const res = await fetch("/api/opportunities/update-stage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: leadId, stageId: newStageId, account }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to move opportunity");
      }

      toast.success("Stage updated");
    } catch (err: any) {
      setStages(snapshot);
      toast.error(err.message || "Failed to move opportunity");
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  // ─── Add lead ────────────────────────────────────────────────
  function handleAddLead(newLead: Lead) {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === newLead.stage
          ? { ...stage, leads: [newLead, ...stage.leads] }
          : stage
      )
    );
  }

  // ─── Droppable column ─────────────────────────────────────────
  function DroppableColumn({
    stage,
    si,
    setSelected,
    onAdd,
    isDraggingActive,
  }: {
    stage: PipelineStage;
    si: number;
    setSelected: (lead: Lead) => void;
    onAdd: () => void;
    isDraggingActive: boolean;
  }) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.id });

    return (
      <div
        ref={setNodeRef}
        className={clsx(
          "flex flex-col rounded-xl transition-all duration-200",
          "animate-slide-up",
          `stagger-${si + 1}`,
          isOver
            ? "ring-2 ring-blue-400 ring-offset-2 bg-blue-50/60"
            : isDraggingActive
            ? "ring-1 ring-slate-200 ring-offset-1"
            : ""
        )}
      >
        {/* Column header */}
        <div
          className={clsx(
            "rounded-lg px-3 py-2 mb-3 flex items-center justify-between transition-all duration-200",
            isOver ? "brightness-110 scale-[1.02]" : "",
            stage.color
          )}
        >
          <span className="text-xs font-semibold text-white truncate pr-2">
            {stage.label}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-white/80 bg-white/20 rounded-full px-1.5 py-0.5">
              {stage.leads.length}
            </span>
            <button
              onClick={onAdd}
              className="text-white/80 hover:text-white text-xs leading-none"
              title="Add lead"
            >
              +
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-2 h-[210px] overflow-y-auto pr-1">
          {stage.leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onMove={setSelected} />
          ))}

          {stage.leads.length === 0 && (
            <div
              className={clsx(
                "border-2 border-dashed rounded-lg h-16 flex items-center justify-center transition-colors duration-200",
                isOver
                  ? "border-blue-400 bg-blue-50 text-blue-400"
                  : "border-slate-200 text-slate-400"
              )}
            >
              <span className="text-xs font-medium">
                {isOver ? "Drop here" : "Empty"}
              </span>
            </div>
          )}

          {/* Drop zone hint shown at bottom of non-empty columns while dragging */}
          {stage.leads.length > 0 && isOver && (
            <div className="border-2 border-dashed border-blue-300 rounded-lg h-[60px] flex items-center justify-center bg-blue-50/60 mt-1">
              <span className="text-xs text-blue-400 font-medium">Drop here</span>
            </div>
          )}
        </div>

        {/* Column total */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Total:{" "}
            <span className="font-medium text-slate-600">
              {formatCurrency(stage.leads.reduce((a, l) => a + l.value, 0))}
            </span>
          </span>
        </div>
      </div>
    );
  }

  // ─── Lead detail / edit sheet ─────────────────────────────────
  function LeadDetailSheet({
    lead,
    stages,
    onClose,
  }: {
    lead: Lead;
    stages: PipelineStage[];
    onClose: () => void;
  }) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stageChanging, setStageChanging] = useState(false);
    const [currentStageId, setCurrentStageId] = useState(lead.stageId);
    const router = useRouter();

    const [form, setForm] = useState({
      name: lead.name,
      value: lead.value || 0,
      email: lead.email,
      phone: lead.phone,
    });

    const currentStageLabel =
      stages.find((s) => s.id === currentStageId)?.label ?? currentStageId;

    async function handleStageChange(newStageId: string) {
      if (newStageId === currentStageId || stageChanging) return;
      const prev = currentStageId;
      setCurrentStageId(newStageId);
      setStageChanging(true);
      try {
        const res = await fetch("/api/opportunities/update-stage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportunityId: lead.id, stageId: newStageId, account }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update stage");
        }
        toast.success("Stage updated");
        router.refresh();
      } catch (err: any) {
        setCurrentStageId(prev);
        toast.error(err.message || "Failed to update stage");
      } finally {
        setStageChanging(false);
      }
    }

    async function handleUpdate() {
      setSaving(true);
      try {
        const res = await fetch("/api/opportunities/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opportunityId: lead.id,
            contactId: lead.contactId,
            pipelineId,
            stageId: currentStageId,
            value: Number(form.value),
            name: form.name,
            email: form.email,
            phone: form.phone,
            account,
          }),
        });

        const data =
          res.headers.get("content-length") !== "0"
            ? await res.json().catch(() => ({}))
            : { success: true };

        if (!res.ok) throw new Error(data.error || "Update failed");

        toast.success("Lead updated");
        router.refresh();
        onClose();
        setIsEditing(false);
      } catch (err: any) {
        toast.error(err.message || "Update failed");
      } finally {
        setSaving(false);
      }
    }

    return (
      <div
        className="fixed inset-0 z-50 flex justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

        <aside className="relative z-10 w-full max-w-sm bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold text-slate-800 truncate pr-2">
              {isEditing ? "Edit Lead" : lead.name}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Stage selector */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Pipeline Stage</h3>
              <select
                value={currentStageId}
                onChange={(e) => handleStageChange(e.target.value)}
                disabled={stageChanging}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              {stageChanging && <p className="text-xs text-slate-400">Updating in GHL…</p>}
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Contact Info</h3>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Full Name</label>
                {isEditing ? (
                  <input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                ) : (
                  <p className="text-sm">{lead.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Email</label>
                {isEditing ? (
                  <input className="input w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                ) : (
                  <p className="text-sm">{lead.email || "—"}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Phone</label>
                {isEditing ? (
                  <input className="input w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                ) : (
                  <p className="text-sm">{lead.phone || "—"}</p>
                )}
              </div>
            </div>

            {/* Deal info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Deal Info</h3>

              <div>
                <span className="text-xs text-slate-400">Assigned To</span>
                <p className="text-sm">{lead.assignedTo}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Value</label>
                {isEditing ? (
                  <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="px-3 text-slate-500 bg-slate-50 border-r">{CURRENCY.symbol}</span>
                    <input
                      type="number"
                      className="w-full px-3 py-2 outline-none"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{formatCurrency(lead.value)}</p>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400">Days in Stage</span>
                <p className="text-sm">{lead.daysInStage} day{lead.daysInStage !== 1 ? "s" : ""}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400">Current Stage</span>
                <p className="text-sm font-medium text-blue-600">{currentStageLabel}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-white shrink-0 flex gap-3">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                Edit
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} disabled={saving} className="w-full border border-slate-300 rounded-lg py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleUpdate} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="card p-4 overflow-x-auto">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${stages.length}, minmax(220px, 1fr))`,
              minWidth: `${stages.length * 220}px`,
            }}
          >
            {stages.map((stage, si) => (
              <DroppableColumn
                key={stage.id}
                stage={stage}
                si={si}
                setSelected={setSelected}
                onAdd={() => setAddOpen(true)}
                isDraggingActive={activeId !== null}
              />
            ))}
          </div>
        </div>

        {/* Floating card that follows the cursor */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}>
          {activeLead ? (
            <LeadCard lead={activeLead} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {selected && (
        <LeadDetailSheet
          lead={selected}
          stages={stages}
          onClose={() => setSelected(null)}
        />
      )}

      {addOpen && (
        <AddLeadModal
          stages={stages.map((s) => ({ label: s.label, value: s.id }))}
          pipelineId={pipelineId}
          onClose={() => setAddOpen(false)}
          onCreated={handleAddLead}
        />
      )}
    </>
  );
}
