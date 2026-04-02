"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, LayoutList, MessageSquare, Calendar } from "lucide-react";
import AddLeadModal from "./AddLeadModal";

export default function QuickActions() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3 pb-6">
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>

        <Link
        href="https://app.gohighlevel.com/v2/location/GSxspezlKiWYWE604ot9/opportunities/list"
        target="_blank"
        className="btn-secondary flex items-center gap-2"
      >
        <LayoutList className="w-4 h-4" />
        View Full Pipeline
      </Link>

        <Link
        href="https://app.gohighlevel.com/v2/location/GSxspezlKiWYWE604ot9/opportunities/list"
        target="_blank"
        className="btn-secondary flex items-center gap-2"
      >
        <LayoutList className="w-4 h-4" />
        Open Conversations
      </Link>

        <Link
        href="https://app.gohighlevel.com/v2/location/GSxspezlKiWYWE604ot9/calendars/view?user_ids=xxhSEdopuQAEAwsJkVCR,HQBHMm3FEMZz2ki2ddV4,mLLHxoKMRQhsIV9hv9dR,FrnTIMv2U9gqbD0yIQNr,jCNushzFdbrAzn1iiLsU,opXAjfdffILLO1cdxe7W,xVLgQGTpPpHhNbWxMtns,LWJNKLN7L02j0NUENAWN,DsyHyyCyfbI7FtemxOGI,PqyjQynNOkxtChaP9eOK"
        target="_blank"
        className="btn-secondary flex items-center gap-2"
      >
        <LayoutList className="w-4 h-4" />
        View Calendar
      </Link>
      </div>

      {addOpen && <AddLeadModal onClose={() => setAddOpen(false)} />}
    </>
  );
}
