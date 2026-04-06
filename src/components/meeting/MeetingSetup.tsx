"use client";

import { useState } from "react";
import { X, Upload, FolderOpen, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

type Step = "input" | "parsing" | "preview" | "done";

export default function MeetingSetup({ onClose }: Props) {
  const [step, setStep] = useState<Step>("input");
  const [folderPath, setFolderPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleParse = async () => {
    if (!folderPath && !file) {
      toast.error("Please enter a folder path or upload a PDF.");
      return;
    }
    setStep("parsing");
    // Simulate parsing progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 120));
      setProgress(i);
    }
    setStep("preview");
  };

  const handlePublish = () => {
    setStep("done");
    toast.success("Meeting session published successfully!");
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-panel overflow-hidden animate-fade-in">
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
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">
                  Network Folder Path
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FolderOpen
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
                    />
                    <input
                      type="text"
                      value={folderPath}
                      onChange={(e) => setFolderPath(e.target.value)}
                      placeholder="\\IDLC-SERVER\CEC\2025-10-15\"
                      className="w-full pl-9 pr-3 py-2.5 border border-dashed border-border rounded text-sm font-mono text-ink focus:outline-none focus:border-red transition-colors placeholder:text-ink-subtle"
                    />
                  </div>
                </div>
                <p className="text-xs text-ink-subtle mt-1.5 font-mono">
                  e.g., \\IDLC-SERVER\CEC\2025-10-15\
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-mono text-ink-subtle">or upload directly</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">
                  Upload CEC PDF
                </label>
                <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed border-border rounded-lg hover:border-red-mid hover:bg-red-light transition-all cursor-pointer">
                  <Upload size={24} className="text-ink-subtle" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-ink">{file ? file.name : "Click or drag & drop"}</p>
                    <p className="text-xs text-ink-muted mt-0.5">PDF files only · Max 50MB</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <button
                onClick={handleParse}
                className="w-full bg-red hover:bg-red-dark text-white py-3 rounded font-medium transition-colors"
              >
                Parse & Load
              </button>
            </div>
          )}

          {step === "parsing" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-red animate-spin" />
              <div className="text-center">
                <p className="font-medium text-ink-black mb-1">Parsing PDF…</p>
                <p className="text-sm text-ink-muted">Extracting proposals and classifying by division</p>
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
              <div className="bg-border-soft rounded-lg p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle mb-3">
                  Parsed Summary
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Proposals", value: "23" },
                    { label: "Corporate", value: "5" },
                    { label: "SME Banking", value: "13" },
                    { label: "Consumer Asset", value: "5" },
                    { label: "Disbursements", value: "10" },
                    { label: "Settlements", value: "8" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white border border-border rounded p-2.5">
                      <div className="text-lg font-bold font-serif text-ink-black">{item.value}</div>
                      <div className="text-xs text-ink-muted">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-sme-light border border-sme-border rounded p-3">
                <p className="text-xs text-sme font-medium">
                  ✓ PDF parsed successfully. Review proposals in the dashboard after publishing.
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
                All participants can now access the session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
