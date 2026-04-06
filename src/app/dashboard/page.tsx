"use client";

import { useState } from "react";
import { useMeeting } from "@/context/MeetingContext";
import { useAuth } from "@/context/AuthContext";
import TopBar from "@/components/layout/TopBar";
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

  return (
    <>
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        {/* Stats row */}
        <StatsRow />

        {/* Admin actions bar */}
        {isAdmin && (
          <div className="px-5 pt-4 flex items-center gap-3">
            <button
              onClick={() => setShowSetup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red hover:bg-red-dark text-white text-sm rounded transition-colors"
            >
              <Upload size={14} />
              New Meeting / Upload PDF
            </button>
            <div className="text-xs text-ink-muted font-mono">
              {currentMeeting?.status === "active" && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sme animate-pulse-dot" />
                  Live session active
                </span>
              )}
            </div>
          </div>
        )}

        {/* Proposal list */}
        <div className="p-5">
          {filteredProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ListFilter size={32} className="text-border mb-3" />
              <p className="text-sm font-medium text-ink-muted">No proposals match your filters</p>
              <p className="text-xs text-ink-subtle mt-1">Try adjusting or clearing your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filteredProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  onSelect={setSelectedProposal}
                  isFocused={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedProposal && (
        <DetailPanel
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}

      {/* Meeting setup modal */}
      {showSetup && <MeetingSetup onClose={() => setShowSetup(false)} />}
    </>
  );
}
