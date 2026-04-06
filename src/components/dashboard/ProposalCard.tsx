"use client";

import { Proposal } from "@/types";
import {
  cn,
  formatCrore,
  formatPercent,
  getResolutionColor,
  getResolutionDot,
  getDivisionColor,
  getCategoryColor,
  getCategoryIcon,
  getIRGColor,
  getCIBColor,
  formatDate,
} from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, User, Clock } from "lucide-react";

export type ViewMode = "grid" | "card" | "list" | "content";

interface ProposalCardProps {
  proposal: Proposal;
  onSelect: (p: Proposal) => void;
  isFocused?: boolean;
  viewMode?: ViewMode;
}

export default function ProposalCard({
  proposal: p,
  onSelect,
  isFocused,
  viewMode = "grid",
}: ProposalCardProps) {
  const { isProposer, user } = useAuth();

  if (isProposer) {
    const isOwn = p.action_owners.some(
      (ao) => user?.name && ao.name.toLowerCase().includes(user.name.split(" ")[0].toLowerCase())
    );
    if (!isOwn) return null;
  }

  if (viewMode === "list") return <ListRow p={p} onSelect={onSelect} isFocused={isFocused} />;
  if (viewMode === "content") return <ContentRow p={p} onSelect={onSelect} isFocused={isFocused} />;

  // Grid (compact) or Card (full)
  const isCompact = viewMode === "grid";
  const isPending = p.resolution === "Pending";

  return (
    <button
      onClick={() => onSelect(p)}
      className={cn(
        "w-full text-left group relative",
        "bg-surface border rounded-lg transition-all duration-150",
        isFocused
          ? "border-red shadow-card-hover ring-2 ring-red/20"
          : "border-border hover:border-red-mid hover:shadow-card-hover",
        isPending && "border-dashed"
      )}
    >
      {isFocused && <div className="absolute top-0 left-0 right-0 h-0.5 bg-red rounded-t-lg" />}

      <div className={isCompact ? "px-3 py-2.5" : "px-4 py-3.5"}>
        {/* Header row */}
        <div className={cn("flex items-start gap-2", isCompact ? "mb-2" : "mb-3")}>
          <div
            className={cn(
              "rounded bg-surface-raised flex items-center justify-center flex-shrink-0",
              isCompact ? "w-5 h-5" : "w-7 h-7"
            )}
          >
            <span className={cn("font-mono text-ink-muted font-bold", isCompact ? "text-[9px]" : "text-[11px]")}>
              {p.serial_number}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-mono text-ink-subtle truncate">{p.proposal_code}</span>
            </div>
            <div
              className={cn(
                "font-semibold text-ink-black leading-snug group-hover:text-red transition-colors",
                isCompact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
              )}
            >
              {p.client_name}
            </div>
            {!isCompact && p.group_name && (
              <div className="text-xs text-ink-muted mt-0.5">{p.group_name}</div>
            )}
          </div>

          <div className={cn("tag flex-shrink-0", getResolutionColor(p.resolution), isCompact && "text-[9px] px-1.5")}>
            <span className={cn("status-dot", getResolutionDot(p.resolution))} />
            {isCompact ? p.resolution.replace(" (Board)", "⚡") : p.resolution}
          </div>
        </div>

        {/* Tags */}
        <div className={cn("flex flex-wrap gap-1", isCompact ? "mb-2" : "mb-3")}>
          <span className={cn("tag", getDivisionColor(p.division), isCompact ? "text-[9px] px-1.5" : "text-[10px]")}>
            {p.division}
          </span>
          <span className={cn("tag", getCategoryColor(p.category), isCompact ? "text-[9px] px-1.5" : "text-[10px]")}>
            {isCompact ? "" : <span>{getCategoryIcon(p.category)}</span>}
            {p.category}
          </span>
        </div>

        {/* Metrics */}
        <MetricsGrid proposal={p} compact={isCompact} />

        {/* Footer */}
        <div
          className={cn(
            "flex items-center justify-between border-t border-border-soft",
            isCompact ? "mt-2 pt-1.5" : "mt-3 pt-2.5"
          )}
        >
          <div className="flex items-center gap-1">
            <User size={9} className="text-ink-subtle" />
            <span className={cn("text-ink-muted truncate", isCompact ? "text-[9px] max-w-[100px]" : "text-[11px] max-w-[160px]")}>
              {p.action_owners.map((ao) => ao.name.split(" ")[0]).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isCompact && p.action_deadline && (
              <div className="flex items-center gap-1 text-[11px] text-ink-muted font-mono">
                <Clock size={10} />
                {formatDate(p.action_deadline)}
              </div>
            )}
            <ChevronRight
              size={isCompact ? 12 : 14}
              className="text-ink-subtle group-hover:text-red group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </div>
      </div>
    </button>
  );
}

