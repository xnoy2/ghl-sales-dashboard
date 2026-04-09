"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { PipelineStage, Lead } from "@/types";
import LeadCard from "./LeadCard";
import AddLeadModal from "./AddLeadModal";
import { STAGE_MAP } from "@/lib/stageMap";
import { formatCurrency, CURRENCY } from "@/lib/currency";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/core";

export default function PipelineBoard({
  stages: initialStages,
  pipeline,
  pipelineId, // ✅ ADD THIS
}: {
  stages: PipelineStage[];
  pipeline: "LEAD" | "SALES";
  pipelineId: string; // ✅ ADD
}) {
  // ✅ LOCAL STATE (REAL-TIME)
  const [stages, setStages] = useState(initialStages);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // 🔥 SYNC SERVER → UI
  useEffect(() => {
    setStages(initialStages);
  }, [initialStages]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 🚀 DRAG MOVE (OPTIMISTIC)
  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id;
    const newStage = over.id;

    const currentStage = stages.find((stage) =>
      stage.leads.some((l) => l.id === leadId)
    )?.id;

    if (!currentStage || currentStage === newStage) return;

    // ✅ OPTIMISTIC UI UPDATE
    setStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        leads:
          stage.id === currentStage
            ? stage.leads.filter((l) => l.id !== leadId)
            : stage.id === newStage
            ? [
                ...stage.leads,
                prev
                  .find((s) => s.id === currentStage)!
                  .leads.find((l) => l.id === leadId)!,
              ]
            : stage.leads,
      }))
    );

    try {
        const payload = {
          opportunityId: leadId,
          stageId: newStage,
          account: window.location.search.includes("account=BGR")
            ? "BGR"
            : "BCF",
        };

        console.log("🔥 DRAG PAYLOAD:", payload); // ✅ DEBUG HERE

        const res = await fetch("/api/opportunities/update-stage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("🔥 API RESPONSE:", data); // ✅ DEBUG RESPONSE

      } catch (err) {
        console.error("MOVE ERROR:", err);
      }
  }

  // 🔥 REAL-TIME ADD (NO RELOAD)
  function handleAddLead(newLead: Lead) {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === newLead.stage
          ? {
              ...stage,
              leads: [newLead, ...stage.leads], // ✅ insert top
            }
          : stage
      )
    );
  }

  // ✅ DROPPABLE COLUMN
  function DroppableColumn({
    stage,
    si,
    setSelected,
    onAdd,
  }: {
    stage: PipelineStage;
    si: number;
    setSelected: (lead: Lead) => void;
    onAdd: () => void;
  }) {
    const { setNodeRef } = useDroppable({
      id: stage.id,
    });

    return (
      <div
        ref={setNodeRef}
        className={clsx("animate-slide-up", `stagger-${si + 1}`)}
      >
        {/* HEADER */}
        <div
          className={clsx(
            "rounded-lg px-3 py-2 mb-3 flex items-center justify-between",
            stage.color
          )}
        >
          <span className="text-xs font-semibold text-white">
            {stage.label}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/80 bg-white/20 rounded-full px-1.5 py-0.5">
              {stage.leads.length}
            </span>

            <button
              onClick={onAdd}
              className="text-white/80 hover:text-white text-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* LEADS */}
        <div className="space-y-2 h-[210px] overflow-y-auto pr-1">
          {stage.leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onMove={setSelected}
            />
          ))}

          {stage.leads.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-lg h-16 flex items-center justify-center">
              <span className="text-xs text-slate-400">
                Empty
              </span>
            </div>
          )}
        </div>

        {/* TOTAL */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Total:{" "}
            <span className="font-medium text-slate-600">
            {formatCurrency(
              stage.leads.reduce((a, l) => a + l.value, 0)
            )}
          </span>
          </span>
        </div>
      </div>
    );
  }

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
  const router = useRouter(); // ✅ ADD HERE

 const account = window.location.search.includes("account=BGR")
  ? "BGR"
  : "BCF";

// In LeadDetailSheet, change the mappedStage lookup to also
// check if the stage label *starts with* the lead.stage value:

const mappedStage =
  STAGE_MAP[account][pipeline].find(
    (s) =>
      s.id === lead.stage ||
      s.label.toLowerCase() === lead.stage?.toLowerCase() ||
      s.label.toLowerCase().startsWith(lead.stage?.toLowerCase() ?? "")
  );

