import { TrendingUp } from "lucide-react";
import type { PipelineStage } from "@/types";

export default function StatGrid({
  stages,
}: {
  stages: PipelineStage[];
}) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${stages.length}, minmax(200px, 1fr))`,
      }}
    >
      {stages.map((stage, i) => {
        const totalValue = stage.leads.reduce(
          (sum, l) => sum + l.value,
          0
        );

        return (
          <div
            key={stage.id}
            className={`card p-4 animate-slide-up stagger-${i + 1} group hover:-translate-y-0.5 transition-transform duration-150`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 leading-tight">
                {stage.label}
              </p>

              <div className="bg-slate-100 text-slate-600 p-1.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Count */}
            <p className="text-3xl font-semibold text-slate-900">
              {stage.leads.length}
            </p>

            {/* Optional: Value */}
            <p className="text-xs text-slate-400 mt-1">
              ${totalValue.toLocaleString()}
            </p>

            {/* Progress bar (relative) */}
            <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-slate-500 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    (stage.leads.length / 10) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}