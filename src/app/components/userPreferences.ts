import { supabase } from "../../utils/supabase/client";

export type ToneStyle = "formal" | "concise" | "verbose";

export interface FormattingPreferences {
  lineHeight: number;
  paragraphSpacing: number;
  headingStyle: "uppercase" | "title-case" | "sentence-case";
}

export interface UserPreferences {
  user_id: string;
  preferred_formatting: FormattingPreferences;
  tone_style: ToneStyle;
  common_phrasing_patterns: string[];
  structural_patterns: {
    sentence_style: "short" | "balanced" | "long";
    clause_formatting: "numbered" | "bulleted" | "paragraph";
    heading_style: FormattingPreferences["headingStyle"];
  };
  updated_at?: string;
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, "user_id"> = {
  preferred_formatting: {
    lineHeight: 2,
    paragraphSpacing: 8,
    headingStyle: "uppercase",
  },
  tone_style: "formal",
  common_phrasing_patterns: [],
  structural_patterns: {
    sentence_style: "balanced",
    clause_formatting: "paragraph",
    heading_style: "uppercase",
  },
};

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function loadUserPreferences(): Promise<UserPreferences | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load user preferences", error);
    return null;
  }

  if (!data) {
    return { user_id: userId, ...DEFAULT_USER_PREFERENCES };
  }

  return {
    user_id: userId,
    preferred_formatting: { ...DEFAULT_USER_PREFERENCES.preferred_formatting, ...(data.preferred_formatting || {}) },
    tone_style: data.tone_style || DEFAULT_USER_PREFERENCES.tone_style,
    common_phrasing_patterns: Array.isArray(data.common_phrasing_patterns) ? data.common_phrasing_patterns : [],
    structural_patterns: { ...DEFAULT_USER_PREFERENCES.structural_patterns, ...(data.structural_patterns || {}) },
    updated_at: data.updated_at,
  };
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  const { error } = await supabase.from("user_preferences").upsert(preferences, { onConflict: "user_id" });
  if (error) {
    console.warn("Failed to save user preferences", error);
  }
}

export function inferPreferencesFromDocument(root: HTMLElement, existing: UserPreferences): UserPreferences {
  const paragraphs = Array.from(root.querySelectorAll("p"));
  const headings = Array.from(root.querySelectorAll("h1, h2, h3"));
  const lists = Array.from(root.querySelectorAll("ol, ul"));

  const text = root.textContent || "";
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgSentenceLength = sentences.length === 0 ? 0 : sentences.reduce((a, s) => a + s.split(/\s+/).length, 0) / sentences.length;

  const sentenceStyle: UserPreferences["structural_patterns"]["sentence_style"] =
    avgSentenceLength < 12 ? "short" : avgSentenceLength > 24 ? "long" : "balanced";

  const clauseFormatting: UserPreferences["structural_patterns"]["clause_formatting"] =
    lists.some((l) => l.tagName.toLowerCase() === "ol")
      ? "numbered"
      : lists.some((l) => l.tagName.toLowerCase() === "ul")
        ? "bulleted"
        : "paragraph";

  const headingText = headings.map((h) => h.textContent?.trim() || "").filter(Boolean);
  const uppercaseHeadings = headingText.filter((h) => h.toUpperCase() === h).length;
  const headingStyle: FormattingPreferences["headingStyle"] =
    headingText.length > 0 && uppercaseHeadings / headingText.length > 0.6 ? "uppercase" : "title-case";

  const style = window.getComputedStyle(root);
  const lineHeight = parseFloat(style.lineHeight) || existing.preferred_formatting.lineHeight;

  const patterns = extractCommonPhrasingPatterns(sentences);

  return {
    ...existing,
    preferred_formatting: {
      ...existing.preferred_formatting,
      lineHeight,
      paragraphSpacing: paragraphs.length > 1 ? 8 : existing.preferred_formatting.paragraphSpacing,
      headingStyle,
    },
    common_phrasing_patterns: uniqueTop([...existing.common_phrasing_patterns, ...patterns], 12),
    structural_patterns: {
      sentence_style: sentenceStyle,
      clause_formatting: clauseFormatting,
      heading_style: headingStyle,
    },
  };
}

function extractCommonPhrasingPatterns(sentences: string[]): string[] {
  const patternCounts = new Map<string, number>();
  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    const words = normalized.split(" ").filter(Boolean);
    if (words.length < 4) continue;
    const phrase = words.slice(0, 4).join(" ");
    patternCounts.set(phrase, (patternCounts.get(phrase) || 0) + 1);
  }

  return Array.from(patternCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase]) => phrase);
}

function uniqueTop(items: string[], limit: number): string[] {
  return Array.from(new Set(items)).slice(0, limit);
}
