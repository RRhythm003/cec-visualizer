"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      toast.success("Welcome to CEC Visualizer");
      router.replace("/dashboard");
    } else {
      setError(result.error ?? "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-ink-black border-r border-white/[0.07] p-14 flex-shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded bg-red flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">CEC</span>
            </div>
            <span className="text-white/70 text-sm font-medium">IDLC Finance PLC</span>
          </div>
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-5">
            Credit Evaluation Committee
          </p>
          <h1 className="font-display text-5xl text-white leading-[1.1] mb-6">
            Meeting{" "}
            <em className="text-red not-italic">Visualizer</em>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Transform CEC proposal reviews from linear PDF reading into a fast,
            filterable, division-first interactive dashboard.
          </p>
        </div>
        <div className="space-y-3">
          <div className="text-white/20 text-xs font-mono uppercase tracking-widest mb-4">Key Metrics</div>
          {[
            { label: "Pre-read completion target", value: "80%", sub: "↑ from 40%" },
            { label: "Time to locate proposal",    value: "<15s", sub: "vs. 3-4 min PDF" },
            { label: "Meetings per year",           value: "52×",  sub: "~25 proposals each" },
          ].map((m) => (
            <div key={m.label} className="flex items-baseline justify-between border-b border-white/[0.06] pb-2">
              <span className="text-white/40 text-xs">{m.label}</span>
              <div className="text-right">
                <span className="text-white font-mono text-sm font-medium">{m.value}</span>
                <span className="text-white/30 text-xs ml-2">{m.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded bg-red flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">CEC</span>
            </div>
            <span className="text-ink-muted text-sm">CEC Visualizer · IDLC Finance PLC</span>
          </div>

          <h2 className="font-display text-3xl text-ink-black mb-1">Sign in</h2>
          <p className="text-ink-muted text-sm mb-6">
            Use your IDLC email and 6-digit Employee CIF to access CEC Visualizer.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-corporate-light border border-corporate-border rounded p-3 text-xs text-corporate leading-relaxed">
              <strong>IDLC Staff:</strong> Enter your <code className="font-mono bg-corporate-light px-1">@idlc.com</code> email
              and your 6-digit Employee CIF as password.
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                IDLC Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@idlc.com"
                required
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                Employee CIF (6 digits)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. 572623"
                maxLength={6}
                pattern="\d{6}"
                required
                className="input-base w-full font-mono tracking-widest"
              />
            </div>
            {error && (
              <p className="text-red text-sm bg-red-light border border-red-mid rounded px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red hover:bg-red-dark text-white font-medium py-3 rounded transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in with IDLC"}
            </button>
            <p className="text-xs text-center text-ink-subtle">
              Registered IDLC staff only · Contact CEC admin to get access
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
