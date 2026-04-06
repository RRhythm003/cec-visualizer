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
} from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProposalCardProps {
  proposal: Proposal;
  onSelect: (p: Proposal) => void;
  isFocused?: boolean;
}

export default function ProposalCard({ proposal: p, onSelect, isFocused }: ProposalCardProps) {
  const { isProposer, user } = useAuth();

  // Proposer: only show own proposals
  if (isProposer) {
    const isOwn = p.action_owners.some(
      (ao) => user?.name && ao.name.toLowerCase().includes(user.name.split(" ")[0].toLowerCase())
    );
    // Still show but dim non-own
    if (!isOwn) return null;
  }

  const isPending = p.resolution === "Pending";

  return (
    <button
      onClick={() => onSelect(p)}
      className={cn(
        "w-full text-left group relative",
        "bg-white border rounded-lg transition-all duration-150",
        isFocused
          ? "border-red shadow-card-hover ring-2 ring-red/20"
          : "border-border hover:border-red-mid hover:shadow-card-hover",
        isPending && "border-dashed"
      )}
    >
      {/* LIVE indicator */}
      {isFocused && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-red rounded-t-lg" />
      )}

      <div className="px-4 py-3.5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Serial + code */}
          <div className="flex-shrink-0 w-7 h-7 rounded bg-border-soft flex items-center justify-center">
            <span className="text-[11px] font-mono text-ink-muted font-bold">
              {p.serial_number}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono text-ink-subtle">{p.proposal_code}</span>
              {p.ag_code && (
                <span className="text-[10px] font-mono text-ink-subtle/60">· {p.ag_code}</span>
              )}
            </div>
            <div className="text-sm font-semibold text-ink-black leading-snug group-hover:text-red transition-colors line-clamp-2">
              {p.client_name}
            </div>
            {p.group_name && (
              <div className="text-xs text-ink-muted mt-0.5">{p.group_name}</div>
            )}
          </div>

          {/* Resolution badge */}
          <div className={cn("tag flex-shrink-0", getResolutionColor(p.resolution))}>
            <span className={cn("status-dot", getResolutionDot(p.resolution))} />
            {p.resolution}
          </div>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={cn("tag text-[10px]", getDivisionColor(p.division))}>{p.division}</span>
          <span className={cn("tag text-[10px]", getCategoryColor(p.category))}>
            <span>{getCategoryIcon(p.category)}</span>
            {p.category}
          </span>
          {p.facility_type && (
            <span className="tag text-[10px] bg-border-soft text-ink-muted border border-border">
              {p.facility_type}
            </span>
          )}
        </div>

        {/* Key metrics grid — by category */}
        <MetricsGrid proposal={p} />

        {/* Resolution note */}
        {p.resolution_note && !isPending && (
          <div className="mt-2.5 text-xs text-ink-muted bg-border-soft rounded px-2.5 py-1.5 line-clamp-2 border-l-2 border-border">
            {p.resolution_note}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-soft">
          <div className="flex items-center gap-1.5">
            <User size={10} className="text-ink-subtle" />
            <span className="text-[11px] text-ink-muted truncate max-w-[180px]">
              {p.action_owners.map((ao) => ao.name).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {p.action_deadline && (
              <div className="flex items-center gap-1 text-[11px] text-ink-muted font-mono">
                <Clock size={10} />
                {formatDate(p.action_deadline)}
              </div>
            )}
            <ChevronRight
              size={14}
              className="text-ink-subtle group-hover:text-red group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </div>
      </div>
    </button>
  );
}

function MetricsGrid({ proposal: p }: { proposal: Proposal }) {
  // Different metric display per category
  if (p.category === "Disbursement" || p.category === "Pricing Change" || p.category === "Security Change" || p.category === "NOC") {
    return (
      <div className="grid grid-cols-4 gap-2">
        <Metric label="Existing Exp." value={formatCrore(p.existing_exposure)} />
        <Metric label="Proposed" value={formatCrore(p.proposed_amount)} highlight />
        <Metric label="Cumulative" value={formatCrore(p.cumulative_exposure)} />
        <Metric
          label="IRG Grade"
          value={p.irg_grade ?? "—"}
          badge
          badgeClass={getIRGColor(p.irg_grade)}
        />
        {p.interest_rate !== undefined && <Metric label="Rate" value={formatPercent(p.interest_rate)} />}
        {p.tenor && <Metric label="Tenor" value={p.tenor} />}
        {p.dscr !== undefined && <Metric label="DSCR" value={`${p.dscr}x`} />}
        {p.cib_status && (
          <Metric label="CIB" value={p.cib_status} badge badgeClass={getCIBColor(p.cib_status)} />
        )}
      </div>
    );
  }

  if (p.category === "Settlement") {
    return (
      <div className="grid grid-cols-4 gap-2">
        <Metric label="Disbursed" value={formatCrore(p.disbursed_amount)} />
        <Metric label="Outstanding" value={formatCrore(p.current_outstanding)} />
        <Metric label="Settlement" value={formatCrore(p.settlement_amount)} highlight />
        <Metric label="Waiver" value={formatCrore(p.waiver_amount)} />
        {p.months_of_default !== undefined && <Metric label="MOD" value={`${p.months_of_default}m`} />}
        {p.cib_status && (
          <Metric label="CIB" value={p.cib_status} badge badgeClass={getCIBColor(p.cib_status)} />
        )}
        {p.irg_grade && (
          <Metric label="IRG" value={p.irg_grade} badge badgeClass={getIRGColor(p.irg_grade)} />
        )}
        {p.provision_released !== undefined && (
          <Metric label="Provision Released" value={formatCrore(p.provision_released)} />
        )}
      </div>
    );
  }

  if (p.category === "Call-Up") {
    return (
      <div className="grid grid-cols-4 gap-2">
        <Metric label="Disbursed" value={formatCrore(p.disbursed_amount)} />
        <Metric label="Outstanding" value={formatCrore(p.current_outstanding)} highlight />
        <Metric label="Overdue" value={formatCrore(p.overdue_amount)} />
        <Metric label="MOD" value={p.months_of_default ? `${p.months_of_default}m` : "—"} />
        {p.cib_status && (
          <Metric label="CIB" value={p.cib_status} badge badgeClass={getCIBColor(p.cib_status)} />
        )}
        {p.security_value && <Metric label="Security" value={formatCrore(p.security_value)} />}
      </div>
    );
  }

  if (p.category === "Write-Off") {
    return (
      <div className="grid grid-cols-4 gap-2">
        <Metric label="Outstanding" value={formatCrore(p.current_outstanding)} />
        <Metric label="Write-Off" value={formatCrore(p.write_off_amount)} highlight />
        <Metric label="MOD" value={p.months_of_default ? `${p.months_of_default}m` : "—"} />
        {p.cib_status && (
          <Metric label="CIB" value={p.cib_status} badge badgeClass={getCIBColor(p.cib_status)} />
        )}
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="grid grid-cols-4 gap-2">
      {p.existing_exposure !== undefined && (
        <Metric label="Existing Exp." value={formatCrore(p.existing_exposure)} />
      )}
      {p.cumulative_exposure !== undefined && (
        <Metric label="Cumulative" value={formatCrore(p.cumulative_exposure)} />
      )}
      {p.irg_grade && (
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
}: {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: boolean;
  badgeClass?: string;
}) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">{label}</div>
      {badge ? (
        <span className={cn("tag text-[10px] px-1.5 py-0", badgeClass)}>{value}</span>
      ) : (
        <div className={cn("text-xs font-mono font-medium", highlight ? "text-ink-black" : "text-ink-muted")}>
          {value}
        </div>
      )}
    </div>
  );
}
