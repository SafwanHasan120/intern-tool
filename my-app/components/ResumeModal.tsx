'use client';

import { useResume } from '@/context/ResumeContext';

// Add new adjustment fields here — they render automatically and persist via context.
const ADJUSTMENT_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'tone', label: 'Tone', placeholder: 'e.g. concise, formal, enthusiastic' },
  { key: 'focus', label: 'Focus', placeholder: 'e.g. backend systems, ML research' },
  { key: 'keywords', label: 'Keywords', placeholder: 'comma-separated keywords to emphasize' },
];

export default function ResumeModal() {
  const { settings, isOpen, updateLatex, updateAdjustment, close } = useResume();

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      <h2>Resume Settings</h2>

      <div>
        <label htmlFor="resume-latex">Raw LaTeX</label>
        <br />
        <textarea
          id="resume-latex"
          rows={10}
          cols={60}
          value={settings.latex}
          placeholder="Paste your resume LaTeX here..."
          onChange={(e) => updateLatex(e.target.value)}
        />
      </div>

      {ADJUSTMENT_FIELDS.map((field) => (
        <div key={field.key}>
          <label htmlFor={`adj-${field.key}`}>{field.label}</label>
          <br />
          <input
            id={`adj-${field.key}`}
            type="text"
            placeholder={field.placeholder}
            value={String(settings.adjustments[field.key] ?? '')}
            onChange={(e) => updateAdjustment(field.key, e.target.value)}
          />
        </div>
      ))}

      <div>
        <button type="button" onClick={close}>
          Save
        </button>
        <button type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
