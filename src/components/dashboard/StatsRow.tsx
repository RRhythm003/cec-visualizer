"use client";

import { useMeeting } from "@/context/MeetingContext";
import { cn } from "@/lib/utils";
import { ResolutionStatus } from "@/types";

interface StatCard {
  label: string;
  key: "total" | ResolutionStatus;
  color: string;
  dotColor: string;
  bg: string;
  border: string;
}

const STATS: StatCard[] = [
  {
    label: "Total",
    key: "total",
    color: "text-ink-black",
    dotColor: "bg-ink-muted",
    bg: "bg-white",
    border: "border-border",
  },
  {
    label: "Approved",
    key: "Approved",
    color: "text-sme",
    dotColor: "bg-sme",
    bg: "bg-sme-light",
    border: "border-sme-border",
  },
  {
    label: "Board Pending",
    key: "Approved (Board)",
    color: "text-board",
    dotColor: "bg-board",
    bg: "bg-board-light",
    border: "border-board-border",
  },
  {
    label: "Deferred",
    key: "Deferred",
    color: "text-amber",
    dotColor: "bg-amber",
    bg: "bg-amber-light",
    border: "border-amber-border",
  },
  {
    label: "Declined",
    key: "Declined",
    color: "text-red-dark",
    dotColor: "bg-red",
    bg: "bg-red-light",
    border: "border-red-mid",
  },
];

export default function StatsRow() {
  const { filteredProposals, proposals, filters, setFilters } = useMeeting();

  const counts = {
    total: filteredProposals.length,
    Approved: filteredProposals.filter((p) => p.resolution === "Approved").length,
    "Approved (Board)": filteredProposals.filter((p) => p.resolution === "Approved (Board)").length,
    Deferred: filteredProposals.filter((p) => p.resolution === "Deferred").length,
    Declined: filteredProposals.filter((p) => p.resolution === "Declined").length,
    Pending: filteredProposals.filter((p) => p.resolution === "Pending").length,
  };

  const baseTotal = proposals.length;

  const toggleResolution = (status: ResolutionStatus) => {
    const cur = filters.resolutions;
    setFilters({
      resolutions: cur.includes(status) ? cur.filter((r) => r !== status) : [...cur, status],
    });
  };

  return (
    <div className="grid grid-cols-5 gap-3 p-5 pb-0">
      {STATS.map((s) => {
        const count = s.key === "total" ? counts.total : counts[s.key as ResolutionStatus] ?? 0;
        const isActive =
          s.key !== "total" && filters.resolutions.includes(s.key as ResolutionStatus);

        return (
          <button
            key={s.key}
            onClick={() => s.key !== "total" && toggleResolution(s.key as ResolutionStatus)}
            className={cn(
              "relative text-left p-4 rounded-lg border transition-all",
              s.bg,
              isActive ? `${s.border} ring-2 ring-offset-1` : s.border,
              s.key !== "total" && "hover:opacity-80 cursor-pointer",
              s.key === "total" && "cursor-default"
            )}
            style={isActive ? { ringColor: "currentColor" } : {}}
          >
            <div className={cn("text-3xl font-serif font-bold leading-none mb-1.5", s.color)}>
              {count}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", s.dotColor)} />
              <span className="text-xs text-ink-muted font-medium">{s.label}</span>
            </div>
            {s.key === "total" && baseTotal !== count && (
              <div className="absolute top-2 right-2 text-[9px] font-mono text-ink-subtle">
                of {baseTotal}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