// ── List Row (minimal, 1 column) ────────────────────────────────────────────
function ListRow({
  p,
  onSelect,
  isFocused,
}: {
  p: Proposal;
  onSelect: (p: Proposal) => void;
  isFocused?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(p)}
      className={cn(
        "w-full text-left group flex items-center gap-3 px-4 py-2.5 border-b border-border-soft bg-surface hover:bg-surface-raised transition-colors",
        isFocused && "bg-red-light border-l-2 border-l-red"
      )}
    >
      <span className="text-[10px] font-mono text-ink-subtle w-5 text-right flex-shrink-0">
        {p.serial_number}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="min-w-0">
          <span className="text-sm font-medium text-ink-black group-hover:text-red transition-colors truncate block">
            {p.client_name}
          </span>
          <span className="text-[10px] font-mono text-ink-subtle">{p.proposal_code}</span>
        </div>
        <span className={cn("tag text-[9px] px-1.5 flex-shrink-0", getDivisionColor(p.division))}>
          {p.division}
        </span>
        <span className={cn("tag text-[9px] px-1.5 flex-shrink-0", getCategoryColor(p.category))}>
          {p.category}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-mono text-ink-muted">
          {formatCrore(p.cumulative_exposure ?? p.current_outstanding)}
        </span>
        <span className={cn("tag text-[9px] px-1.5", getResolutionColor(p.resolution))}>
          <span className={cn("status-dot", getResolutionDot(p.resolution))} />
          {p.resolution}
        </span>
        <ChevronRight size={12} className="text-ink-subtle group-hover:text-red transition-colors" />
      </div>
    </button>
  );
}

