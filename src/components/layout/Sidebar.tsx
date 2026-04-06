"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMeeting } from "@/context/MeetingContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Division, Category, ResolutionStatus } from "@/types";
import {
  LayoutDashboard,
  Calendar,
  Shield,
  Scale,
  ClipboardList,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const DIVISIONS: Division[] = ["Corporate", "SME Banking", "Consumer Asset"];
const CATEGORIES: Category[] = [
  "Disbursement",
  "Settlement",
  "Call-Up",
  "NOC",
  "Pricing Change",
  "Security Change",
  "Write-Off",
];

const DIV_COLORS: Record<Division, string> = {
  Corporate: "bg-corporate",
  "SME Banking": "bg-sme",
  "Consumer Asset": "bg-amber",
};

const CAT_ICONS: Record<Category, string> = {
  Disbursement: "💳",
  Settlement: "📝",
  "Call-Up": "📞",
  NOC: "📜",
  "Pricing Change": "🔁",
  "Security Change": "🔒",
  "Write-Off": "📂",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { proposals, filters, setFilters, clearFilters } = useMeeting();
  const [divExpanded, setDivExpanded] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);

  const toggleDivision = (div: Division) => {
    const current = filters.divisions;
    const next = current.includes(div)
      ? current.filter((d) => d !== div)
      : [...current, div];
    setFilters({ divisions: next });
  };

  const toggleCategory = (cat: Category) => {
    const current = filters.categories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setFilters({ categories: next });
  };

  const getDivCount = (div: Division) =>
    proposals.filter((p) => p.division === div).length;

  const getCatCount = (cat: Category) =>
    proposals.filter((p) => p.category === cat).length;

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "approver"
      ? "Approver"
      : "Proposer";

  const roleColor =
    user?.role === "admin"
      ? "text-red"
      : user?.role === "approver"
      ? "text-corporate"
      : "text-sme";

  return (
    <aside className="w-[220px] min-h-screen bg-white border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-red flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs font-mono">CEC</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-black leading-none">CEC Visualizer</div>
            <div className="text-[10px] text-ink-subtle mt-0.5 font-mono">IDLC Finance PLC</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="px-3 py-3 border-b border-border-soft space-y-0.5">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard size={14} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <NavItem
          href="/dashboard/meetings"
          icon={<Calendar size={14} />}
          label="Meetings"
          active={pathname === "/dashboard/meetings"}
        />
        {isAdmin && (
          <NavItem
            href="/dashboard/meeting/mtg_live"
            icon={
              <span className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-sme animate-pulse-dot" />
              </span>
            }
            label="Live Meeting"
            active={pathname.startsWith("/dashboard/meeting")}
            badge="LIVE"
          />
        )}
      </nav>

      {/* Filters — only on dashboard */}
      {pathname === "/dashboard" && (
        <div className="flex-1 sidebar-scroll px-3 py-3 space-y-4">
          {/* Divisions */}
          <div>
            <button
              onClick={() => setDivExpanded((v) => !v)}
              className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-widest text-ink-subtle hover:text-ink-muted mb-2"
            >
              Division
              {divExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </button>
            {divExpanded && (
              <div className="space-y-0.5">
                <button
                  onClick={clearFilters}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors",
                    filters.divisions.length === 0 && filters.categories.length === 0
                      ? "bg-red-light text-red-dark font-medium"
                      : "text-ink hover:bg-border-soft"
                  )}
                >
                  <span>All Divisions</span>
                  <span className="font-mono text-[11px] opacity-60">{proposals.length}</span>
                </button>
                {DIVISIONS.map((div) => {
                  const count = getDivCount(div);
                  if (count === 0) return null;
                  return (
                    <button
                      key={div}
                      onClick={() => toggleDivision(div)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors",
                        filters.divisions.includes(div)
                          ? "bg-red-light text-red-dark font-medium"
                          : "text-ink hover:bg-border-soft"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", DIV_COLORS[div])}
                        />
                        <span className="truncate">{div}</span>
                      </div>
                      <span className="font-mono text-[11px] opacity-60 ml-1">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <button
              onClick={() => setCatExpanded((v) => !v)}
              className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-widest text-ink-subtle hover:text-ink-muted mb-2"
            >
              Type
              {catExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </button>
            {catExpanded && (
              <div className="space-y-0.5">
                {CATEGORIES.map((cat) => {
                  const count = getCatCount(cat);
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors",
                        filters.categories.includes(cat)
                          ? "bg-red-light text-red-dark font-medium"
                          : "text-ink hover:bg-border-soft"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs">{CAT_ICONS[cat]}</span>
                        <span className="truncate">{cat}</span>
                      </div>
                      <span className="font-mono text-[11px] opacity-60 ml-1">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="px-4 py-3 border-t border-border-soft mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-ink-black flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold font-mono">{user?.avatar_initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-ink-black truncate">{user?.name}</div>
            <div className={cn("text-[10px] font-mono", roleColor)}>{roleLabel}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-ink-subtle hover:text-red transition-colors"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors",
        active ? "bg-red-light text-red-dark font-medium" : "text-ink hover:bg-border-soft"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-mono font-bold bg-sme text-white px-1.5 py-0.5 rounded-full tracking-wider">
          {badge}
        </span>
      )}
    </Link>
  );
}
