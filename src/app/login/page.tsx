"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DEMO_CREDENTIALS } from "@/lib/data/demo-users";
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

  const quickLogin = async (cred: (typeof DEMO_CREDENTIALS)[0]) => {
    setLoading(true);
    setError("");
    const result = await login(cred.email, cred.password);
    if (result.success) {
      toast.success(`Signed in as ${cred.label}`);
      router.replace("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink-black flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-ink-black border-r border-white/[0.07] p-14">
        <div>
          <div className="inline-flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded bg-red flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">CEC</span>
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
          <div className="text-white/20 text-xs font-mono uppercase tracking-widest mb-4">
            Key Metrics
          </div>
          {[
            { label: "Pre-read completion", value: "80%", sub: "Target (↑ from 40%)" },
            { label: "Time to locate proposal", value: "<15s", sub: "vs. 3–4 min in PDF" },
            { label: "Meetings per year", value: "52×", sub: "~25 proposals each" },
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
      <div className="flex-1 flex items-center justify-center p-8 bg-bg">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded bg-red flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">CEC</span>
            </div>
            <span className="text-ink-muted text-sm font-medium">CEC Visualizer · IDLC Finance PLC</span>
          </div>

          <h2 className="font-display text-3xl text-ink-black mb-1">Sign in</h2>
          <p className="text-ink-muted text-sm mb-8">
            Use your IDLC credentials or a demo account below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@idlc.com"
                required
                className="w-full border border-border rounded-sm px-4 py-3 text-sm bg-white text-ink-black placeholder:text-ink-subtle focus:outline-none focus:border-red transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-border rounded-sm px-4 py-3 text-sm bg-white text-ink-black placeholder:text-ink-subtle focus:outline-none focus:border-red transition-colors"
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
              className="w-full bg-red hover:bg-red-dark text-white font-medium py-3 rounded-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-mono text-ink-subtle uppercase tracking-widest">
                Demo Accounts — UAT
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => quickLogin(cred)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3.5 rounded-sm border border-border bg-white hover:bg-border-soft hover:border-red-mid transition-all text-left group disabled:opacity-60"
                >
                  <div
                    className="w-8 h-8 rounded-sm flex items-center justify-center text-white text-xs font-bold font-mono flex-shrink-0"
                    style={{ background: cred.color }}
                  >
                    {cred.role === "admin" ? "A" : cred.role === "approver" ? "AP" : "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-black truncate">{cred.label}</div>
                    <div className="text-xs text-ink-muted font-mono truncate">{cred.email}</div>
                  </div>
                  <div className="text-xs font-mono text-ink-subtle group-hover:text-red transition-colors">
                    {cred.password}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