// ── Content Row (Windows Explorer Content view — all info in a wide row) ────
function ContentRow({
  p,
  onSelect,
  isFocused,
}: {
  p: Proposal;
  onSelect: (p: Proposal) => void;
  isFocused?: boolean;
}) {
  const primaryMetric =
    p.category === "Settlement" || p.category === "Write-Off"
      ? { label: "Outstanding", value: formatCrore(p.current_outstanding) }
      : p.category === "Call-Up"
      ? { label: "Outstanding", value: formatCrore(p.current_outstanding) }
      : { label: "Cumulative Exp.", value: formatCrore(p.cumulative_exposure) };

  const secondaryMetric =
    p.category === "Settlement"
      ? { label: "Settlement", value: formatCrore(p.settlement_amount) }
      : p.category === "Write-Off"
      ? { label: "Write-Off", value: formatCrore(p.write_off_amount) }
      : p.category === "Call-Up"
      ? { label: "Overdue", value: formatCrore(p.overdue_amount) }
      : { label: "Proposed", value: formatCrore(p.proposed_amount) };

  return (
    <button
      onClick={() => onSelect(p)}
      className={cn(
        "w-full text-left group flex items-stretch gap-0 border border-border rounded-lg mb-1.5 bg-surface overflow-hidden transition-all duration-150",
        isFocused
          ? "border-red shadow-card-hover ring-2 ring-red/20"
          : "hover:border-red-mid hover:shadow-card-hover"
      )}
    >
      {/* Serial number */}
      <div className="w-10 flex-shrink-0 bg-surface-raised flex items-center justify-center border-r border-border">
        <span className="text-[11px] font-mono text-ink-muted font-bold">{p.serial_number}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-4 py-3 flex items-center gap-4">
        {/* Identity */}
        <div className="w-56 flex-shrink-0 min-w-0">
          <div className="text-sm font-semibold text-ink-black group-hover:text-red transition-colors truncate leading-snug">
            {p.client_name}
          </div>
          {p.group_name && (
            <div className="text-xs text-ink-muted truncate mt-0.5">{p.group_name}</div>
          )}
          <div className="text-[10px] font-mono text-ink-subtle mt-0.5">{p.proposal_code}</div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <span className={cn("tag text-[9px] px-1.5", getDivisionColor(p.division))}>
            {p.division}
          </span>
          <span className={cn("tag text-[9px] px-1.5", getCategoryColor(p.category))}>
            {getCategoryIcon(p.category)} {p.category}
          </span>
        </div>

        {/* Key metrics */}
        <div className="flex gap-6 flex-shrink-0">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
              {primaryMetric.label}
            </div>
            <div className="text-xs font-mono font-medium text-ink-black">{primaryMetric.value}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
              {secondaryMetric.label}
            </div>
            <div className="text-xs font-mono font-semibold text-ink-black">{secondaryMetric.value}</div>
          </div>
          {p.interest_rate !== undefined && (
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
                Rate
              </div>
              <div className="text-xs font-mono text-ink">{formatPercent(p.interest_rate)}</div>
            </div>
          )}
          {p.irg_grade && (
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
                IRG
              </div>
              <span className={cn("tag text-[9px] px-1.5", getIRGColor(p.irg_grade))}>
                {p.irg_grade}
              </span>
            </div>
          )}
          {p.cib_status && (
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
                CIB
              </div>
              <span className={cn("tag text-[9px] px-1.5", getCIBColor(p.cib_status))}>
                {p.cib_status}
              </span>
            </div>
          )}
        </div>

        {/* Action owner */}
        <div className="min-w-0 hidden xl:block">
          <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
            Owner
          </div>
          <div className="text-xs text-ink-muted truncate max-w-[140px]">
            {p.action_owners.map((ao) => ao.name).join(", ")}
          </div>
        </div>
      </div>

      {/* Resolution + chevron */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 border-l border-border-soft">
        <span className={cn("tag text-[10px]", getResolutionColor(p.resolution))}>
          <span className={cn("status-dot", getResolutionDot(p.resolution))} />
          {p.resolution}
        </span>
        <ChevronRight
          size={13}
          className="text-ink-subtle group-hover:text-red group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}

// ── Metrics grid ─────────────────────────────────────────────────────────────
function MetricsGrid({ proposal: p, compact }: { proposal: Proposal; compact?: boolean }) {
  const cols = compact ? "grid-cols-3 gap-1.5" : "grid-cols-4 gap-2";

  if (p.category === "Settlement") {
    return (
      <div className={`grid ${cols}`}>
        <Metric label="Outstanding" value={formatCrore(p.current_outstanding)} compact={compact} />
        <Metric label="Settlement" value={formatCrore(p.settlement_amount)} highlight compact={compact} />
        <Metric label="Waiver" value={formatCrore(p.waiver_amount)} compact={compact} />
        {!compact && p.cib_status && (
          <Metric label="CIB" value={p.cib_status} badge badgeClass={getCIBColor(p.cib_status)} />
        )}
      </div>
    );
  }

  if (p.category === "Call-Up") {
    return (
      <div className={`grid ${cols}`}>
        <Metric label="Outstanding" value={formatCrore(p.current_outstanding)} highlight compact={compact} />
        <Metric label="Overdue" value={formatCrore(p.overdue_amount)} compact={compact} />
        <Metric label="MOD" value={p.months_of_default ? `${p.months_of_default}m` : "—"} compact={compact} />
        {!compact && p.cib_status && (
          <Metric label="CIB" value={p.cib_status} badge badgeClass={getCIBColor(p.cib_status)} />
        )}
      </div>
    );
  }

  if (p.category === "Write-Off") {
    return (
      <div className={`grid ${cols}`}>
        <Metric label="Outstanding" value={formatCrore(p.current_outstanding)} compact={compact} />
        <Metric label="Write-Off" value={formatCrore(p.write_off_amount)} highlight compact={compact} />
        <Metric label="MOD" value={p.months_of_default ? `${p.months_of_default}m` : "—"} compact={compact} />
      </div>
    );
  }

  // Disbursement / Pricing / Security / NOC / fallback
  return (
    <div className={`grid ${cols}`}>
      <Metric label="Existing Exp." value={formatCrore(p.existing_exposure)} compact={compact} />
      <Metric label="Proposed" value={formatCrore(p.proposed_amount)} highlight compact={compact} />
      <Metric label="Cumulative" value={formatCrore(p.cumulative_exposure)} compact={compact} />
      {!compact && p.irg_grade && (
        <Metric label="IRG" value={p.irg_grade} badge badgeClass={getIRGColor(p.irg_grade)} />
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
  badge,
  badgeClass,
  compact,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: boolean;
  badgeClass?: string;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">{label}</div>
      {badge ? (
        <span className={cn("tag text-[9px] px-1.5 py-0", badgeClass)}>{value}</span>
      ) : (
        <div
          className={cn(
            "font-mono font-medium",
            compact ? "text-[10px]" : "text-xs",
            highlight ? "text-ink-black" : "text-ink-muted"
          )}
        >
          {value}
        </div>
      )}
    </div>
  );
}
