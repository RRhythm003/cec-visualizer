"use client";

import { useState, useRef } from "react";
import { Proposal, ResolutionStatus } from "@/types";
import {
  cn,
  formatCrore,
  formatPercent,
  formatDate,
  getResolutionColor,
  getResolutionDot,
  getDivisionColor,
  getCategoryColor,
  getCategoryIcon,
  getIRGColor,
  getCIBColor,
} from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMeeting } from "@/context/MeetingContext";
import {
  X,
  AlertCircle,
  Clock,
  User,
  Edit3,
  Save,
  Paperclip,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface DetailPanelProps {
  proposal: Proposal;
  onClose: () => void;
}

const RESOLUTIONS: ResolutionStatus[] = [
  "Approved",
  "Approved (Board)",
  "Deferred",
  "Declined",
  "Pending",
];

const DOCS_KEY = "cec_docs";

interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

function loadDocs(proposalId: string): UploadedDoc[] {
  try {
    const all: Record<string, UploadedDoc[]> = JSON.parse(
      localStorage.getItem(DOCS_KEY) ?? "{}"
    );
    return all[proposalId] ?? [];
  } catch {
    return [];
  }
}

function saveDocs(proposalId: string, docs: UploadedDoc[]) {
  try {
    const all: Record<string, UploadedDoc[]> = JSON.parse(
      localStorage.getItem(DOCS_KEY) ?? "{}"
    );
    all[proposalId] = docs;
    localStorage.setItem(DOCS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export default function DetailPanel({ proposal: p, onClose }: DetailPanelProps) {
  const { isAdmin } = useAuth();
  const { updateResolution } = useMeeting();
  const [editingResolution, setEditingResolution] = useState(false);
  const [draftResolution, setDraftResolution] = useState<ResolutionStatus>(p.resolution);
  const [draftNote, setDraftNote] = useState(p.resolution_note ?? "");
  const [saving, setSaving] = useState(false);
  const [docs, setDocs] = useState<UploadedDoc[]>(() => loadDocs(p.id));
  const [docDragOver, setDocDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveResolution = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    updateResolution(p.id, draftResolution, draftNote);
    setEditingResolution(false);
    setSaving(false);
    toast.success("Resolution saved");
  };

  const addDocFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newDocs: UploadedDoc[] = Array.from(files).map((f) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: f.name,
      size: f.size,
      uploadedAt: new Date().toISOString(),
    }));
    const updated = [...docs, ...newDocs];
    setDocs(updated);
    saveDocs(p.id, updated);
    toast.success(`${newDocs.length} document${newDocs.length > 1 ? "s" : ""} attached`);
  };

  const removeDoc = (id: string) => {
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    saveDocs(p.id, updated);
  };

  const handleDocDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDocDragOver(false);
    addDocFiles(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-ink-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-[560px] max-w-[95vw] h-full bg-surface overflow-y-auto shadow-panel animate-slide-in-right flex flex-col">
        {/* Dark header */}
        <div className="bg-ink-black px-6 pt-6 pb-5 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-white/40">{p.proposal_code}</span>
              {p.ag_code && (
                <span className="text-xs font-mono text-white/30">· {p.ag_code}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <h2 className="text-lg font-semibold text-white leading-snug mb-3">{p.client_name}</h2>
          {p.group_name && <p className="text-sm text-white/50 mb-3">{p.group_name}</p>}

          <div className="flex flex-wrap gap-2">
            <span className={cn("tag text-xs", getDivisionColor(p.division))}>{p.division}</span>
            <span className={cn("tag text-xs", getCategoryColor(p.category))}>
              {getCategoryIcon(p.category)} {p.category}
            </span>
            <span className={cn("tag text-xs", getResolutionColor(p.resolution))}>
              <span className={cn("status-dot", getResolutionDot(p.resolution))} />
              {p.resolution}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* CRM Remarks */}
          {(p.crm_remarks || p.negative_remarks) && (
            <div className="callout">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle size={12} className="text-red" />
                <span className="text-xs font-semibold text-red-dark">CRM Remarks</span>
              </div>
              {p.negative_remarks && (
                <p className="text-xs text-red-dark font-medium mb-1">{p.negative_remarks}</p>
              )}
              <p className="text-xs text-ink-muted">{p.crm_remarks}</p>
            </div>
          )}

          {/* Facility details */}
          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
              Facility Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <DataRow label="Existing Exposure" value={formatCrore(p.existing_exposure)} />
              <DataRow label="Proposed Amount" value={formatCrore(p.proposed_amount)} />
              <DataRow label="Cumulative Exposure" value={formatCrore(p.cumulative_exposure)} bold />
              <DataRow label="Interest Rate" value={formatPercent(p.interest_rate)} />
              <DataRow label="Tenor" value={p.tenor ?? "—"} />
              <DataRow label="Processing Fee" value={p.processing_fee ?? "—"} />
              {p.facility_type && <DataRow label="Facility Type" value={p.facility_type} />}
              {p.fdr_requirement && <DataRow label="FDR Requirement" value={p.fdr_requirement} />}
            </div>
          </section>

          {/* Settlement specific */}
          {p.category === "Settlement" && (
            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                Settlement Details
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <DataRow label="Disbursed Amount" value={formatCrore(p.disbursed_amount)} />
                <DataRow label="Current Outstanding" value={formatCrore(p.current_outstanding)} />
                <DataRow label="Settlement Amount" value={formatCrore(p.settlement_amount)} bold />
                <DataRow label="Waiver Amount" value={formatCrore(p.waiver_amount)} />
                <DataRow
                  label="Months of Default"
                  value={p.months_of_default ? `${p.months_of_default} months` : "—"}
                />
                {p.provision_released !== undefined && (
                  <DataRow label="Provision Released" value={formatCrore(p.provision_released)} bold />
                )}
              </div>
            </section>
          )}

          {/* Call-Up specific */}
          {p.category === "Call-Up" && (
            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                Call-Up Details
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <DataRow label="Disbursed" value={formatCrore(p.disbursed_amount)} />
                <DataRow label="Current Outstanding" value={formatCrore(p.current_outstanding)} bold />
                <DataRow label="Overdue Amount" value={formatCrore(p.overdue_amount)} />
                <DataRow
                  label="Months of Default"
                  value={p.months_of_default ? `${p.months_of_default}m` : "—"}
                />
                <DataRow label="Security Value" value={formatCrore(p.security_value)} />
              </div>
            </section>
          )}

          {/* Write-Off specific */}
          {p.category === "Write-Off" && p.category_data &&
            (() => {
              const cd = p.category_data as Record<string, string | undefined>;
              return (
                <section>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                    Write-Off Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <DataRow label="Write-Off Amount" value={formatCrore(p.write_off_amount)} bold />
                    <DataRow label="Board Meeting Ref" value={String(cd.board_meeting_ref ?? "—")} />
                    <DataRow label="ARAE Status" value={String(cd.arae_status ?? "—")} />
                    <DataRow label="Post-WO Payments" value={String(cd.post_wo_payments ?? "—")} />
                  </div>
                </section>
              );
            })()}

          {/* Pricing Change specific */}
          {p.category === "Pricing Change" && p.category_data &&
            (() => {
              const cd = p.category_data as Record<string, string | number | undefined>;
              return (
                <section>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                    Rate Change Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <DataRow label="Existing Rate" value={`${cd.existing_rate}%`} />
                    <DataRow label="Proposed Rate" value={`${cd.proposed_rate}%`} />
                    {cd.approved_rate && (
                      <DataRow label="Approved Rate" value={`${cd.approved_rate}%`} bold />
                    )}
                    <DataRow label="Effective Date" value={String(cd.effective_date ?? "—")} />
                    <DataRow label="IRR Impact" value={String(cd.irr_impact ?? "—")} />
                  </div>
                </section>
              );
            })()}

          {/* Security Change specific */}
          {p.category === "Security Change" && p.category_data &&
            (() => {
              const cd = p.category_data as Record<string, string | undefined>;
              return (
                <section>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                    Security Change Details
                  </h3>
                  <div className="space-y-2">
                    <DataRowFull label="Existing Security" value={String(cd.existing_security ?? "—")} />
                    <DataRowFull label="Proposed Change" value={String(cd.proposed_change ?? "—")} />
                    {cd.ltv_impact && (
                      <DataRowFull label="LTV Impact" value={String(cd.ltv_impact)} />
                    )}
                  </div>
                </section>
              );
            })()}

          {/* Risk Indicators */}
          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
              Risk Indicators
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {p.credit_rating && <DataRow label="Credit Rating" value={p.credit_rating} />}
              {p.irg_grade && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-1">
                    IRG Grade
                  </div>
                  <span className={cn("tag text-xs", getIRGColor(p.irg_grade))}>{p.irg_grade}</span>
                </div>
              )}
              {p.cib_status && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-1">
                    CIB Status
                  </div>
                  <span className={cn("tag text-xs", getCIBColor(p.cib_status))}>{p.cib_status}</span>
                </div>
              )}
              {p.dscr !== undefined && <DataRow label="DSCR" value={`${p.dscr}x`} />}
              {p.de_ratio !== undefined && <DataRow label="Group D:E Ratio" value={`${p.de_ratio}x`} />}
              {p.security_coverage !== undefined && (
                <DataRow label="Security Coverage" value={`${p.security_coverage}%`} />
              )}
              {p.es_risk && <DataRow label="E&S Risk" value={p.es_risk} />}
            </div>
          </section>

          {/* Security description */}
          {p.security_description && (
            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-2">
                Security Description
              </h3>
              <p className="text-sm text-ink bg-surface-raised rounded px-3 py-2 leading-relaxed">
                {p.security_description}
              </p>
            </section>
          )}

          {/* Supporting Documents */}
          <section className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle flex items-center gap-1.5">
                <Paperclip size={11} />
                Supporting Documents
                {docs.length > 0 && (
                  <span className="bg-border text-ink-muted rounded-full px-1.5 text-[9px]">
                    {docs.length}
                  </span>
                )}
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs text-ink-muted hover:text-red transition-colors"
              >
                <Upload size={11} /> Attach
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addDocFiles(e.target.files)}
              />
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDocDrop}
              onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
              onDragLeave={() => setDocDragOver(false)}
              className={cn(
                "rounded border-2 border-dashed transition-colors",
                docDragOver
                  ? "border-red bg-red-light"
                  : docs.length === 0
                  ? "border-border p-6 flex flex-col items-center gap-2 text-center"
                  : "border-transparent p-0"
              )}
            >
              {docs.length === 0 ? (
                <>
                  <Paperclip size={20} className={docDragOver ? "text-red" : "text-ink-subtle"} />
                  <p className="text-xs text-ink-muted">
                    {docDragOver ? "Drop files here" : "Drag & drop files, or click Attach"}
                  </p>
                </>
              ) : (
                <div className={cn("space-y-1.5", docDragOver && "p-3")}>
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2.5 p-2.5 bg-surface-raised rounded border border-border group"
                    >
                      <FileText size={14} className="text-ink-subtle flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-ink-black truncate">{doc.name}</div>
                        <div className="text-[10px] text-ink-subtle font-mono">
                          {(doc.size / 1024).toFixed(0)} KB ·{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                      <button
                        onClick={() => removeDoc(doc.id)}
                        className="text-ink-subtle hover:text-red transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {docDragOver && (
                    <div className="flex items-center gap-2 p-2.5 border-2 border-dashed border-red rounded text-xs text-red font-medium">
                      <Upload size={12} /> Drop to attach
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Resolution section */}
          <section className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle">
                Resolution
              </h3>
              {isAdmin && !editingResolution && (
                <button
                  onClick={() => setEditingResolution(true)}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-red transition-colors"
                >
                  <Edit3 size={11} /> Edit
                </button>
              )}
            </div>

            {editingResolution ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {RESOLUTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setDraftResolution(r)}
                      className={cn(
                        "px-2.5 py-2 rounded border text-xs font-medium transition-all",
                        draftResolution === r
                          ? cn(getResolutionColor(r), "font-semibold")
                          : "border-border text-ink-muted hover:border-red-mid"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Add resolution notes…"
                  rows={3}
                  className="w-full border border-border rounded px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:border-red transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveResolution}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red hover:bg-red-dark text-white text-sm rounded transition-colors disabled:opacity-60"
                  >
                    <Save size={13} /> {saving ? "Saving…" : "Save Resolution"}
                  </button>
                  <button
                    onClick={() => setEditingResolution(false)}
                    className="px-4 py-2 border border-border rounded text-sm text-ink-muted hover:border-red-mid transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 tag text-sm mb-2",
                    getResolutionColor(p.resolution)
                  )}
                >
                  <span className={cn("status-dot", getResolutionDot(p.resolution))} />
                  {p.resolution}
                </div>
                {p.resolution_note && (
                  <p className="text-sm text-ink bg-surface-raised rounded px-3 py-2 leading-relaxed mt-2">
                    {p.resolution_note}
                  </p>
                )}
                {p.resolution_timestamp && (
                  <p className="text-xs text-ink-subtle font-mono mt-1.5">
                    Recorded: {new Date(p.resolution_timestamp).toLocaleString("en-GB")}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Action Owners */}
          <section className="border-t border-border pt-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
              Action Owners
            </h3>
            <div className="space-y-2">
              {p.action_owners.map((ao, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-surface-raised flex items-center justify-center">
                    <User size={11} className="text-ink-muted" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-black">{ao.name}</div>
                    <div className="text-xs text-ink-muted">{ao.title}</div>
                  </div>
                </div>
              ))}
              {p.action_deadline && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-amber bg-amber-light border border-amber-border rounded px-2.5 py-1.5">
                  <Clock size={11} />
                  Deadline: {formatDate(p.action_deadline)}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
        {label}
      </div>
      <div className={cn("text-sm font-mono", bold ? "text-ink-black font-semibold" : "text-ink")}>
        {value}
      </div>
    </div>
  );
}

function DataRowFull({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-wider text-ink-subtle mb-0.5">
        {label}
      </div>
      <div className="text-sm text-ink">{value}</div>
    </div>
  );
}
