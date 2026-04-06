"use client";

import { useState } from "react";
import { useMeeting } from "@/context/MeetingContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { FilterState, SortOption, Division, Category, ResolutionStatus } from "@/types";
import {
  Search,
  X,
  SlidersHorizontal,
  Moon,
  Sun,
  ChevronDown,
  List,
  LayoutGrid,
  AlignJustify,
  CreditCard,
} from "lucide-react";

export type ViewMode = "grid" | "card" | "list" | "content";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Proposal Order" },
  { value: "exposure_high", label: "Exposure: High → Low" },
  { value: "exposure_low", label: "Exposure: Low → High" },
  { value: "waiver_high", label: "Waiver: Largest First" },
  { value: "irg_risky", label: "IRG: Riskiest First" },
  { value: "irg_safe", label: "IRG: Safest First" },
];

const VIEW_OPTIONS: { value: ViewMode; icon: React.ReactNode; title: string }[] = [
  { value: "grid", icon: <LayoutGrid size={13} />, title: "Grid (compact)" },
  { value: "content", icon: <AlignJustify size={13} />, title: "Content (rows)" },
  { value: "list", icon: <List size={13} />, title: "List (minimal)" },
  { value: "card", icon: <CreditCard size={13} />, title: "Card (detailed)" },
];

interface TopBarProps {
  viewMode?: ViewMode;
  onViewChange?: (mode: ViewMode) => void;
}

export default function TopBar({ viewMode = "grid", onViewChange }: TopBarProps) {
  const { currentMeeting, filteredProposals, filters, setFilters, clearFilters, selectMeeting, meetings } =
    useMeeting();
  const { dark, toggleDark } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [showMeetingPicker, setShowMeetingPicker] = useState(false);

  const activeFilterCount =
    filters.divisions.length +
    filters.categories.length +
    filters.resolutions.length +
    (filters.search_query ? 1 : 0);

  const allActiveFilters = [
    ...filters.divisions,
    ...filters.categories,
    ...filters.resolutions,
    ...(filters.search_query ? [`"${filters.search_query}"`] : []),
  ];

  const removeFilter = (f: string) => {
    if (filters.divisions.includes(f as Division))
      setFilters({ divisions: filters.divisions.filter((d) => d !== f) });
    else if (filters.categories.includes(f as Category))
      setFilters({ categories: filters.categories.filter((c) => c !== f) });
    else if (filters.resolutions.includes(f as ResolutionStatus))
      setFilters({ resolutions: filters.resolutions.filter((r) => r !== f) });
    else if (f.startsWith('"'))
      setFilters({ search_query: "" });
  };

  return (
    <header className="bg-surface border-b border-border px-6 py-0">
      {/* Main bar */}
      <div className="flex items-center gap-3 h-14">
        {/* Meeting picker */}
        <div className="relative">
          <button
            onClick={() => setShowMeetingPicker((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-red-mid hover:bg-red-light transition-all text-sm"
          >
            <span className="text-xs font-mono text-ink-muted">{currentMeeting?.meeting_code}</span>
            <span className="font-medium text-ink-black truncate max-w-[160px]">
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
            <div className="absolute top-full left-0 mt-1 w-80 bg-surface border border-border rounded-lg shadow-panel z-50 overflow-hidden">
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
                      "w-full flex items-start gap-3 px-4 py-2.5 hover:bg-surface-raised transition-colors text-left",
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
        <div className="flex-1 max-w-sm relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={filters.search_query}
            onChange={(e) => setFilters({ search_query: e.target.value })}
            placeholder="Search client, code, group…"
            className="w-full pl-8 pr-7 py-1.5 text-sm border border-border rounded bg-bg focus:outline-none focus:border-red transition-colors placeholder:text-ink-subtle text-ink"
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

        {/* Filters toggle — shows/hides active filter pills */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all",
            showFilters || activeFilterCount > 0
              ? "border-red-mid bg-red-light text-red-dark"
              : "border-border bg-bg text-ink hover:border-red-mid"
          )}
          title="Toggle active filters"
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-red text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View mode buttons */}
        {onViewChange && (
          <div className="flex items-center gap-0.5 border border-border rounded overflow-hidden bg-bg">
            {VIEW_OPTIONS.map(({ value, icon, title }) => (
              <button
                key={value}
                onClick={() => onViewChange(value)}
                title={title}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === value
                    ? "bg-red text-white"
                    : "text-ink-subtle hover:text-ink hover:bg-surface-raised"
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="p-1.5 rounded border border-border text-ink-subtle hover:text-ink hover:border-red-mid transition-all"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Result count */}
        <div className="text-xs text-ink-muted font-mono whitespace-nowrap">
          {filteredProposals.length} / {currentMeeting?.proposal_count ?? 0}
        </div>
      </div>

      {/* Active filter pills — shown when Filters is toggled ON or auto-shown when filters exist */}
      {(showFilters && activeFilterCount > 0) && (
        <div className="pb-2.5 flex flex-wrap items-center gap-1.5">
          {allActiveFilters.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-light text-red-dark border border-red-mid text-xs font-mono"
            >
              {f}
              <button onClick={() => removeFilter(f)} className="hover:text-red">
                <X size={10} />
              </button>
            </span>
          ))}
          <button
            onClick={() => { clearFilters(); setShowFilters(false); }}
            className="text-xs text-red hover:text-red-dark font-mono"
          >
            Clear all
          </button>
        </div>
      )}

      {/* No active filters message when toggle is on */}
      {showFilters && activeFilterCount === 0 && (
        <div className="pb-2.5 text-xs text-ink-subtle font-mono">
          No active filters — use the sidebar or click division/category tags to filter.
        </div>
      )}
    </header>
  );
}
