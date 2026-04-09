"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PipelineSwitcher() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pipeline =
    searchParams.get("pipeline") === "SALES" ? "SALES" : "LEAD";

  const account =
    searchParams.get("account") === "BGR" ? "BGR" : "BCF";

  const [open, setOpen] = useState(false);

  // ✅ SWITCH PIPELINE (KEEP ACCOUNT)
  function switchPipeline(type: "LEAD" | "SALES") {
    router.push(`/dashboard?account=${account}&pipeline=${type}`);
  }

  // ✅ SWITCH ACCOUNT (KEEP PIPELINE)
  function switchAccount(type: "BCF" | "BGR") {
    setOpen(false);
    router.push(`/dashboard?account=${type}&pipeline=${pipeline}`);
  }

  return (
    <div className="flex items-center justify-between w-full">

      {/* 🔵 LEFT: PIPELINE */}
      <div className="flex gap-2">
        <button
          onClick={() => switchPipeline("LEAD")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            pipeline === "LEAD"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Lead Pipeline
        </button>

        <button
          onClick={() => switchPipeline("SALES")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            pipeline === "SALES"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Sales Pipeline
        </button>
      </div>

      {/* 🟢 RIGHT: ACCOUNT DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200"
        >
          {account} ▼
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200 rounded-lg shadow-md z-50">
            <button
              onClick={() => switchAccount("BCF")}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                account === "BCF" ? "font-semibold" : ""
              }`}
            >
              BCF
            </button>

            <button
              onClick={() => switchAccount("BGR")}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                account === "BGR" ? "font-semibold" : ""
              }`}
            >
              BGR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}