import type { ActivityItem, ActivityType } from "@/types";
import clsx from "clsx";

const TYPE_META: Record<ActivityType, { label: string; dot: string; badge: string }> = {
  new_lead:   { label: "New Lead",   dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-600"    },
  contacted:  { label: "Contacted",  dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-600"  },
  quoted:     { label: "Quoted",     dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-600"},
  closed:     { label: "Closed",     dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600"},
  follow_up:  { label: "Follow-Up",  dot: "bg-orange-500",  badge: "bg-orange-50 text-orange-600"},
  note:       { label: "Note",       dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h2>

      {/* ✅ SCROLL CONTAINER */}
      <div className="max-h-[220px] overflow-y-auto pr-2">
        <div className="space-y-0">
          {items.map((item, i) => {
            const meta = TYPE_META[item.type];

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
              >
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center pt-1">
                  <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", meta.dot)} />
                  {i < items.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-1 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={clsx(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        meta.badge
                      )}
                    >
                      {meta.label}
                    </span>

                    <span className="text-sm text-slate-800 font-medium">
                      {item.leadName}
                    </span>

                    {item.actor !== "System" && (
                      <span className="text-xs text-slate-400">
                        by {item.actor}
                      </span>
                    )}
                  </div>

                  {item.note && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{item.note}"
                    </p>
                  )}
                </div>

                <span className="text-xs text-slate-400 flex-shrink-0 pt-0.5">
                  {timeAgo(item.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}