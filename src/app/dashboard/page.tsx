"use client";

import { useState } from "react";
import { useMeeting } from "@/context/MeetingContext";
import { useAuth } from "@/context/AuthContext";
import TopBar, { ViewMode } from "@/components/layout/TopBar";
import StatsRow from "@/components/dashboard/StatsRow";
import ProposalCard from "@/components/dashboard/ProposalCard";
import DetailPanel from "@/components/proposal/DetailPanel";
import MeetingSetup from "@/components/meeting/MeetingSetup";
import { Proposal } from "@/types";
import { cn } from "@/lib/utils";
import { Upload, ListFilter } from "lucide-react";

export default function DashboardPage() {
  const { filteredProposals, currentMeeting } = useMeeting();
  const { isAdmin } = useAuth();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5"
      : viewMode === "card"
      ? "grid grid-cols-1 xl:grid-cols-2 gap-3"
      : "flex flex-col gap-0"; // list and content use flex column

  return (
    <>
      <TopBar viewMode={viewMode} onViewChange={setViewMode} />

      <div className="flex-1 overflow-y-auto">
        <StatsRow />

        {isAdmin && (
          <div className="px-5 pt-4 flex items-center gap-3">
            <button
              onClick={() => setShowSetup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red hover:bg-red-dark text-white text-sm rounded transition-colors"
            >
              <Upload size={14} />
              New Meeting / Upload PDF
            </button>
            {currentMeeting?.status === "active" && (
              <span className="flex items-center gap-1.5 text-xs text-ink-muted font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-sme animate-pulse-dot" />
                Live session active
              </span>
            )}
          </div>
        )}

        <div className={cn("p-5", viewMode === "list" && "p-0 pt-1")}>
          {filteredProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ListFilter size={32} className="text-border mb-3" />
              <p className="text-sm font-medium text-ink-muted">No proposals match your filters</p>
              <p className="text-xs text-ink-subtle mt-1">Use the sidebar to adjust filters</p>
            </div>
          ) : (
            <div className={gridClass}>
              {filteredProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  onSelect={setSelectedProposal}
                  isFocused={false}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProposal && (
        <DetailPanel proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
      )}

      {showSetup && <MeetingSetup onClose={() => setShowSetup(false)} />}
    </>
  );
}
