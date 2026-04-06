import { User } from "@/types";

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
