"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ ADD
import QuickActions from "./QuickActions";
import AddLeadModal from "./AddLeadModal";
import type { PipelineStage } from "@/types";

export default function DashboardClient({
  stages,
  pipeline,
  pipelineId,
}: {
  stages: PipelineStage[];
  pipeline: "LEAD" | "SALES";
  pipelineId: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter(); // ✅ ADD

  function handleAddLead(newLead: any) {
    setAddOpen(false);

    // 🔥 AUTO REFRESH AFTER ADD
    router.refresh();
  }

  return (
    <>
      <QuickActions onAddLead={() => setAddOpen(true)} />

      {addOpen && (
        <AddLeadModal
          stages={stages.map((s) => ({
            label: s.label,
            value: s.id,
          }))}
          pipelineId={pipelineId}
          onClose={() => setAddOpen(false)}
          onCreated={handleAddLead} // ✅ already wired
        />
      )}
    </>
  );
}