"use client";

import { useState, useMemo } from "react";
import { useMeeting } from "@/context/MeetingContext";
import { useAuth } from "@/context/AuthContext";
import { Meeting, Proposal } from "@/types";
import {
  cn,
  formatDate,
  formatCrore,
  shouldAutoArchive,
  getCurrentYear,
} from "@/lib/utils";
import {
  Search,
  Calendar,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Radio,
  AlertTriangle,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type YearGroup = {
  year: number;
  meetings: Meeting[];
  isArchived: boolean;
};

export default function MeetingsPage() {
  const { meetings, getMeetingProposals, selectMeeting } = useMeeting();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedYears, setExpandedYears] = useState<number[]>([new Date().getFullYear()]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const currentYear = getCurrentYear();

  // Filter and group meetings
  const filteredMeetings = useMemo(() => {
    let result = [...meetings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.meeting_code.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.date.includes(q) ||
          // Also search proposals
          getMeetingProposals(m.id).some(
            (p) =>
              p.client_name.toLowerCase().includes(q) ||
              p.resolution_note?.toLowerCase().includes(q) ||
              p.proposal_code.toLowerCase().includes(q)
          )
        );
    }
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    return result;
  }, [meetings, searchQuery, statusFilter, getMeetingProposals]);

  // Group by year
  const yearGroups = useMemo<YearGroup[]>(() => {
    const map = new Map<number, Meeting[]>();
    for (const m of filteredMeetings) {
      const year = new Date(m.date).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(m);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, mts]) => ({
        year,
        meetings: mts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        isArchived: year < currentYear,
      }));
  }, [filteredMeetings, currentYear]);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleViewMeeting = (meeting: Meeting) => {
    selectMeeting(meeting.id);
    if (meeting.status === "active") {
      router.push(`/dashboard/meeting/${meeting.id}`);
    } else {
      router.push("/dashboard");
    }
  };

  // Search hit count
  const searchHits = useMemo(() => {
    if (!searchQuery.trim()) return null;
    let proposalHits = 0;
    for (const m of filteredMeetings) {
      const q = searchQuery.toLowerCase();
      proposalHits += getMeetingProposals(m.id).filter(
        (p) =>
          p.client_name.toLowerCase().includes(q) ||
          p.resolution_note?.toLowerCase().includes(q) ||
          p.proposal_code.toLowerCase().includes(q)
      ).length;
    }
    return { meetings: filteredMeetings.length, proposals: proposalHits };
  }, [searchQuery, filteredMeetings, getMeetingProposals]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page header */}
      <div className="bg-surface border-b border-border px-6 py-5">
        <h1 className="font-display text-2xl text-ink-black mb-0.5">Meetings</h1>
        <p className="text-sm text-ink-muted">
          CEC meeting history, minutes, and decisions — {meetings.length} sessions on record
        </p>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-lg">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings, clients, resolutions, proposal codes…"
              className="w-full pl-9 pr-4 py-2 border border-border rounded-sm text-sm bg-bg focus:outline-none focus:border-red transition-colors placeholder:text-ink-subtle"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-border rounded px-2 py-2 bg-bg text-ink focus:outline-none focus:border-red"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Search results summary */}
        {searchHits && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-ink-muted">
              Found{" "}
              <span className="font-semibold text-red">{searchHits.meetings}</span> meetings
              {searchHits.proposals > 0 && (
                <>, <span className="font-semibold text-red">{searchHits.proposals}</span> proposal matches</>
              )}{" "}
              for{" "}
              <span className="font-mono bg-red-light text-red-dark px-1.5 py-0.5 rounded text-xs">
                &quot;{searchQuery}&quot;
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Auto-archive notice */}
      {isAdmin && (
        <div className="mx-6 mt-4 p-3 bg-board-light border border-board-border rounded flex items-start gap-2">
          <AlertTriangle size={13} className="text-board mt-0.5 flex-shrink-0" />
          <p className="text-xs text-board">
            <span className="font-semibold">Auto-archive enabled:</span> All meetings from previous years
            are automatically archived at the start of each new year. Archived meetings are read-only
            and fully searchable.
          </p>
        </div>
      )}

      {/* Year groups */}
      <div className="p-6 space-y-6">
        {yearGroups.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={28} className="text-border mx-auto mb-3" />
            <p className="text-sm text-ink-muted">No meetings match your search</p>
          </div>
        ) : (
          yearGroups.map((group) => (
            <div key={group.year}>
              {/* Year header */}
              <button
                onClick={() => toggleYear(group.year)}
                className="flex items-center gap-3 w-full mb-3 group"
              >
                <div className="flex items-center gap-2">
                  {expandedYears.includes(group.year) ? (
                    <ChevronDown size={14} className="text-ink-muted" />
                  ) : (
                    <ChevronRight size={14} className="text-ink-muted" />
                  )}
                  <span className="font-display text-xl text-ink-black">{group.year}</span>
                </div>
                <div className="text-xs text-ink-subtle font-mono">
                  {group.meetings.length} meetings
                </div>
                <div className="flex-1 h-px bg-border" />
              </button>

              {/* Meeting cards */}
              {expandedYears.includes(group.year) && (
                <div className="space-y-3">
                  {group.meetings.map((m) => (
                    <MeetingHistoryCard
                      key={m.id}
                      meeting={m}
                      proposals={getMeetingProposals(m.id)}
                      searchQuery={searchQuery}
                      onView={() => handleViewMeeting(m)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MeetingHistoryCard({
  meeting: m,
  proposals,
  searchQuery,
  onView,
  isAdmin,
}: {
  meeting: Meeting;
  proposals: Proposal[];
  searchQuery: string;
  onView: () => void;
  isAdmin: boolean;
}) {
  const [showProposals, setShowProposals] = useState(false);

  // Highlight search matches in proposals
  const matchedProposals = searchQuery.trim()
    ? proposals.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.client_name.toLowerCase().includes(q) ||
          p.resolution_note?.toLowerCase().includes(q) ||
          p.proposal_code.toLowerCase().includes(q)
        );
      })
    : [];

  const statusConfig = {
    active: { icon: <Radio size={12} />, label: "Live", cls: "text-sme bg-sme-light border-sme-border" },
    locked: { icon: <Lock size={12} />, label: "Locked", cls: "text-amber bg-amber-light border-amber-border" },
    archived: { icon: <Lock size={12} />, label: "Archived", cls: "text-board bg-board-light border-board-border" },
    published: { icon: <Eye size={12} />, label: "Published", cls: "text-corporate bg-corporate-light border-corporate-border" },
    draft: { icon: <Clock size={12} />, label: "Draft", cls: "text-ink-muted bg-border-soft border-border" },
  };

  const sc = statusConfig[m.status] ?? statusConfig.draft;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden hover:border-red-mid transition-colors">
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className="flex-shrink-0 w-12 text-center">
            <div className="text-xs font-mono text-ink-muted uppercase">
              {new Date(m.date).toLocaleString("en-GB", { month: "short" })}
            </div>
            <div className="text-2xl font-display font-bold text-ink-black leading-none">
              {new Date(m.date).getDate().toString().padStart(2, "0")}
            </div>
            <div className="text-xs font-mono text-ink-muted">
              {new Date(m.date).getFullYear()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-ink-subtle">{m.meeting_code}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full border uppercase tracking-widest",
                  sc.cls
                )}
              >
                {sc.icon}
                {sc.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-ink-black mb-2">{m.title}</h3>

            {/* Summary stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <StatChip label="Total" value={m.summary.total} color="text-ink-muted" />
              <StatChip label="Approved" value={m.summary.approved} color="text-sme" />
              <StatChip label="Board" value={m.summary.board_pending} color="text-board" />
              <StatChip label="Deferred" value={m.summary.deferred} color="text-amber" />
              <StatChip label="Declined" value={m.summary.declined} color="text-red" />
              <span className="text-xs text-ink-subtle">·</span>
              <StatChip label="Corporate" value={m.summary.corporate} color="text-corporate" />
              <StatChip label="SME" value={m.summary.sme} color="text-sme" />
              <StatChip label="Consumer" value={m.summary.consumer} color="text-amber" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {matchedProposals.length > 0 && (
              <button
                onClick={() => setShowProposals((v) => !v)}
                className="text-xs text-red hover:text-red-dark font-medium"
              >
                {matchedProposals.length} match{matchedProposals.length > 1 ? "es" : ""}
              </button>
            )}
            <button
              onClick={onView}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                m.status === "active"
                  ? "bg-red hover:bg-red-dark text-white btn-join-pulse"
                  : "border border-border hover:border-red-mid text-ink-muted hover:text-red bg-transparent"
              )}
            >
              <Eye size={11} />
              {m.status === "active" ? "Join" : "View"}
            </button>
          </div>
        </div>

        {/* Search matches */}
        {showProposals && matchedProposals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border-soft space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle mb-2">
              Matching proposals
            </p>
            {matchedProposals.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 px-3 py-2 bg-border-soft rounded text-xs"
              >
                <span className="font-mono text-ink-subtle">{p.proposal_code}</span>
                <span className="font-medium text-ink-black">{p.client_name}</span>
                <span className="text-ink-muted">{p.division}</span>
                <span
                  className={cn(
                    "ml-auto font-mono px-1.5 py-0.5 rounded text-[9px]",
                    p.resolution === "Approved" || p.resolution === "Approved (Board)"
                      ? "bg-sme-light text-sme"
                      : p.resolution === "Declined"
                      ? "bg-red-light text-red-dark"
                      : p.resolution === "Deferred"
                      ? "bg-amber-light text-amber"
                      : "bg-border text-ink-muted"
                  )}
                >
                  {p.resolution}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  if (value === 0) return null;
  return (
    <div className="flex items-center gap-1">
      <span className={cn("text-xs font-bold font-mono", color)}>{value}</span>
      <span className="text-xs text-ink-subtle">{label}</span>
    </div>
  );
}
