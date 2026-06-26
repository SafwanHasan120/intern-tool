export interface Internship {
  id: string; // = appUrl (dedup key)
  company: string;
  companyUrl?: string; // from [Company](url) markdown link
  role: string;
  location: string; // comma-joined if multi-location cell
  appUrl: string;
  datePosted: string; // raw string for display
  dateMs: number; // parsed epoch ms for ranking (0 = unknown)
  prestigeScore: number; // 0 | 0.5 | 1.0
  source: string; // repo slug
}

export interface ResumeSettings {
  latex: string;
  adjustments: Record<string, unknown>;
}
