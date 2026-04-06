import { User } from "@/types";

// ── Demo accounts (UAT) ──────────────────────────────────────────────────────
export const DEMO_USERS: User[] = [
  {
    id: "usr_admin_001",
    name: "Nafisa Rahman",
    email: "admin@cec-visualizer.com",
    role: "admin",
    avatar_initials: "NR",
    last_login: new Date().toISOString(),
  },
  {
    id: "usr_approver_001",
    name: "Arif Hossain",
    email: "approver@cec-visualizer.com",
    role: "approver",
    avatar_initials: "AH",
    last_login: new Date().toISOString(),
  },
  {
    id: "usr_proposer_001",
    name: "Sabbir Ahmed",
    email: "proposer@cec-visualizer.com",
    role: "proposer",
    division_scope: ["SME Banking"],
    avatar_initials: "SA",
    last_login: new Date().toISOString(),
  },
];

export const DEMO_CREDENTIALS = [
  {
    email: "admin@cec-visualizer.com",
    password: "Admin@CEC2025",
    role: "admin" as const,
    label: "Admin — CEC Secretary",
    color: "#E8202A",
  },
  {
    email: "approver@cec-visualizer.com",
    password: "Approver@CEC2025",
    role: "approver" as const,
    label: "Approver — CEC Member",
    color: "#1D4ED8",
  },
  {
    email: "proposer@cec-visualizer.com",
    password: "Proposer@CEC2025",
    role: "proposer" as const,
    label: "Proposer — Relationship Manager",
    color: "#15803D",
  },
];

// ── IDLC registered users (CIF-based login) ──────────────────────────────────
// When HR database is synced, all CEC participants are added here.
// CIF = 6-digit employee ID used as password.
export const IDLC_REGISTERED_USERS: Array<User & { cif: string }> = [
  {
    id: "usr_idlc_rezaul",
    name: "Rezaul Haque",
    email: "rezaulh@idlc.com",
    role: "admin",
    avatar_initials: "RH",
    cif: "572623",
    last_login: new Date().toISOString(),
  },
  // Add more registered IDLC users here as HR database is synced:
  // { id, name, email, role, avatar_initials, cif }
];

/**
 * Validate an IDLC login.
 * - Email must end with @idlc.com
 * - Password must be a 6-digit numeric CIF
 * - If user is in IDLC_REGISTERED_USERS → return their profile
 * - Otherwise → return a generic Proposer session (pending HR sync)
 */
export function validateIDLCLogin(email: string, password: string): User | null {
  if (!email.toLowerCase().endsWith("@idlc.com")) return null;
  if (!/^\d{6}$/.test(password)) return null;

  // Check registered list first
  const registered = IDLC_REGISTERED_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.cif === password
  );
  if (registered) {
    const { cif: _, ...user } = registered;
    return { ...user, last_login: new Date().toISOString() };
  }

  // Generic IDLC session — pending HR sync
  // Any @idlc.com email with any 6-digit CIF gets a proposer session
  const namePart = email.split("@")[0];
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  return {
    id: `usr_idlc_${namePart}`,
    name: displayName,
    email: email.toLowerCase(),
    role: "proposer",
    avatar_initials: displayName.slice(0, 2).toUpperCase(),
    last_login: new Date().toISOString(),
  };
}