// And fallback to matching by the stage.id from the board stages:
const stageFromBoard = stages.find(
  (s) => s.id === lead.stage || s.label.toLowerCase() === lead.stage?.toLowerCase()
);

const [form, setForm] = useState({
  name: lead.name,
  value: lead.value || "",
  email: lead.email,
  phone: lead.phone,
});

  async function handleUpdate() {
  try {
    // ✅ GET ACCOUNT FROM URL
    const account = window.location.search.includes("account=BGR")
      ? "BGR"
      : "BCF";

    // ✅ FIX: DIRECT MATCH (NO includes)
    // ✅ FIX: stageId is already correct — no mapping needed
    

    console.log("🚀 SENDING VALUE:", form.value);
    console.log("🧠 DEBUG CONTACT:", {
    contactId: lead.contactId,
    email: form.email,
    phone: form.phone,
  });
    const res = await fetch("/api/opportunities/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      opportunityId: lead.id,
      contactId: lead.contactId,
      pipelineId,

      // ✅ ADD THIS (CRITICAL FIX)
      stageId: lead.stageId ?? lead.stage,

      value: Number(form.value),
      name: form.name,
      email: form.email,
      phone: form.phone,
      account,
    }),
    });

    const data =
      res.headers.get("content-length") !== "0"
        ? await res.json()
        : { success: true };

    if (!res.ok) throw new Error(data.error);

    toast.success("Lead updated successfully");
    router.refresh();
    onClose();
    
    setIsEditing(false);

  } catch (err: any) {
    alert(err.message);
  }
}

  return (
  <div
    className="fixed inset-0 z-50 flex justify-end"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
    />

    <aside className="relative z-10 w-full max-w-sm bg-white shadow-2xl flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-semibold text-slate-800">
          {isEditing ? "Edit Lead" : lead.name}
        </h2>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-5">

        {/* CONTACT INFO */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase">
            Contact Info
          </h3>

          {/* NAME */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Full Name</label>
            {isEditing ? (
              <input
                className="input w-full"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">{lead.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Email</label>
            {isEditing ? (
              <input
                className="input w-full"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">{lead.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Phone</label>
            {isEditing ? (
              <input
                className="input w-full"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">{lead.phone}</p>
            )}
          </div>
        </div>

        {/* DEAL INFO */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase">
            Deal Info
          </h3>

          {/* ASSIGNED */}
          <div>
            <span className="text-xs text-slate-400">Assigned</span>
            <p className="text-sm">{lead.assignedTo}</p>
          </div>

          {/* VALUE */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Value</label>

            {isEditing ? (
              <div className="flex items-center border rounded-lg overflow-hidden">
                <span className="px-3 text-slate-500 bg-slate-50 border-r">
                  {CURRENCY.symbol}
                </span>
                <input
                  type="number"
                  className="w-full px-3 py-2 outline-none"
                  value={form.value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      value: Number(e.target.value),
                    })
                  }
                />
              </div>
            ) : (
              <p className="text-sm">{formatCurrency(lead.value)}</p>
            )}
          </div>

          {/* STAGE (VIEW ONLY) */}
          <div>
            <span className="text-xs text-slate-400">Stage</span>
            <p className="text-sm">{lead.stage}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Stage is updated via drag & drop
            </p>
          </div>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="p-4 border-t bg-white sticky bottom-0 flex gap-3">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="w-full border border-slate-300 rounded-lg py-2 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Update
            </button>
          </>
        )}
      </div>

    </aside>
  </div>
);
}

  function Row({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <span className="text-xs text-slate-400">
          {label}
        </span>
        <p className="text-sm">{value}</p>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="card p-4">
          <div
            className="grid gap-4 w-full"
            style={{
              gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
            }}
          >
            {stages.map((stage, si) => (
              <DroppableColumn
                key={stage.id}
                stage={stage}
                si={si}
                setSelected={setSelected}
                onAdd={() => setAddOpen(true)}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {selected && (
      <LeadDetailSheet
        lead={selected}
        stages={stages} // ✅ ADD THIS
        onClose={() => setSelected(null)}
      />
    )}

      {/* 🔥 FIXED HERE */}
      {addOpen && (
        <AddLeadModal
          stages={stages.map((s) => ({
            label: s.label,
            value: s.id,
          }))}
          pipelineId={pipelineId} // ✅ CORRECT
          onClose={() => setAddOpen(false)}
          onCreated={handleAddLead}
        />
      )}
    </>
  );
}