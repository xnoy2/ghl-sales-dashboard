"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

export default function AddLeadModal({ onClose }: { onClose: () => void }) {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", stage: "new", value: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: POST to /api/leads when GHL is connected
    await new Promise(r => setTimeout(r, 800)); // mock delay
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-600 text-xl">✓</span>
            </div>
            <p className="font-medium text-slate-900">Lead added!</p>
            <p className="text-sm text-slate-500 mt-1">Syncing to GHL…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {[
              { key: "name",  label: "Full Name",    type: "text",  placeholder: "Juan Carlos" },
              { key: "email", label: "Email",         type: "email", placeholder: "juan@company.com" },
              { key: "phone", label: "Phone",         type: "tel",   placeholder: "+1 555 0100" },
              { key: "value", label: "Deal Value ($)", type: "number",placeholder: "5000" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  required={f.key !== "value"}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             bg-white text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
              <select
                value={form.stage}
                onChange={e => update("stage", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           bg-white text-slate-900 transition-all"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="follow_up">Follow-Up</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Adding…" : "Add Lead"}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary px-4">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
