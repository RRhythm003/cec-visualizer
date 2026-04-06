import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ResolutionStatus, Division, Category, IRGGrade, CIBStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────

export function formatCrore(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  if (value >= 100) return `BDT ${value.toFixed(0)} Cr`;
  if (value >= 1) return `BDT ${value.toFixed(2)} Cr`;
  return `BDT ${(value * 100).toFixed(2)} L`;
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatPercent(value: number | undefined): string {
  if (value === undefined) return "—";
  return `${value.toFixed(2)}%`;
}

export function formatRatio(value: number | undefined): string {
  if (value === undefined) return "—";
  return `${value.toFixed(2)}x`;
}

// ─── COLOR / STYLE HELPERS ────────────────────────────────────────────────────

export function getResolutionColor(resolution: ResolutionStatus): string {
  switch (resolution) {
    case "Approved": return "bg-sme-light text-sme border border-sme-border";
    case "Approved (Board)": return "bg-board-light text-board border border-board-border";
    case "Deferred": return "bg-amber-light text-amber border border-amber-border";
    case "Declined": return "bg-red-light text-red-dark border border-red-mid";
    case "Pending": return "bg-border-soft text-ink-muted border border-border";
    default: return "bg-border-soft text-ink-muted border border-border";
  }
}

export function getResolutionDot(resolution: ResolutionStatus): string {
  switch (resolution) {
    case "Approved": return "bg-sme";
    case "Approved (Board)": return "bg-board";
    case "Deferred": return "bg-amber";
    case "Declined": return "bg-red";
    case "Pending": return "bg-ink-subtle";
    default: return "bg-ink-subtle";
  }
}

export function getDivisionColor(division: Division): string {
  switch (division) {
    case "Corporate": return "bg-corporate-light text-corporate border border-corporate-border";
    case "SME Banking": return "bg-sme-light text-sme border border-sme-border";
    case "Consumer Asset": return "bg-amber-light text-amber border border-amber-border";
    default: return "bg-border-soft text-ink-muted border border-border";
  }
}

export function getCategoryColor(category: Category): string {
  switch (category) {
    case "Disbursement": return "bg-corporate-light text-corporate border border-corporate-border";
    case "Settlement": return "bg-amber-light text-amber border border-amber-border";
    case "Call-Up": return "bg-red-light text-red-dark border border-red-mid";
    case "NOC": return "bg-sme-light text-sme border border-sme-border";
    case "Pricing Change": return "bg-board-light text-board border border-board-border";
    case "Security Change": return "bg-border text-ink-muted border border-border";
    case "Write-Off": return "bg-red-light text-red-dark border border-red-mid";
    default: return "bg-border-soft text-ink-muted border border-border";
  }
}

export function getCategoryIcon(category: Category): string {
  switch (category) {
    case "Disbursement": return "💳";
    case "Settlement": return "📝";
    case "Call-Up": return "📞";
    case "NOC": return "📜";
    case "Pricing Change": return "🔁";
    case "Security Change": return "🔒";
    case "Write-Off": return "📂";
    default: return "📋";
  }
}

export function getIRGColor(grade: IRGGrade | undefined): string {
  if (!grade) return "bg-border-soft text-ink-muted";
  const num = parseInt(grade.split(" ")[1]);
  if (num <= 2) return "bg-sme-light text-sme border border-sme-border";
  if (num === 3) return "bg-corporate-light text-corporate border border-corporate-border";
  if (num === 4) return "bg-amber-light text-amber border border-amber-border";
  if (num === 5) return "bg-amber-light text-amber border border-amber-border";
  return "bg-red-light text-red-dark border border-red-mid";
}

export function getCIBColor(status: CIBStatus | undefined): string {
  if (!status) return "bg-border-soft text-ink-muted";
  switch (status) {
    case "STD": return "bg-sme-light text-sme border border-sme-border";
    case "SMA": return "bg-amber-light text-amber border border-amber-border";
    case "SS": return "bg-red-light text-red-dark border border-red-mid";
    case "DF": return "bg-red-light text-red-dark border border-red-mid";
    case "BL": return "bg-ink-black text-white";
    case "Unclassified": return "bg-border-soft text-ink-muted";
    default: return "bg-border-soft text-ink-muted";
  }
}

// ─── FILTER HELPERS ───────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── ARCHIVE HELPERS ──────────────────────────────────────────────────────────

export function shouldAutoArchive(meetingDate: string, currentYear: number): boolean {
  const year = new Date(meetingDate).getFullYear();
  return year < currentYear;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}
