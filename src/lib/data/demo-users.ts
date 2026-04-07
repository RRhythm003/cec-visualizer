import { User } from "@/types";

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
