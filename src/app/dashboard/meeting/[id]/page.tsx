"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMeeting } from "@/context/MeetingContext";
import { useAuth } from "@/context/AuthContext";
import { Proposal, Participant } from "@/types";
import ProposalCard from "@/components/dashboard/ProposalCard";
import DetailPanel from "@/components/proposal/DetailPanel";
import { cn, formatDate } from "@/lib/utils";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";

const DEMO_PARTICIPANTS: Participant[] = [
  {
    user_id: "usr_admin_001",
    name: "Nafisa Rahman",
    role: "admin",
    avatar_initials: "NR",
    joined_at: new Date().toISOString(),
    is_online: true,
  },
  {
    user_id: "usr_approver_001",
    name: "Arif Hossain",
    role: "approver",
    avatar_initials: "AH",
    joined_at: new Date().toISOString(),
    is_online: true,
  },
  {
    user_id: "usr_approver_002",
    name: "Tahmina Khatun",
    role: "approver",
    avatar_initials: "TK",
    joined_at: new Date().toISOString(),
    is_online: true,
  },
  {
    user_id: "usr_approver_003",
    name: "Md. Rezaul Karim",
    role: "approver",
    avatar_initials: "RK",
    joined_at: new Date(Date.now() - 120000).toISOString(),
    is_online: false,
  },
];

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const {
    meetings,
    getMeetingProposals,
    updateResolution,
    focusedProposalId,
    setFocusedProposalId,
    toggleLock,
  } = useMeeting();

  const meetingId = params.id as string;
  const meeting = meetings.find((m) => m.id === meetingId);
  const proposals = getMeetingProposals(meetingId);

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [participants] = useState<Participant[]>(DEMO_PARTICIPANTS);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Derive lock state from meeting status in context
  const isLocked = meeting?.status === "locked";

  useEffect(() => {
    if (meeting?.status === "active") {
      const interval = setInterval(() => setElapsedTime((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [meeting]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (!meeting) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-muted">Meeting not found</p>
      </div>
    );
  }

  const currentProposal = proposals[currentIndex];

  const handleFocus = (proposal: Proposal) => {
    if (isAdmin) {
      setFocusedProposalId(proposal.id);
      setCurrentIndex(proposals.findIndex((p) => p.id === proposal.id));
      toast(`Now presenting: ${proposal.client_name}`, { icon: "📋" });
    }
    setSelectedProposal(proposal);
  };

  const handleToggleLock = () => {
    toggleLock(meetingId);
    toast.success(isLocked ? "Meeting unlocked." : "Meeting locked. No further edits allowed.");
  };

  const navigateProposal = (dir: "prev" | "next") => {
    const next =
      dir === "next"
        ? Math.min(currentIndex + 1, proposals.length - 1)
        : Math.max(currentIndex - 1, 0);
    setCurrentIndex(next);
    setFocusedProposalId(proposals[next]?.id ?? null);
    setSelectedProposal(proposals[next] ?? null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Meeting top bar */}
      <div className="bg-ink-black text-white px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative w-2.5 h-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sme block" />
            <span className="w-2.5 h-2.5 rounded-full bg-sme/40 block absolute inset-0 animate-ping" />
          </div>
          <span className="text-sm font-semibold">{meeting.title}</span>
          <span className="text-xs font-mono text-white/40">{meeting.meeting_code}</span>
        </div>

        <div className="ml-4 text-xs font-mono text-white/40 tabular-nums">
          {formatTime(elapsedTime)}
        </div>

        <div className="flex-1" />

        {/* Participant avatars */}
        <div className="flex items-center gap-1">
          <Users size={13} className="text-white/40 mr-1" />
          <div className="flex -space-x-1.5">
            {participants
              .filter((p) => p.is_online)
              .slice(0, 5)
              .map((pt) => (
                <div
                  key={pt.user_id}
                  title={`${pt.name} (${pt.role})`}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-ink-black",
                    pt.role === "admin"
                      ? "bg-red"
                      : pt.role === "approver"
                      ? "bg-corporate"
                      : "bg-sme"
                  )}
                >
                  {pt.avatar_initials}
                </div>
              ))}
          </div>
          <span className="text-xs text-white/40 ml-1 font-mono">
            {participants.filter((p) => p.is_online).length} online
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((v) => !v)}
            className={cn(
              "p-1.5 rounded transition-colors",
              muted ? "bg-red text-white" : "text-white/50 hover:text-white"
            )}
          >
            {muted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={() => setVideoOn((v) => !v)}
            className={cn(
              "p-1.5 rounded transition-colors",
              videoOn ? "bg-corporate text-white" : "text-white/50 hover:text-white"
            )}
          >
            {videoOn ? <Video size={14} /> : <VideoOff size={14} />}
          </button>
          {isAdmin && (
            <button
              onClick={handleToggleLock}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded border text-xs transition-all",
                isLocked
                  ? "bg-amber/20 border-amber/40 text-amber hover:bg-amber hover:text-white"
                  : "bg-sme/20 border-sme/40 text-sme hover:bg-sme hover:text-white"
              )}
            >
              {isLocked ? (
                <>
                  <Unlock size={11} /> Unlock Meeting
                </>
              ) : (
                <>
                  <Lock size={11} /> Lock Meeting
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: proposal navigator */}
        <div className="w-[360px] flex-shrink-0 border-r border-border bg-bg overflow-y-auto sidebar-scroll">
          <div className="sticky top-0 bg-surface border-b border-border px-4 py-2.5 flex items-center justify-between z-10">
            <div className="text-xs font-mono text-ink-muted">
              {currentIndex + 1} / {proposals.length} proposals
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => navigateProposal("prev")}
                disabled={currentIndex === 0}
                className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => navigateProposal("next")}
                disabled={currentIndex === proposals.length - 1}
                className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-2">
            {proposals.map((p, i) => (
              <div key={p.id} className="relative">
                {i === currentIndex && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-red rounded-full" />
                )}
                <ProposalCard
                  proposal={p}
                  onSelect={handleFocus}
                  isFocused={p.id === focusedProposalId}
                  viewMode="grid"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center: presenting view */}
        <div className="flex-1 overflow-y-auto p-6 bg-bg">
          {currentProposal ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-mono text-sme bg-sme-light border border-sme-border px-2.5 py-1 rounded-full">
                  <Radio size={10} className="animate-pulse" />
                  Now presenting
                </span>
                <span className="text-sm text-ink-muted">{currentProposal.proposal_code}</span>
              </div>

              <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-card">
                <div className="bg-ink-black px-6 py-5">
                  <div className="text-xs font-mono text-white/40 mb-1">
                    {currentProposal.proposal_code}
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {currentProposal.client_name}
                  </h2>
                  {currentProposal.group_name && (
                    <p className="text-sm text-white/50">{currentProposal.group_name}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">
                      {currentProposal.division}
                    </span>
                    <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">
                      {currentProposal.category}
                    </span>
                    {currentProposal.resolution !== "Pending" && (
                      <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">
                        {currentProposal.resolution}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
                  {[
                    {
                      label: "Cumulative Exp.",
                      value:
                        currentProposal.cumulative_exposure != null
                          ? `BDT ${currentProposal.cumulative_exposure} Cr`
                          : currentProposal.current_outstanding != null
                          ? `BDT ${currentProposal.current_outstanding} Cr`
                          : "—",
                    },
                    { label: "IRG Grade", value: currentProposal.irg_grade ?? "—" },
                    { label: "CIB Status", value: currentProposal.cib_status ?? "—" },
                    {
                      label: "Rate",
                      value: currentProposal.interest_rate
                        ? `${currentProposal.interest_rate}%`
                        : "—",
                    },
                  ].map((m) => (
                    <div key={m.label} className="px-5 py-3">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-ink-subtle mb-0.5">
                        {m.label}
                      </div>
                      <div className="text-base font-mono font-bold text-ink-black">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="p-5">
                  {currentProposal.resolution !== "Pending" ? (
                    <div>
                      <div className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-2">
                        Resolution
                      </div>
                      <div className="text-base font-semibold text-sme mb-1">
                        ✓ {currentProposal.resolution}
                      </div>
                      {currentProposal.resolution_note && (
                        <p className="text-sm text-ink bg-surface-raised rounded px-3 py-2">
                          {currentProposal.resolution_note}
                        </p>
                      )}
                    </div>
                  ) : isAdmin && !isLocked ? (
                    <QuickResolutionForm
                      proposalId={currentProposal.id}
                      onSave={updateResolution}
                    />
                  ) : (
                    <div className="text-sm text-ink-muted italic">Awaiting resolution…</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-ink-muted">
              Select a proposal to present
            </div>
          )}
        </div>

        {/* Right: participants panel */}
        <div className="w-[200px] flex-shrink-0 border-l border-border bg-surface overflow-y-auto">
          <div className="px-3 py-2.5 border-b border-border-soft">
            <p className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle">
              Participants ({participants.length})
            </p>
          </div>
          <div className="p-2 space-y-1">
            {participants.map((pt) => (
              <div
                key={pt.user_id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded",
                  pt.user_id === user?.id && "bg-surface-raised"
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white",
                      pt.role === "admin"
                        ? "bg-red"
                        : pt.role === "approver"
                        ? "bg-corporate"
                        : "bg-sme"
                    )}
                  >
                    {pt.avatar_initials}
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface",
                      pt.is_online ? "bg-sme" : "bg-border"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-ink-black truncate">
                    {pt.name.split(" ")[0]}
                  </div>
                  <div className="text-[9px] font-mono text-ink-subtle capitalize">{pt.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel — opens when card is clicked in proposal list */}
      {selectedProposal && (
        <DetailPanel proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
      )}
    </div>
  );
}

function QuickResolutionForm({
  proposalId,
  onSave,
}: {
  proposalId: string;
  onSave: (id: string, res: Proposal["resolution"], note: string) => void;
}) {
  const [selected, setSelected] = useState<Proposal["resolution"]>("Pending");
  const [note, setNote] = useState("");

  const options: Array<{ value: Proposal["resolution"]; label: string; color: string }> = [
    {
      value: "Approved",
      label: "✓ Approved",
      color:
        "bg-sme-light border-sme-border text-sme hover:bg-sme hover:text-white",
    },
    {
      value: "Approved (Board)",
      label: "⚡ Board Approval",
      color:
        "bg-board-light border-board-border text-board hover:bg-board hover:text-white",
    },
    {
      value: "Deferred",
      label: "⏸ Deferred",
      color:
        "bg-amber-light border-amber-border text-amber hover:bg-amber hover:text-white",
    },
    {
      value: "Declined",
      label: "✗ Declined",
      color: "bg-red-light border-red-mid text-red-dark hover:bg-red hover:text-white",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-2">
        Set Resolution
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={cn(
              "py-2 px-3 rounded border text-xs font-semibold transition-all",
              opt.color,
              selected === opt.value && "ring-2 ring-offset-1 ring-ink-black/20"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Resolution notes (conditions, remarks…)"
        rows={2}
        className="w-full border border-border rounded px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:border-red resize-none"
      />
      <button
        onClick={() => {
          if (selected !== "Pending") {
            onSave(proposalId, selected, note);
            toast.success("Resolution recorded");
          }
        }}
        disabled={selected === "Pending"}
        className="w-full bg-red hover:bg-red-dark text-white py-2 rounded text-sm font-medium transition-colors disabled:opacity-40"
      >
        Record Resolution
      </button>
    </div>
  );
}
