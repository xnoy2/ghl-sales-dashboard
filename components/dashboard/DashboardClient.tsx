"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuickActions from "./QuickActions";
import AddLeadModal from "./AddLeadModal";
import type { PipelineStage } from "@/types";

export default function DashboardClient({
  stages,
  pipeline: _pipeline,
  pipelineId,
  account: _account,
  locationId,
}: {
  stages: PipelineStage[];
  pipeline: string;
  pipelineId: string;
  account: string;
  locationId: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();

  function handleAddLead(_newLead: any) {
    setAddOpen(false);
    router.refresh();
  }

  return (
    <>
      <QuickActions
        onAddLead={() => setAddOpen(true)}
        locationId={locationId}
        pipelineId={pipelineId}
      />

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
