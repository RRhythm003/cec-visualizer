"use client";

import { useState, useEffect } from "react";
import { useMeeting } from "@/context/MeetingContext";
import { useAuth } from "@/context/AuthContext";
import { cn, formatDate } from "@/lib/utils";
import { FilterState, ResolutionStatus, SortOption, IRGGrade, CIBStatus } from "@/types";
import { Search, X, SlidersHorizontal, Moon, Sun, ChevronDown } from "lucide-react";

const RESOLUTIONS: ResolutionStatus[] = ["Approved", "Approved (Board)", "Deferred", "Declined", "Pending"];
const IRG_GRADES: IRGGrade[] = ["IDLC 1", "IDLC 2", "IDLC 3", "IDLC 4", "IDLC 5", "IDLC 6", "IDLC 7"];
const CIB_STATUSES: CIBStatus[] = ["STD", "SMA", "SS", "DF", "BL", "Unclassified"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Proposal Order (Default)" },
  { value: "exposure_high", label: "Exposure: High → Low" },
  { value: "exposure_low", label: "Exposure: Low → High" },
  { value: "waiver_high", label: "Waiver Amount: Largest First" },
  { value: "irg_risky", label: "IRG Risk: Riskiest First" },
  { value: "irg_safe", label: "IRG Risk: Safest First" },
];

export default function TopBar() {
  const { currentMeeting, filteredProposals, filters, setFilters, clearFilters, selectMeeting, meetings } =
    useMeeting();
  const { isAdmin } = useAuth();
  const [dark, setDark] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMeetingPicker, setShowMeetingPicker] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const activeFilterCount =
    filters.divisions.length +
    filters.categories.length +
    filters.resolutions.length +
    filters.irg_grades.length +
    filters.cib_statuses.length +
    (filters.search_query ? 1 : 0);

  const toggleResolution = (r: ResolutionStatus) => {
    const cur = filters.resolutions;
    setFilters({ resolutions: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] });
  };

  const toggleIRG = (g: IRGGrade) => {
    const cur = filters.irg_grades;
    setFilters({ irg_grades: cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g] });
  };

  const toggleCIB = (s: CIBStatus) => {
    const cur = filters.cib_statuses;
    setFilters({ cib_statuses: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s] });
  };

  return (
    <header className="bg-white border-b border-border px-6 py-0">
      {/* Main bar */}
      <div className="flex items-center gap-4 h-14">
        {/* Meeting picker */}
        <div className="relative">
          <button
            onClick={() => setShowMeetingPicker((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-red-mid hover:bg-red-light transition-all text-sm"
          >
            <span className="text-xs font-mono text-ink-muted">{currentMeeting?.meeting_code}</span>
            <span className="font-medium text-ink-black truncate max-w-[180px]">
              {currentMeeting?.title}
            </span>
            <span
              className={cn(
                "text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                currentMeeting?.status === "active"
                  ? "bg-sme text-white"
                  : currentMeeting?.status === "locked"
                  ? "bg-amber-light text-amber border border-amber-border"
                  : "bg-border text-ink-muted"
              )}
            >
              {currentMeeting?.status}
            </span>
            <ChevronDown size={12} className="text-ink-subtle" />
          </button>

          {showMeetingPicker && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-border rounded-lg shadow-panel z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border-soft">
                <p className="text-xs font-mono text-ink-muted uppercase tracking-widest">Recent Meetings</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {meetings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      selectMeeting(m.id);
                      setShowMeetingPicker(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-2.5 hover:bg-border-soft transition-colors text-left",
                      currentMeeting?.id === m.id && "bg-red-light"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-ink-muted">{m.meeting_code}</div>
                      <div className="text-sm font-medium text-ink-black truncate">{m.title}</div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {m.proposal_count} proposals · {m.summary.approved} approved
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase mt-1 flex-shrink-0",
                        m.status === "active" ? "bg-sme text-white" :
                        m.status === "archived" ? "bg-board-light text-board border border-board-border" :
                        "bg-border text-ink-muted"
                      )}
                    >
                      {m.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={filters.search_query}
            onChange={(e) => setFilters({ search_query: e.target.value })}
            placeholder="Search client, group, AG code…"
            className="w-full pl-9 pr-8 py-1.5 text-sm border border-border rounded bg-bg focus:outline-none focus:border-red transition-colors placeholder:text-ink-subtle"
          />
          {filters.search_query && (
            <button
              onClick={() => setFilters({ search_query: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-red"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort_by}
          onChange={(e) => setFilters({ sort_by: e.target.value as SortOption })}
          className="text-xs border border-border rounded px-2 py-1.5 bg-bg text-ink focus:outline-none focus:border-red"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all",
            showFilters || activeFilterCount > 0
              ? "border-red-mid bg-red-light text-red-dark"
              : "border-border bg-bg text-ink hover:border-red-mid"
          )}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-red text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Dark mode */}
        <button
          onClick={() => setDark((v) => !v)}
          className="p-1.5 rounded border border-border text-ink-subtle hover:text-ink hover:border-red-mid transition-all"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Result count */}
        <div className="text-xs text-ink-muted font-mono whitespace-nowrap">
          {filteredProposals.length} / {currentMeeting?.proposal_count ?? 0} proposals
        </div>
      </div>

      {/* Advanced filter bar */}
      {showFilters && (
        <div className="pb-3 pt-1 border-t border-border-soft flex flex-wrap items-center gap-2">
          {/* Resolution */}
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle">Resolution:</span>
          {RESOLUTIONS.map((r) => (
            <button
              key={r}
              onClick={() => toggleResolution(r)}
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border transition-all font-mono",
                filters.resolutions.includes(r)
                  ? "bg-red-light text-red-dark border-red-mid"
                  : "border-border text-ink-muted hover:border-red-mid"
              )}
            >
              {r}
            </button>
          ))}

          <div className="w-px h-4 bg-border" />

          {/* IRG */}
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle">IRG:</span>
          {IRG_GRADES.map((g) => (
            <button
              key={g}
              onClick={() => toggleIRG(g)}
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border transition-all font-mono",
                filters.irg_grades.includes(g)
                  ? "bg-red-light text-red-dark border-red-mid"
                  : "border-border text-ink-muted hover:border-red-mid"
              )}
            >
              {g}
            </button>
          ))}

          <div className="w-px h-4 bg-border" />

          {/* CIB */}
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle">CIB:</span>
          {CIB_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => toggleCIB(s)}
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border transition-all font-mono",
                filters.cib_statuses.includes(s)
                  ? "bg-red-light text-red-dark border-red-mid"
                  : "border-border text-ink-muted hover:border-red-mid"
              )}
            >
              {s}
            </button>
          ))}

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-red hover:text-red-dark flex items-center gap-1"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>
      )}

      {/* Active filter pills */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="pb-2 flex flex-wrap gap-1.5">
          {[...filters.divisions, ...filters.categories, ...filters.resolutions].map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-light text-red-dark border border-red-mid text-xs font-mono"
            >
              {f}
              <button
                onClick={() => {
                  if (filters.divisions.includes(f as Division))
                    setFilters({ divisions: filters.divisions.filter((d) => d !== f) });
                  if (filters.categories.includes(f as Category))
                    setFilters({ categories: filters.categories.filter((c) => c !== f) });
                  if (filters.resolutions.includes(f as ResolutionStatus))
                    setFilters({ resolutions: filters.resolutions.filter((r) => r !== f) });
                }}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <button onClick={clearFilters} className="text-xs text-red hover:text-red-dark font-mono">
            Clear all
          </button>
        </div>
      )}
    </header>
  );
}
