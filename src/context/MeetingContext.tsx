"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Meeting, Proposal, FilterState, SortOption } from "@/types";

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
  createMeeting: (name: string, date: string) => Meeting;
  toggleLock: (meetingId: string) => void;
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
const EXTRA_MEETINGS_KEY = "cec_extra_meetings";

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const extra = JSON.parse(localStorage.getItem(EXTRA_MEETINGS_KEY) ?? "[]") as Meeting[];
        return extra;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [currentMeetingId, setCurrentMeetingId] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        const extra = JSON.parse(localStorage.getItem(EXTRA_MEETINGS_KEY) ?? "[]") as Meeting[];
        return extra[0]?.id ?? "";
      }
    } catch {
      // ignore
    }
    return "";
  });
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
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

  const createMeeting = useCallback(
    (name: string, date: string): Meeting => {
      // Generate meeting code: CEC{YYMMDD}-{4-digit-seq}
      const d = new Date(date || new Date().toISOString().slice(0, 10));
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      const maxSeq = meetings.reduce((max, m) => {
        const match = m.meeting_code.match(/-(\d{4})$/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);

      const seq = String(maxSeq + 1).padStart(4, "0");
      const meeting_code = `CEC${yy}${mm}${dd}-${seq}`;

      const formattedDate = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const now = new Date().toISOString();
      const newMeeting: Meeting = {
        id: `mtg_${Date.now()}`,
        meeting_code,
        title: name.trim() || `CEC Meeting — ${formattedDate}`,
        date: date || now.slice(0, 10),
        status: "published",
        admin_user_id: "usr_admin_001",
        proposal_count: 0,
        summary: {
          total: 0,
          approved: 0,
          deferred: 0,
          declined: 0,
          board_pending: 0,
          corporate: 0,
          sme: 0,
          consumer: 0,
        },
        created_at: now,
        updated_at: now,
      };

      setMeetings((prev) => [newMeeting, ...prev]);

      try {
        const extra = JSON.parse(localStorage.getItem(EXTRA_MEETINGS_KEY) ?? "[]") as Meeting[];
        extra.unshift(newMeeting);
        localStorage.setItem(EXTRA_MEETINGS_KEY, JSON.stringify(extra));
      } catch {
        // ignore
      }

      return newMeeting;
    },
    [meetings]
  );

  const toggleLock = useCallback((meetingId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const newStatus = m.status === "locked" ? "published" : "locked";
        return { ...m, status: newStatus, updated_at: new Date().toISOString() };
      })
    );
  }, []);

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
        createMeeting,
        toggleLock,
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
