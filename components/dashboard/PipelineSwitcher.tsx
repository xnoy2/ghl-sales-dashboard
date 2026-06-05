"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw, CheckCircle2, CloudDownload } from "lucide-react";

type SyncState = "idle" | "syncing" | "done";

export default function PipelineSwitcher({
  pipelines,
  currentPipelineId,
}: {
  pipelines: { id: string; name: string }[];
  currentPipelineId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const account = searchParams.get("account") === "BGR" ? "BGR" : "BCF";
  const [open, setOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  function switchPipeline(pipelineId: string) {
    router.push(`/dashboard?account=${account}&pipelineId=${pipelineId}`);
  }

  async function handleSync() {
    if (syncState === "syncing") return;
    setSyncState("syncing");
    router.refresh();
    // Allow Next.js to complete the re-render
    await new Promise((r) => setTimeout(r, 1500));
    setLastSynced(new Date());
    setSyncState("done");
    // Return to idle after showing the success state
    await new Promise((r) => setTimeout(r, 2500));
    setSyncState("idle");
  }

  async function switchAccount(newAccount: "BCF" | "BGR") {
    setOpen(false);
    try {
      const res = await fetch(`/api/pipelines?account=${newAccount}`);
      const data = await res.json();
      const firstId = data.pipelines?.[0]?.id;
      router.push(
        firstId
          ? `/dashboard?account=${newAccount}&pipelineId=${firstId}`
          : `/dashboard?account=${newAccount}`
      );
    } catch {
      router.push(`/dashboard?account=${newAccount}`);
    }
  }

  function formatLastSynced(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  }

  return (
    <div className="flex items-center justify-between w-full gap-3">

      {/* LEFT: PIPELINE TABS */}
      <div className="flex gap-2 flex-wrap flex-1">
        {pipelines.map((p) => (
          <button
            key={p.id}
            onClick={() => switchPipeline(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p.id === currentPipelineId
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* RIGHT: SYNC BUTTON + ACCOUNT */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Sync GHL */}
        <button
          onClick={handleSync}
          disabled={syncState === "syncing"}
          className={`
            relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-300 disabled:cursor-not-allowed select-none
            ${syncState === "done"
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
              : syncState === "syncing"
              ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
              : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
            }
          `}
        >
          {/* Icon */}
          {syncState === "done" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : syncState === "syncing" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CloudDownload className="w-4 h-4" />
          )}

          {/* Label */}
          <span>
            {syncState === "done"
              ? "Synced!"
              : syncState === "syncing"
              ? "Syncing…"
              : "Sync GHL"}
          </span>

          {/* Last synced badge — shown in idle state only */}
          {syncState === "idle" && lastSynced && (
            <span className="ml-1 text-xs text-slate-400 font-normal">
              · {formatLastSynced(lastSynced)}
            </span>
          )}
        </button>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
          >
            {account} ▼
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {(["BCF", "BGR"] as const).map((acc) => (
                <button
                  key={acc}
                  onClick={() => switchAccount(acc)}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                    account === acc
                      ? "font-semibold text-blue-600 bg-blue-50"
                      : "text-slate-700"
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
