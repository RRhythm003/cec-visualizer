// ─── USER & AUTH TYPES ───────────────────────────────────────────────────────

export type UserRole = "admin" | "approver" | "proposer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  division_scope?: Division[]; // For proposers, limits to their divisions
  avatar_initials: string;
  last_login?: string;
}

// ─── MEETING TYPES ────────────────────────────────────────────────────────────

export type MeetingStatus = "draft" | "published" | "active" | "locked" | "archived";

export interface Meeting {
  id: string;
  meeting_code: string;        // e.g., CEC250921-0068
  title: string;               // e.g., "CEC Meeting — 21 September 2025"
  date: string;                // ISO date string
  pdf_path?: string;
  parsed_at?: string;
  status: MeetingStatus;
  admin_user_id: string;
  proposal_count: number;
  summary: MeetingSummary;
  archived_year?: number;      // Year it was auto-archived
  created_at: string;
  updated_at: string;
}

export interface MeetingSummary {
  total: number;
  approved: number;
  deferred: number;
  declined: number;
  board_pending: number;
  corporate: number;
  sme: number;
  consumer: number;
}

// ─── PROPOSAL TYPES ───────────────────────────────────────────────────────────

export type Division = "Corporate" | "SME Banking" | "Consumer Asset";
export type Category =
  | "Disbursement"
  | "Settlement"
  | "Call-Up"
  | "NOC"
  | "Pricing Change"
  | "Security Change"
  | "Write-Off";

export type ResolutionStatus =
  | "Approved"
  | "Approved (Board)"
  | "Deferred"
  | "Declined"
  | "Pending";

export type CIBStatus = "STD" | "SMA" | "SS" | "DF" | "BL" | "Unclassified";
export type IRGGrade = "IDLC 1" | "IDLC 2" | "IDLC 3" | "IDLC 4" | "IDLC 5" | "IDLC 6" | "IDLC 7";

export interface ActionOwner {
  name: string;
  title: string;
}

export interface Proposal {
  id: string;
  meeting_id: string;
  proposal_code: string;        // e.g., CEC250921-0068-1
  serial_number: number;        // 1, 2, 3...
  ag_code?: string;
  title: string;
  client_name: string;
  group_name?: string;
  division: Division;
  category: Category;
  facility_type?: string;       // STL, TL, CVL, RF, SCF

  // Exposure & Amounts
  existing_exposure?: number;   // BDT in crore
  proposed_amount?: number;
  cumulative_exposure?: number;
  disbursed_amount?: number;
  current_outstanding?: number;
  overdue_amount?: number;
  months_of_default?: number;
  settlement_amount?: number;
  waiver_amount?: number;
  net_receivable?: number;
  write_off_amount?: number;
  provision_released?: number;

  // Pricing & Terms
  interest_rate?: number;       // percentage
  tenor?: string;               // "36 months" or "3 years"
  processing_fee?: string;
  revised_irr?: number;

  // Risk Metrics
  credit_rating?: string;
  irg_grade?: IRGGrade;
  cib_status?: CIBStatus;
  dscr?: number;
  de_ratio?: number;
  ltv?: number;
  es_risk?: string;

  // Security
  security_description?: string;
  security_coverage?: number;
  security_value?: number;
  fdr_requirement?: string;

  // CRM & Remarks
  crm_remarks?: string;
  negative_remarks?: string;

  // Resolution
  resolution: ResolutionStatus;
  resolution_note?: string;
  resolution_timestamp?: string;
  resolution_by?: string;

  // Action & Accountability
  action_owners: ActionOwner[];
  action_deadline?: string;

  // Category-specific fields
  category_data?: Record<string, unknown>;

  // Metadata
  page_start?: number;
  page_end?: number;
  raw_text?: string;
  is_focused?: boolean;         // Used in live meeting for "currently being discussed"
  created_at: string;
  updated_at: string;
}

// ─── FILTER TYPES ─────────────────────────────────────────────────────────────

export interface FilterState {
  divisions: Division[];
  categories: Category[];
  resolutions: ResolutionStatus[];
  irg_grades: IRGGrade[];
  cib_statuses: CIBStatus[];
  action_owners: string[];
  search_query: string;
  exposure_min?: number;
  exposure_max?: number;
  sort_by: SortOption;
}

export type SortOption =
  | "default"
  | "exposure_high"
  | "exposure_low"
  | "waiver_high"
  | "irg_risky"
  | "irg_safe";

// ─── MEETING ROOM / REAL-TIME TYPES ─────────────────────────────────────────

export interface Participant {
  user_id: string;
  name: string;
  role: UserRole;
  avatar_initials: string;
  joined_at: string;
  is_online: boolean;
}

export interface MeetingRoomState {
  meeting_id: string;
  focused_proposal_id?: string;  // Which proposal is being discussed
  participants: Participant[];
  is_recording: boolean;
}

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────

export type AuditAction =
  | "login"
  | "logout"
  | "proposal_view"
  | "resolution_set"
  | "resolution_edit"
  | "meeting_publish"
  | "meeting_lock"
  | "pdf_upload"
  | "export";

export interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: AuditAction;
  meeting_id?: string;
  proposal_id?: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "resolution" | "meeting" | "action" | "system";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  link?: string;
}
