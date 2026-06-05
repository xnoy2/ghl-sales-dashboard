"use client";

import Link from "next/link";
import { Plus, LayoutList, MessageSquare, Calendar } from "lucide-react";

export default function QuickActions({
  onAddLead,
  locationId,
  pipelineId,
}: {
  onAddLead: () => void;
  locationId: string;
  pipelineId: string;
}) {
  const base = `https://app.gohighlevel.com/v2/location/${locationId}`;

  return (
    <div className="flex flex-wrap gap-3 pb-6">

      {/* Add New Lead */}
      <button
        onClick={onAddLead}
        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition flex items-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add New Lead
      </button>

      {/* View Full Pipeline — opens GHL Opportunities for the current account + pipeline */}
      <Link
        href={`${base}/opportunities/list?pipeline_id=${pipelineId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <LayoutList className="w-4 h-4" />
        View Full Pipeline
      </Link>

      {/* Open Conversations — opens GHL Conversations inbox */}
      <Link
        href={`${base}/conversations`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <MessageSquare className="w-4 h-4" />
        Open Conversations
      </Link>

      {/* View Calendar — opens GHL Calendar */}
      <Link
        href={`${base}/calendars/view`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <Calendar className="w-4 h-4" />
        View Calendar
      </Link>

    </div>
  );
}
