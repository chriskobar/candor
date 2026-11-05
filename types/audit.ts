export type DimensionScore = {
  label: string;
  score: number;           // 1–10
  finding: string;         // 1–2 sentence observation
  suggestion: string;      // 1–2 sentence actionable recommendation
  points: string[];        // 3–4 brief specific observations
};

export type AuditResult = {
  // ── Scores ──────────────────────────────────────────────────────
  overallScore: number;      // Universal unbiased score (always present)
  intentScore?: number;      // Intent-weighted score (only when primaryIntent provided)
  verdict: string;           // Verbal label for the lead score

  // ── Intent alignment (only when primaryIntent provided) ─────────
  primaryIntent?: string;    // Echoed back from user input
  intentAlignment?: string;  // 1–2 sentences: how well design achieves stated intent
  intentGap: boolean;        // true if intentScore significantly trails universalScore

  // ── AI surface (deep critique only) ─────────────────────────────
  aiSurface?: {
    detected: boolean;       // Does the screen visibly present AI output?
    evidence: string[];      // Quoted on-screen elements that indicate AI
  };

  // ── Narrative ───────────────────────────────────────────────────
  designersRead: string;     // 3–4 sentence editorial summary

  // ── Dimensions ──────────────────────────────────────────────────
  dimensions: DimensionScore[];

  // ── Meta ────────────────────────────────────────────────────────
  imageName?: string;
  deepCritique?: boolean;
};
