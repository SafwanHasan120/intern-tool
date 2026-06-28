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
  linkHealth?: 'healthy' | 'not-found' | 'server-error' | 'timeout' | 'unknown'; // URL validation status
  isExpired?: boolean; // true if listing is stale
  expirationReason?: 'over-6-months' | 'posted-last-year' | 'no-date' | 'fresh'; // why it's expired (or not)
}

export interface ResumeSettings {
  latex: string;
}
