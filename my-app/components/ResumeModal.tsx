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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-gray-200/80 bg-white shadow-2xl spa-fade-up sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 sm:px-8 sm:py-6">
          <div>
            <h2
              id="resume-modal-title"
              className="font-serif text-2xl font-semibold tracking-tight text-gray-900"
            >
              Resume Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tune how your resume is tailored to each application.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div>
            <label
              htmlFor="resume-latex"
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400"
            >
              Raw LaTeX
            </label>
            <textarea
              id="resume-latex"
              rows={8}
              value={settings.latex}
              placeholder="Paste your resume LaTeX here…"
              onChange={(e) => updateLatex(e.target.value)}
              className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 font-mono text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {ADJUSTMENT_FIELDS.map((field) => (
              <div key={field.key} className="last:sm:col-span-2">
                <label
                  htmlFor={`adj-${field.key}`}
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400"
                >
                  {field.label}
                </label>
                <input
                  id={`adj-${field.key}`}
                  type="text"
                  placeholder={field.placeholder}
                  value={String(settings.adjustments[field.key] ?? '')}
                  onChange={(e) => updateAdjustment(field.key, e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent hover:shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
