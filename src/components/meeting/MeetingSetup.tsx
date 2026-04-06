"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, CheckCircle2, Calendar, FileText } from "lucide-react";
import { useMeeting } from "@/context/MeetingContext";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

type Step = "input" | "parsing" | "preview" | "done";

export default function MeetingSetup({ onClose }: Props) {
  const { createMeeting, meetings } = useMeeting();
  const [step, setStep] = useState<Step>("input");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate meeting name + code based on today
  const today = new Date();
  const defaultDate = today.toISOString().slice(0, 10);
  const maxSeq = meetings.reduce((max, m) => {
    const match = m.meeting_code.match(/-(\d{4})$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 68);
  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const suggestedCode = `CEC${yy}${mm}${dd}-${nextSeq}`;
  const suggestedTitle = `CEC Meeting — ${today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`;

  const [meetingName, setMeetingName] = useState(suggestedTitle);
  const [meetingDate, setMeetingDate] = useState(defaultDate);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (dropped.type === "application/pdf") {
        setFile(dropped);
      } else {
        toast.error("Only PDF files are supported.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleParse = async () => {
    if (!file) {
      toast.error("Please upload a CEC PDF to continue.");
      return;
    }
    setStep("parsing");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 120));
      setProgress(i);
    }
    setStep("preview");
  };

  const handlePublish = () => {
    createMeeting(meetingName, meetingDate);
    setStep("done");
    toast.success(`Meeting "${suggestedCode}" published!`);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-lg shadow-panel overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-ink-black px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-0.5">
              Admin — New Meeting
            </p>
            <h2 className="text-white font-semibold">Set Up CEC Meeting Session</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === "input" && (
            <div className="space-y-4">
              {/* Meeting Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                  Meeting Name
                </label>
                <input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded text-sm text-ink bg-surface focus:outline-none focus:border-red transition-colors"
                />
                <p className="text-[11px] text-ink-subtle mt-1 font-mono">
                  Auto-code: {suggestedCode}
                </p>
              </div>

              {/* Meeting Date */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                  <Calendar size={11} className="inline mr-1" />
                  Meeting Date
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded text-sm text-ink bg-surface focus:outline-none focus:border-red transition-colors"
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                  Upload CEC PDF (optional)
                </label>
                <label
                  className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                    dragOver
                      ? "border-red bg-red-light"
                      : file
                      ? "border-sme bg-sme-light"
                      : "border-border hover:border-red-mid hover:bg-red-light"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {file ? (
                    <>
                      <FileText size={24} className="text-sme" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-sme">{file.name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {(file.size / 1024 / 1024).toFixed(1)} MB · Click to change
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className={dragOver ? "text-red" : "text-ink-subtle"} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-ink">
                          {dragOver ? "Drop PDF here" : "Click or drag & drop PDF"}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">PDF files only · Max 50MB</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFile(f);
                    }}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-1">
                {file ? (
                  <button
                    onClick={handleParse}
                    className="flex-1 bg-red hover:bg-red-dark text-white py-2.5 rounded font-medium transition-colors"
                  >
                    Parse PDF & Preview
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="flex-1 bg-red hover:bg-red-dark text-white py-2.5 rounded font-medium transition-colors"
                  >
                    Create Empty Meeting
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-border rounded text-sm text-ink-muted hover:border-red-mid transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "parsing" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-red animate-spin" />
              <div className="text-center">
                <p className="font-medium text-ink-black mb-1">Parsing PDF…</p>
                <p className="text-sm text-ink-muted">
                  Extracting proposals and classifying by division
                </p>
              </div>
              <div className="w-full bg-border-soft rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-red rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-ink-muted">{progress}% complete</p>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-surface-raised rounded-lg p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-1">
                  Meeting
                </p>
                <p className="text-sm font-semibold text-ink-black">{meetingName}</p>
                <p className="text-xs font-mono text-ink-muted mt-0.5">{suggestedCode} · {meetingDate}</p>
              </div>
              <div className="bg-surface-raised rounded-lg p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                  Parsed Summary
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total Proposals", value: "23" },
                    { label: "Corporate", value: "5" },
                    { label: "SME Banking", value: "13" },
                    { label: "Consumer Asset", value: "5" },
                    { label: "Disbursements", value: "10" },
                    { label: "Settlements", value: "8" },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface border border-border rounded p-2.5">
                      <div className="text-lg font-bold font-serif text-ink-black">{item.value}</div>
                      <div className="text-xs text-ink-muted">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-sme-light border border-sme-border rounded p-3">
                <p className="text-xs text-sme font-medium">
                  ✓ PDF parsed. Review proposals in the dashboard after publishing.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  className="flex-1 bg-red hover:bg-red-dark text-white py-2.5 rounded font-medium transition-colors"
                >
                  Publish Meeting
                </button>
                <button
                  onClick={() => setStep("input")}
                  className="px-4 py-2.5 border border-border rounded text-sm text-ink-muted hover:border-red-mid transition-colors"
                >
                  Re-parse
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 size={40} className="text-sme" />
              <p className="font-semibold text-ink-black">Meeting Published!</p>
              <p className="text-sm text-ink-muted">
                <span className="font-mono text-ink">{suggestedCode}</span> is now visible in Meetings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
