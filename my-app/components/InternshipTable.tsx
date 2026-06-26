'use client';

import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { Internship } from '@/lib/types';

interface Props {
  internships: Internship[];
}

// 8 role buckets, matched by regex against i.role.
const ROLE_BUCKETS: { label: string; test: RegExp }[] = [
  { label: 'SWE', test: /software|swe|engineer|developer|full.?stack|backend|front.?end/i },
  { label: 'ML/AI', test: /machine learning|\bml\b|\bai\b|deep learning|nlp|computer vision|llm/i },
  { label: 'Data', test: /data (scien|analy|engineer)|analytics|\bbi\b|business intelligence/i },
  { label: 'Product', test: /product manage|\bpm\b|product intern/i },
  { label: 'Quant', test: /quant|trading|trader|research analyst/i },
  { label: 'DevOps/Infra', test: /devops|infra|platform|site reliability|\bsre\b|cloud|systems/i },
  { label: 'Hardware', test: /hardware|electrical|embedded|firmware|asic|\bfpga\b|chip|silicon/i },
  { label: 'Design/UX', test: /design|\bux\b|\bui\b|user experience|product design/i },
];

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/* ── Inline icons (no icon-library dependency) ─────────────────────── */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

const PILL_BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer select-none';
const PILL_ON = 'border-transparent bg-gray-900 text-white shadow-sm';
const PILL_OFF = 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900';

export default function InternshipTable({ internships }: Props) {
  const [query, setQuery] = useState('');
  const [activeLocs, setActiveLocs] = useState<Set<string>>(new Set());
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set());

  const fuse = useMemo(
    () =>
      new Fuse(internships, {
        keys: [
          { name: 'company', weight: 0.4 },
          { name: 'role', weight: 0.4 },
          { name: 'location', weight: 0.2 },
        ],
        threshold: 0.3,
      }),
    [internships]
  );

  // Top 20 location tags by frequency.
  const locationTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const i of internships) {
      const parts = i.location
        .split(/,|\/|<br>/i)
        .map((p) => p.trim())
        .filter((p) => p && p !== '—');
      for (const p of parts) freq.set(p, (freq.get(p) ?? 0) + 1);
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([loc, count]) => ({ loc, count }));
  }, [internships]);

  const filtered = useMemo(() => {
    // query → fuse.search OR passthrough
    let rows = query.trim()
      ? fuse.search(query.trim()).map((r) => r.item)
      : internships;

    // filter activeLocs (match any active location substring)
    if (activeLocs.size > 0) {
      rows = rows.filter((i) => {
        const loc = i.location.toLowerCase();
        for (const a of activeLocs) if (loc.includes(a.toLowerCase())) return true;
        return false;
      });
    }

    // filter activeRoles (match any active bucket)
    if (activeRoles.size > 0) {
      rows = rows.filter((i) =>
        ROLE_BUCKETS.some((b) => activeRoles.has(b.label) && b.test.test(i.role))
      );
    }

    return rows;
  }, [query, fuse, internships, activeLocs, activeRoles]);

  const hasFilters = query.trim() !== '' || activeLocs.size > 0 || activeRoles.size > 0;
  const clearAll = () => {
    setQuery('');
    setActiveLocs(new Set());
    setActiveRoles(new Set());
  };

  return (
    <div className="spa-fade-up" style={{ animationDelay: '120ms' }}>
      {/* ── Control panel ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.08)] sm:p-7">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, role, or location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* Roles */}
        <div className="mt-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Discipline
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLE_BUCKETS.map((b) => {
              const on = activeRoles.has(b.label);
              return (
                <button
                  key={b.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActiveRoles((s) => toggle(s, b.label))}
                  className={`${PILL_BASE} ${on ? PILL_ON : PILL_OFF}`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locations */}
        <div className="mt-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Location
          </div>
          <div className="flex flex-wrap gap-2">
            {locationTags.map(({ loc, count }) => {
              const on = activeLocs.has(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActiveLocs((s) => toggle(s, loc))}
                  className={`${PILL_BASE} ${on ? PILL_ON : PILL_OFF}`}
                >
                  <PinIcon className={`h-3.5 w-3.5 ${on ? 'text-emerald-300' : 'text-gray-400'}`} />
                  {loc}
                  <span className={`ml-0.5 tabular-nums ${on ? 'text-white/60' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Results meta bar ──────────────────────────────────────── */}
      <div className="mt-8 mb-4 flex items-center justify-between gap-4 px-1">
        <p className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-semibold text-gray-900">{filtered.length.toLocaleString()}</span>{' '}
          of {internships.length.toLocaleString()} positions
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-gray-400 underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Desktop table ─────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.08)] md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              {['Company', 'Position', 'Location', 'Posted', '', ''].map((h, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr
                key={i.id}
                className="group border-b border-gray-100 transition-colors duration-150 last:border-0 hover:bg-emerald-50/40"
              >
                <td className="px-6 py-4 align-middle">
                  {i.companyUrl ? (
                    <a
                      href={i.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-900 decoration-emerald-300 decoration-2 underline-offset-4 transition-colors hover:text-accent hover:underline"
                    >
                      {i.company}
                    </a>
                  ) : (
                    <span className="font-semibold text-gray-900">{i.company}</span>
                  )}
                </td>
                <td className="max-w-xs px-6 py-4 align-middle text-sm text-gray-600">
                  {i.role}
                </td>
                <td className="px-6 py-4 align-middle">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <PinIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                    {i.location}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 align-middle text-sm tabular-nums text-gray-400">
                  {i.datePosted}
                </td>
                <td className="px-6 py-4 align-middle">
                  {i.appUrl ? (
                    <a
                      href={i.appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-accent hover:shadow-md"
                    >
                      Apply
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 align-middle">
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-300"
                  >
                    <SparkIcon className="h-3.5 w-3.5" />
                    Tailor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <EmptyState />}
      </div>

      {/* ── Mobile / tablet cards ─────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {filtered.map((i) => (
          <div
            key={i.id}
            className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {i.companyUrl ? (
                  <a
                    href={i.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 transition-colors hover:text-accent"
                  >
                    {i.company}
                  </a>
                ) : (
                  <span className="font-semibold text-gray-900">{i.company}</span>
                )}
                <p className="mt-1 text-sm leading-snug text-gray-600">{i.role}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-gray-400">
                {i.datePosted}
              </span>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              {i.location}
            </div>

            <div className="mt-4 flex items-center gap-2">
              {i.appUrl ? (
                <a
                  href={i.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent"
                >
                  Apply
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="flex-1 text-center text-xs text-gray-300">No link</span>
              )}
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-300"
              >
                <SparkIcon className="h-3.5 w-3.5" />
                Tailor
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-200/80 bg-white">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
        <SearchIcon className="h-5 w-5 text-accent" />
      </div>
      <p className="mt-4 font-serif text-lg text-gray-900">No positions found</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Try adjusting your search or clearing a filter to see more results.
      </p>
    </div>
  );
}
