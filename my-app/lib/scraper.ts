import type { Internship } from './types';
import { prestigeOf } from './companies';

export const REPOS = [
  'https://raw.githubusercontent.com/vanshb03/Summer2027-Internships/main/README.md',
  'https://raw.githubusercontent.com/sndsh404/summer-2027-internships/main/README.md',
];

// Derive a short repo slug ("owner/repo") from a raw GitHub URL for the `source` field.
function repoSlug(url: string): string {
  const m = url.match(/githubusercontent\.com\/([^/]+)\/([^/]+)\//);
  return m ? `${m[1]}/${m[2]}` : url;
}

// Remove supplementary unicode planes (emoji, flags) + variation selectors / ZWJ.
export function stripEmoji(str: string): string {
  return str
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]/gu, '')
    .trim();
}

// { text, url } from a markdown [text](url) or <a href="url">text</a>, else { text: cell, url: '' }
export function extractMarkdownLink(cell: string): { text: string; url: string } {
  const raw = cell.trim();

  // Markdown link: [text](url) — text may itself contain an <img> badge.
  const md = raw.match(/\[([^\]]*)\]\(([^)\s]+)[^)]*\)/);
  if (md) {
    let text = md[1].replace(/<[^>]+>/g, '').trim();
    if (!text) {
      // Badge-only link (e.g. [<img ...>](url)); fall back to alt text or empty.
      const alt = md[1].match(/alt=["']([^"']+)["']/);
      text = alt ? alt[1].trim() : '';
    }
    return { text: stripEmoji(text), url: md[2].trim() };
  }

  // HTML anchor: <a href="url">text</a>
  const a = raw.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);
  if (a) {
    const text = a[2].replace(/<[^>]+>/g, '').trim();
    return { text: stripEmoji(text), url: a[1].trim() };
  }

  return { text: stripEmoji(raw.replace(/<[^>]+>/g, '').trim()), url: '' };
}

// Try native Date parse, then a "Jul 2025" / "Jul 01" style fallback. Returns epoch ms, 0 on failure.
export function parseDate(str: string): number {
  const s = stripEmoji(str).trim();
  if (!s) return 0;

  const native = new Date(s);
  if (!isNaN(native.getTime())) return native.getTime();

  const MONTHS: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const m = s.toLowerCase().match(/([a-z]{3})[a-z]*\.?\s+(\d{1,4})/);
  if (m && m[1] in MONTHS) {
    const month = MONTHS[m[1]];
    const num = parseInt(m[2], 10);
    // "Jul 2025" → year; "Jul 01" → day of current year.
    if (num > 31) {
      return new Date(num, month, 1).getTime();
    }
    return new Date(new Date().getFullYear(), month, num).getTime();
  }

  return 0;
}

// Split a markdown table row into trimmed cells, dropping the leading/trailing pipe delimiters.
function splitRow(line: string): string[] {
  // Split on unescaped pipes.
  const cells = line.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
  // Drop empty leading/trailing cells produced by edge pipes.
  if (cells.length && cells[0] === '') cells.shift();
  if (cells.length && cells[cells.length - 1] === '') cells.pop();
  return cells;
}

function isSeparatorRow(line: string): boolean {
  return /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');
}

interface ColMap {
  company: number;
  role: number;
  location: number;
  appUrl: number;
  date: number;
}

function detectColumns(header: string[]): ColMap | null {
  const map: ColMap = { company: -1, role: -1, location: -1, appUrl: -1, date: -1 };
  header.forEach((h, i) => {
    const k = h.toLowerCase();
    if (map.company < 0 && /compan|organi/.test(k)) map.company = i;
    if (map.role < 0 && /role|position|title|job/.test(k)) map.role = i;
    if (map.location < 0 && /location|loc/.test(k)) map.location = i;
    if (map.appUrl < 0 && /application|link|apply|url/.test(k)) map.appUrl = i;
    if (map.date < 0 && /date|added|posted/.test(k)) map.date = i;
  });
  // Need at least a company + role to be a usable internship table.
  if (map.company < 0 || map.role < 0) return null;
  return map;
}

function parseMarkdown(md: string, source: string): Internship[] {
  const out: Internship[] = [];
  const lines = md.split(/\r?\n/);
  let cols: ColMap | null = null;
  let lastCompany = '';
  let lastCompanyUrl = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith('|');

    if (!isTableRow) {
      cols = null; // table block ended
      continue;
    }

    // Possible header: this row + next row is a separator.
    if (!cols && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      cols = detectColumns(splitRow(line));
      if (cols) {
        lastCompany = '';
        lastCompanyUrl = '';
        i++; // skip separator
      }
      continue;
    }

    if (isSeparatorRow(line)) continue;
    if (!cols) continue;

    const cells = splitRow(line);
    const cell = (idx: number) => (idx >= 0 && idx < cells.length ? cells[idx] : '');

    // Skip closed positions.
    if (line.includes('🔒')) continue;

    const companyCell = cell(cols.company);
    const companyLink = extractMarkdownLink(companyCell);
    let company = companyLink.text;
    let companyUrl = companyLink.url;

    // Carry forward company for "↳" / blank continuation rows (repeated company, new role).
    if (!company || company === '↳' || company === '⤷') {
      company = lastCompany;
      companyUrl = lastCompanyUrl;
    } else {
      lastCompany = company;
      lastCompanyUrl = companyUrl;
    }
    if (!company) continue;

    const role = extractMarkdownLink(cell(cols.role)).text;

    // Location: replace <br> with ", " then strip emoji.
    const locRaw = cell(cols.location).replace(/<br\s*\/?>/gi, ', ');
    const location = stripEmoji(locRaw.replace(/<[^>]+>/g, '').trim())
      .replace(/\s*,\s*/g, ', ')
      .replace(/(,\s*)+$/, '')
      .trim();

    const appLink = extractMarkdownLink(cell(cols.appUrl));
    const appUrl = appLink.url;

    const dateRaw = stripEmoji(cell(cols.date).replace(/<[^>]+>/g, '')).trim();

    if (!role && !appUrl) continue;

    const id = appUrl || `${source}:${company}:${role}:${location}`;

    out.push({
      id,
      company,
      companyUrl: companyUrl || undefined,
      role: role || '—',
      location: location || '—',
      appUrl,
      datePosted: dateRaw || '—',
      dateMs: parseDate(dateRaw),
      prestigeScore: prestigeOf(company),
      source,
    });
  }

  return out;
}

async function scrapeRepo(url: string): Promise<Internship[]> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const md = await res.text();
  return parseMarkdown(md, repoSlug(url));
}

export async function scrapeAllRepos(): Promise<Internship[]> {
  const results = await Promise.allSettled(REPOS.map(scrapeRepo));
  const all: Internship[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
    else console.error('Scrape failed:', r.reason);
  }
  return all;
}
