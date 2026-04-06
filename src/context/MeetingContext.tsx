"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Meeting, Proposal, FilterState, SortOption } from "@/types";
import { DEMO_MEETINGS, DEMO_PROPOSALS, LIVE_PROPOSALS } from "@/lib/data/demo-proposals";

interface MeetingContextValue {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  proposals: Proposal[];
  filteredProposals: Proposal[];
  filters: FilterState;
  setFilters: (f: Partial<FilterState>) => void;
  clearFilters: () => void;
  selectMeeting: (id: string) => void;
  updateResolution: (proposalId: string, resolution: Proposal["resolution"], note: string) => void;
  focusedProposalId: string | null;
  setFocusedProposalId: (id: string | null) => void;
  getMeetingProposals: (meetingId: string) => Proposal[];
  searchMeetings: (query: string) => Meeting[];
}

const DEFAULT_FILTERS: FilterState = {
  divisions: [],
  categories: [],
  resolutions: [],
  irg_grades: [],
  cib_statuses: [],
  action_owners: [],
  search_query: "",
  sort_by: "default",
};

const MeetingContext = createContext<MeetingContextValue | null>(null);

const RESOLUTIONS_KEY = "cec_resolutions";

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [meetings] = useState<Meeting[]>(DEMO_MEETINGS);
  const [currentMeetingId, setCurrentMeetingId] = useState<string>("mtg_001");
  const [allProposals, setAllProposals] = useState<Proposal[]>([
    ...DEMO_PROPOSALS,
    ...LIVE_PROPOSALS,
  ]);
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [focusedProposalId, setFocusedProposalId] = useState<string | null>(null);

  // Load saved resolutions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RESOLUTIONS_KEY);
      if (saved) {
        const resMap: Record<string, { resolution: Proposal["resolution"]; note: string; ts: string }> =
          JSON.parse(saved);
        setAllProposals((prev) =>
          prev.map((p) => {
            const r = resMap[p.id];
            if (r) {
              return {
                ...p,
                resolution: r.resolution,
                resolution_note: r.note,
                resolution_timestamp: r.ts,
              };
            }
            return p;
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const currentMeeting = meetings.find((m) => m.id === currentMeetingId) ?? null;

  const proposals = allProposals.filter((p) => p.meeting_id === currentMeetingId);

  const filteredProposals = React.useMemo(() => {
    let result = [...proposals];

    if (filters.divisions.length > 0) {
      result = result.filter((p) => filters.divisions.includes(p.division));
    }
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }
    if (filters.resolutions.length > 0) {
      result = result.filter((p) => filters.resolutions.includes(p.resolution));
    }
    if (filters.irg_grades.length > 0) {
      result = result.filter((p) => p.irg_grade && filters.irg_grades.includes(p.irg_grade));
    }
    if (filters.cib_statuses.length > 0) {
      result = result.filter((p) => p.cib_status && filters.cib_statuses.includes(p.cib_status));
    }
    if (filters.action_owners.length > 0) {
      result = result.filter((p) =>
        p.action_owners.some((ao) => filters.action_owners.includes(ao.name))
      );
    }
    if (filters.exposure_min !== undefined) {
      result = result.filter(
        (p) => (p.cumulative_exposure ?? p.current_outstanding ?? 0) >= filters.exposure_min!
      );
    }
    if (filters.exposure_max !== undefined) {
      result = result.filter(
        (p) => (p.cumulative_exposure ?? p.current_outstanding ?? 0) <= filters.exposure_max!
      );
    }
    if (filters.search_query) {
      const q = filters.search_query.toLowerCase();
      result = result.filter(
        (p) =>
          p.client_name.toLowerCase().includes(q) ||
          p.proposal_code.toLowerCase().includes(q) ||
          (p.group_name?.toLowerCase().includes(q) ?? false) ||
          (p.ag_code?.toLowerCase().includes(q) ?? false) ||
          p.title.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (filters.sort_by) {
      case "exposure_high":
        result.sort(
          (a, b) =>
            (b.cumulative_exposure ?? b.current_outstanding ?? 0) -
            (a.cumulative_exposure ?? a.current_outstanding ?? 0)
        );
        break;
      case "exposure_low":
        result.sort(
          (a, b) =>
            (a.cumulative_exposure ?? a.current_outstanding ?? 0) -
            (b.cumulative_exposure ?? b.current_outstanding ?? 0)
        );
        break;
      case "waiver_high":
        result.sort((a, b) => (b.waiver_amount ?? 0) - (a.waiver_amount ?? 0));
        break;
      case "irg_risky":
        result.sort((a, b) => {
          const aNum = a.irg_grade ? parseInt(a.irg_grade.split(" ")[1]) : 0;
          const bNum = b.irg_grade ? parseInt(b.irg_grade.split(" ")[1]) : 0;
          return bNum - aNum;
        });
        break;
      case "irg_safe":
        result.sort((a, b) => {
          const aNum = a.irg_grade ? parseInt(a.irg_grade.split(" ")[1]) : 99;
          const bNum = b.irg_grade ? parseInt(b.irg_grade.split(" ")[1]) : 99;
          return aNum - bNum;
        });
        break;
      default:
        result.sort((a, b) => a.serial_number - b.serial_number);
    }

    return result;
  }, [proposals, filters]);

  const setFilters = useCallback((update: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...update }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const selectMeeting = useCallback((id: string) => {
    setCurrentMeetingId(id);
    setFiltersState(DEFAULT_FILTERS);
    setFocusedProposalId(null);
  }, []);

  const updateResolution = useCallback(
    (proposalId: string, resolution: Proposal["resolution"], note: string) => {
      const ts = new Date().toISOString();
      setAllProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, resolution, resolution_note: note, resolution_timestamp: ts }
            : p
        )
      );
      // Persist
      try {
        const saved = localStorage.getItem(RESOLUTIONS_KEY);
        const resMap = saved ? JSON.parse(saved) : {};
        resMap[proposalId] = { resolution, note, ts };
        localStorage.setItem(RESOLUTIONS_KEY, JSON.stringify(resMap));
      } catch {
        // ignore
      }
    },
    []
  );

  const getMeetingProposals = useCallback(
    (meetingId: string) => allProposals.filter((p) => p.meeting_id === meetingId),
    [allProposals]
  );

  const searchMeetings = useCallback(
    (query: string) => {
      if (!query.trim()) return meetings;
      const q = query.toLowerCase();
      return meetings.filter(
        (m) =>
          m.meeting_code.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.date.includes(q)
      );
    },
    [meetings]
  );

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        currentMeeting,
        proposals,
        filteredProposals,
        filters,
        setFilters,
        clearFilters,
        selectMeeting,
        updateResolution,
        focusedProposalId,
        setFocusedProposalId,
        getMeetingProposals,
        searchMeetings,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useMeeting must be used within MeetingProvider");
  return ctx;
}
