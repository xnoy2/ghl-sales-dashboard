import type {
  Lead, PipelineStage, TeamMember, ActivityItem,
  FollowUpAlert, DashboardStats,
} from "@/types";

// ─── Stats ────────────────────────────────────────────────────────────────────

export const mockStats: DashboardStats = {
  newLeadsToday:      8,
  contacted:         12,
  quoted:             5,
  followUps:          7,
  closedDeals:        3,
  totalPipelineValue: 142500,
  conversionRate:     24,
};

// ─── Leads ────────────────────────────────────────────────────────────────────

export const mockLeads: Lead[] = [
  { id: "l1",  name: "John Smith",    email: "john@example.com",    phone: "+1 555 0101", stage: "new",        assignedTo: "Luke",    value: 4500,  lastActivity: "2026-04-01T09:00:00Z", tags: ["web"],      daysInStage: 0 },
  { id: "l2",  name: "Lisa Brown",    email: "lisa@example.com",    phone: "+1 555 0102", stage: "new",        assignedTo: "Cameron", value: 2200,  lastActivity: "2026-04-01T10:30:00Z", tags: ["referral"], daysInStage: 0 },
  { id: "l3",  name: "Mark Johnson",  email: "mark@example.com",    phone: "+1 555 0103", stage: "contacted",  assignedTo: "Luke",    value: 7800,  lastActivity: "2026-03-31T14:00:00Z", tags: ["hot"],      daysInStage: 1 },
  { id: "l4",  name: "Emily Lee",     email: "emily@example.com",   phone: "+1 555 0104", stage: "contacted",  assignedTo: "Sarah",   value: 3300,  lastActivity: "2026-03-31T11:00:00Z", tags: [],           daysInStage: 1 },
  { id: "l5",  name: "Sarah Miles",   email: "smiles@example.com",  phone: "+1 555 0105", stage: "quoted",     assignedTo: "Luke",    value: 12000, lastActivity: "2026-03-30T16:00:00Z", tags: ["hot"],      daysInStage: 2 },
  { id: "l6",  name: "David Green",   email: "dgreen@example.com",  phone: "+1 555 0106", stage: "quoted",     assignedTo: "Cameron", value: 5500,  lastActivity: "2026-03-29T09:00:00Z", tags: [],           daysInStage: 3 },
  { id: "l7",  name: "Paul Carter",   email: "pcarter@example.com", phone: "+1 555 0107", stage: "follow_up",  assignedTo: "Sarah",   value: 9000,  lastActivity: "2026-03-28T13:00:00Z", tags: ["urgent"],   daysInStage: 4 },
  { id: "l8",  name: "Nina Clark",    email: "nclark@example.com",  phone: "+1 555 0108", stage: "follow_up",  assignedTo: "Luke",    value: 6700,  lastActivity: "2026-03-27T10:00:00Z", tags: ["urgent"],   daysInStage: 5 },
  { id: "l9",  name: "Mike Davies",   email: "mdavies@example.com", phone: "+1 555 0109", stage: "closed",     assignedTo: "Luke",    value: 18000, lastActivity: "2026-03-31T17:00:00Z", tags: ["won"],      daysInStage: 0 },
  { id: "l10", name: "Anna Scott",    email: "ascott@example.com",  phone: "+1 555 0110", stage: "closed",     assignedTo: "Cameron", value: 11000, lastActivity: "2026-04-01T08:00:00Z", tags: ["won"],      daysInStage: 0 },
];

// ─── Pipeline Stages ──────────────────────────────────────────────────────────

export const mockPipelineStages: PipelineStage[] = [
  { id: "new",       label: "New Leads",  color: "bg-blue-600",    textColor: "text-blue-600",   borderColor: "border-blue-500",   leads: mockLeads.filter(l => l.stage === "new") },
  { id: "contacted", label: "Contacted",  color: "bg-amber-500",   textColor: "text-amber-600",  borderColor: "border-amber-400",  leads: mockLeads.filter(l => l.stage === "contacted") },
  { id: "quoted",    label: "Quoted",     color: "bg-violet-600",  textColor: "text-violet-600", borderColor: "border-violet-500", leads: mockLeads.filter(l => l.stage === "quoted") },
  { id: "follow_up", label: "Follow-Up",  color: "bg-orange-500",  textColor: "text-orange-600", borderColor: "border-orange-400", leads: mockLeads.filter(l => l.stage === "follow_up") },
  { id: "closed",    label: "Closed",     color: "bg-emerald-600", textColor: "text-emerald-600",borderColor: "border-emerald-500",leads: mockLeads.filter(l => l.stage === "closed") },
];

// ─── Team ─────────────────────────────────────────────────────────────────────

export const mockTeam: TeamMember[] = [
  { id: "t1", name: "Luke",    initials: "LK", role: "admin", deals: 6, target: 10 },
  { id: "t2", name: "Cameron", initials: "CM", role: "agent", deals: 4, target: 10 },
  { id: "t3", name: "Sarah",   initials: "SH", role: "agent", deals: 3, target: 10 },
];

// ─── Activity ─────────────────────────────────────────────────────────────────

export const mockActivity: ActivityItem[] = [
  { id: "a1", type: "quoted",    leadName: "Sarah Miles",  actor: "Luke",    timestamp: "2026-04-01T14:00:00Z" },
  { id: "a2", type: "new_lead",  leadName: "James Taylor", actor: "System",  timestamp: "2026-04-01T11:00:00Z" },
  { id: "a3", type: "closed",    leadName: "Mike Davies",  actor: "Luke",    timestamp: "2026-03-31T17:00:00Z" },
  { id: "a4", type: "contacted", leadName: "Emily Lee",    actor: "Sarah",   timestamp: "2026-03-31T11:00:00Z" },
  { id: "a5", type: "note",      leadName: "Paul Carter",  actor: "Cameron", timestamp: "2026-03-30T09:30:00Z", note: "Left voicemail, will retry tomorrow" },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: FollowUpAlert[] = [
  { id: "al1", leadId: "l7", leadName: "Paul Carter", message: "3 days pending — no response", severity: "critical", daysOverdue: 3 },
  { id: "al2", leadId: "l8", leadName: "Nina Clark",  message: "Needs immediate follow-up",    severity: "warning",  daysOverdue: 2 },
  { id: "al3", leadId: "l6", leadName: "David Green", message: "Quote sent 3 days ago",        severity: "info",     daysOverdue: 1 },
];
