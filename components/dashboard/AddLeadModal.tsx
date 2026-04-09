"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { STAGE_MAP } from "@/lib/stageMap";
import { USER_MAP } from "@/lib/users";
import { CURRENCY } from "@/lib/currency";

export default function AddLeadModal({
  stages,
  pipelineId,
  onClose,
  onCreated,
}: {
  stages: { label: string; value: string }[];
  pipelineId: string;
  onClose: () => void;
  onCreated?: (lead: any) => void;
}) {
  const searchParams = useSearchParams();

  // ✅ DEFINE FIRST
  const account =
    searchParams.get("account") === "BGR" ? "BGR" : "BCF";

  const pipeline =
    searchParams.get("pipeline") === "SALES" ? "SALES" : "LEAD";

  // ✅ THEN USE
  const stageOptions = STAGE_MAP[account][pipeline];

  const userOptions = USER_MAP[account];

  // ❌ DO NOT redefine pipelineId

  const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  value: "",
  stageId: "",
  tags: "",
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    // 🔥 LOADING TOAST
    const toastId = toast.loading("Creating lead...");

    try {
      if (!pipelineId) {
        throw new Error("Pipeline is not configured");
      }

      if (!form.name || !form.email) {
        throw new Error("Name and email are required");
      }

      if (!form.stageId) {
        throw new Error("Please select a stage");
      }

      const tempLead = {
        id: "temp-" + Date.now(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        value: Number(form.value || 0),
        stage: form.stageId,
        assignedTo: "You",
        lastActivity: new Date().toISOString(),
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim())
          : [],
        daysInStage: 0,
      };
console.log("DEBUG:", {
  account,
  pipeline,
  pipelineId,
});

      // ✅ INSTANT UI UPDATE
      onCreated?.(tempLead);

      // 🚀 API CALL
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          value: Number(form.value || 0),
          stageId: form.stageId,
          pipelineId,
          tags: form.tags ? [form.tags] : [],
          account,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create lead");
      }

      // ✅ SUCCESS TOAST
      toast.success("Lead added successfully", { id: toastId });

      // ✅ CLOSE MODAL
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err: any) {
      console.error("ADD LEAD ERROR:", err);
      console.log("SENDING STAGE:", form.stageId);
      // ❌ ERROR TOAST
      toast.error(err.message || "Failed to add lead", { id: toastId });

      setError(err.message || "Failed to add lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4 shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold">
          Add Lead ({pipeline})
        </h2>

        <input
          placeholder="Enter full name"
          className="border border-slate-300 px-3 py-2 rounded-lg w-full"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Enter email address"
          className="border border-slate-300 px-3 py-2 rounded-lg w-full"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Enter phone number"
          className="border border-slate-300 px-3 py-2 rounded-lg w-full"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />
        <div className="space-y-1">

        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          
          {/* £ PREFIX */}
          <span className="px-3 text-slate-500 bg-slate-50 border-r flex items-center">
            {CURRENCY.symbol}
          </span>

          {/* INPUT */}
          <input
            type="number"
            className="w-full px-3 py-2 outline-none"
            value={form.value}
            onChange={(e) => {
              setForm({
                ...form,
                value: e.target.value, // ✅ string
              });
            }}
          />
        </div>
      </div>
        
        <select
          className="border border-slate-300 px-3 py-2 rounded-lg w-full"
          value={form.stageId}
          onChange={(e) =>
            setForm({ ...form, stageId: e.target.value })
          }
        >
          <option value="">Select stage</option>

          {stageOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <input
          placeholder="Tags (e.g. website, wishlist)"
          className="border border-slate-300 px-3 py-2 rounded-lg w-full"
          value={form.tags}
          onChange={(e) =>
            setForm({ ...form, tags: e.target.value })
          }
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-1/3 border border-slate-300 rounded-lg py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}