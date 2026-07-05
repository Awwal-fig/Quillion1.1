/** Lightweight localStorage-backed store for dashboard counters & saved drafts */

const COMPLETED_KEY = "lexdraft_completed_count";
const TEMPLATES_KEY = "lexdraft_templates_used";
const DRAFTS_KEY = "lexdraft_saved_drafts";
const RECENT_KEY = "lexdraft_recent_activities";
const USAGE_KEY = "lexdraft_template_usage";

// ── Counters ──────────────────────────────────────────────────────────

export function getCompletedCount(): number {
  return parseInt(localStorage.getItem(COMPLETED_KEY) || "0", 10);
}
export function incrementCompleted(): number {
  const n = getCompletedCount() + 1;
  localStorage.setItem(COMPLETED_KEY, String(n));
  window.dispatchEvent(new Event("lexdraft-counters"));
  return n;
}

export function getTemplatesUsedCount(): number {
  return parseInt(localStorage.getItem(TEMPLATES_KEY) || "0", 10);
}
export function incrementTemplatesUsed(): number {
  const n = getTemplatesUsedCount() + 1;
  localStorage.setItem(TEMPLATES_KEY, String(n));
  window.dispatchEvent(new Event("lexdraft-counters"));
  return n;
}

// ── Template Usage Tracking ───────────────────────────────────────────

export function getTemplateUsage(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || "{}");
  } catch { return {}; }
}

export function trackTemplateUsage(templateName: string) {
  const usage = getTemplateUsage();
  usage[templateName] = (usage[templateName] || 0) + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  window.dispatchEvent(new Event("lexdraft-counters"));
}

export function getTopTemplates(limit: number = 3): { name: string; count: number }[] {
  const usage = getTemplateUsage();
  return Object.entries(usage)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ── Saved Drafts ──────────────────────────────────────────────────────

export interface SavedDraft {
  id: string;
  templateName: string;
  fields: Record<string, string>;
  htmlContent: string;
  savedAt: string;
  finalized: boolean;
  matterId?: string;
  draftingContext?: string;
}

export function getSavedDrafts(): SavedDraft[] {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]");
  } catch { return []; }
}

export function saveDraft(draft: SavedDraft) {
  const drafts = getSavedDrafts();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) drafts[idx] = draft;
  else drafts.unshift(draft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 50)));
  window.dispatchEvent(new Event("lexdraft-counters"));
}

// ── Recent Activities ─────────────────────────────────────────────────

export interface RecentActivity {
  id: string;
  action: string;
  templateName: string;
  timestamp: string;
}

export function getRecentActivities(): RecentActivity[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}

export function addRecentActivity(action: string, templateName: string) {
  const activities = getRecentActivities();
  activities.unshift({
    id: crypto.randomUUID(),
    action,
    templateName,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(RECENT_KEY, JSON.stringify(activities.slice(0, 20)));
  window.dispatchEvent(new Event("lexdraft-counters"));
}