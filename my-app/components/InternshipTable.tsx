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

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search company, role, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        <strong>Locations:</strong>{' '}
        {locationTags.map(({ loc, count }) => (
          <button
            key={loc}
            type="button"
            aria-pressed={activeLocs.has(loc)}
            onClick={() => setActiveLocs((s) => toggle(s, loc))}
          >
            {activeLocs.has(loc) ? '✓ ' : ''}
            {loc} ({count})
          </button>
        ))}
      </div>

      <div>
        <strong>Roles:</strong>{' '}
        {ROLE_BUCKETS.map((b) => (
          <button
            key={b.label}
            type="button"
            aria-pressed={activeRoles.has(b.label)}
            onClick={() => setActiveRoles((s) => toggle(s, b.label))}
          >
            {activeRoles.has(b.label) ? '✓ ' : ''}
            {b.label}
          </button>
        ))}
      </div>

      <p>
        Showing {filtered.length} of {internships.length} positions
      </p>

      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Location</th>
            <th>Date Posted</th>
            <th>Apply</th>
            <th>Tailor</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((i) => (
            <tr key={i.id}>
              <td>
                {i.companyUrl ? (
                  <a href={i.companyUrl} target="_blank" rel="noopener noreferrer">
                    {i.company}
                  </a>
                ) : (
                  i.company
                )}
              </td>
              <td>{i.role}</td>
              <td>{i.location}</td>
              <td>{i.datePosted}</td>
              <td>
                {i.appUrl ? (
                  <a href={i.appUrl} target="_blank" rel="noopener noreferrer">
                    Apply ↗
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>
                <button type="button" disabled>
                  Tailor
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
