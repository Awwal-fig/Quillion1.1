import { addRecentActivity, getSavedDrafts, saveDraft, type SavedDraft } from "./draftStore";

const MATTERS_KEY = "lexdraft_matters";

export type MatterStatus = "active" | "completed";

export interface Matter {
  id: string;
  title: string;
  suitNumber: string;
  court: string;
  parties: string;
  category: string;
  description: string;
  status: MatterStatus;
  createdAt: string;
  updatedAt: string;
}

export function getMatters(): Matter[] {
  try { return JSON.parse(localStorage.getItem(MATTERS_KEY) || "[]"); } catch { return []; }
}

export function getMatterById(id: string): Matter | null {
  return getMatters().find((m) => m.id === id) || null;
}

export function saveMatter(payload: Omit<Matter, "id" | "createdAt" | "updatedAt">, id?: string) {
  const matters = getMatters();
  const now = new Date().toISOString();
  if (id) {
    const idx = matters.findIndex((m) => m.id === id);
    if (idx >= 0) matters[idx] = { ...matters[idx], ...payload, updatedAt: now };
  } else {
    matters.unshift({ id: crypto.randomUUID(), ...payload, createdAt: now, updatedAt: now });
  }
  localStorage.setItem(MATTERS_KEY, JSON.stringify(matters));
  window.dispatchEvent(new Event("lexdraft-counters"));
}

export function deleteMatter(id: string) {
  const matters = getMatters().filter((m) => m.id !== id);
  localStorage.setItem(MATTERS_KEY, JSON.stringify(matters));
  window.dispatchEvent(new Event("lexdraft-counters"));
}

export function getMatterDocuments(matterId: string): SavedDraft[] {
  return getSavedDrafts().filter((d) => d.matterId === matterId);
}

export function attachDraftToMatter(draft: SavedDraft, matterId: string) {
  saveDraft({ ...draft, matterId });
  addRecentActivity("Linked document to matter", draft.templateName);
}
