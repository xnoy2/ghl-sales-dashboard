// ─── Pipeline / Contacts ─────────────────────────────────────────────────────

export type StageId = "new" | "contacted" | "quoted" | "follow_up" | "closed";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: StageId;
  assignedTo: string;       // team member name
  value: number;            // deal value $
  lastActivity: string;     // ISO date string
  tags: string[];
  daysInStage: number;
}

export interface PipelineStage {
  id: StageId;
  label: string;
  color: string;             // tailwind bg class
  textColor: string;         // tailwind text class
  borderColor: string;
  leads: Lead[];
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: "admin" | "agent";
  deals: number;
  target: number;
  avatar?: string;
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export type ActivityType = "new_lead" | "contacted" | "quoted" | "closed" | "follow_up" | "note";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  leadName: string;
  actor: string;
  timestamp: string;         // ISO
  note?: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";

export interface FollowUpAlert {
  id: string;
  leadId: string;
  leadName: string;
  message: string;
  severity: AlertSeverity;
  daysOverdue: number;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  newLeadsToday: number;
  contacted: number;
  quoted: number;
  followUps: number;
  closedDeals: number;
  totalPipelineValue: number;
  conversionRate: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
}
