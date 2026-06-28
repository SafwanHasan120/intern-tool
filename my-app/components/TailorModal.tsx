'use client';

import { useState, useCallback } from 'react';
import { useTailor, type TailorResult } from '@/context/TailorContext';
import type { Internship } from '@/lib/types';

interface TailorModalProps {
  result: TailorResult | null;
  internship: Internship | null;
  onClose: () => void;
}

function timeAgo(epochMs: number): string {
  const now = Date.now();
  const deltaSec = Math.floor((now - epochMs) / 1000);

  if (deltaSec < 60) return 'just now';
  const deltaMin = Math.floor(deltaSec / 60);
  if (deltaMin < 60) return `${deltaMin} minute${deltaMin > 1 ? 's' : ''} ago`;
  const deltaHr = Math.floor(deltaSec / 3600);
  if (deltaHr < 24) return `${deltaHr} hour${deltaHr > 1 ? 's' : ''} ago`;
  const deltaDay = Math.floor(deltaSec / 86400);
  return `${deltaDay} day${deltaDay > 1 ? 's' : ''} ago`;
}

function parseLatexToHtml(latex: string): string {
  // Extract document content
  const docMatch = latex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  let content = docMatch ? docMatch[1] : latex;

  // Helper: extract argument from LaTeX command
  function extractArg(text: string, depth = 0): [string, number] {
    let braceCount = 0;
    let i = 0;
    while (i < text.length) {
      if (text[i] === '{') braceCount++;
      else if (text[i] === '}') {
        if (braceCount === 0) break;
        braceCount--;
      }
      i++;
    }
    return [text.substring(0, i), i];
  }

  // Process commands in order
  // 1. \section{X}
  content = content.replace(/\\section\s*\{([^}]*)\}/g, (_, title) => {
    return `<div class="mt-5 mb-3 pb-1 border-b border-gray-200"><h3 class="text-sm font-semibold uppercase tracking-widest text-gray-900">${escapeHtml(title)}</h3></div>`;
  });

  // 2. \resumeSubheading{Co}{Loc}{Title}{Date}
  content = content.replace(/\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/g, (_, co, loc, title, date) => {
    return `
      <div class="mb-2">
        <div class="flex justify-between items-baseline gap-2">
          <strong class="text-sm text-gray-900">${escapeHtml(co)}</strong>
          <span class="text-xs text-gray-500">${escapeHtml(loc)}</span>
        </div>
        <div class="flex justify-between items-baseline gap-2">
          <em class="text-sm text-gray-600">${escapeHtml(title)}</em>
          <span class="text-xs text-gray-500">${escapeHtml(date)}</span>
        </div>
      </div>
    `;
  });

  // 3. \resumeProjectHeading{Name | Stack}{Date}
  content = content.replace(/\\resumeProjectHeading\s*\{([^}]*)\}\{([^}]*)\}/g, (_, nameStack: string, date: string) => {
    const parts = nameStack.split('|').map((s: string) => s.trim());
    const name = parts[0] || '';
    const stack = parts[1] || '';
    return `
      <div class="mb-2">
        <div class="flex justify-between items-baseline gap-2">
          <strong class="text-sm text-gray-900">${escapeHtml(name)}</strong>
          <span class="text-xs text-gray-500">${escapeHtml(date)}</span>
        </div>
        ${stack ? `<div class="text-xs text-gray-500 italic">${escapeHtml(stack)}</div>` : ''}
      </div>
    `;
  });

  // 4. \resumeItem{X}
  content = content.replace(/\\resumeItem\s*\{([^}]*)\}/g, (_, item) => {
    return `<li class="text-sm text-gray-700 ml-4">${escapeHtml(item)}</li>`;
  });

  // Wrap consecutive \resumeItem in <ul>
  content = content.replace(/(<li class="text-sm[^>]*>.*?<\/li>)+/g, (match) => {
    return `<ul class="list-disc mb-3">${match}</ul>`;
  });

  // 5. \textbf{X}
  content = content.replace(/\\textbf\s*\{([^}]*)\}/g, (_, text) => {
    return `<strong>${escapeHtml(text)}</strong>`;
  });

  // 6. \emph{X}
  content = content.replace(/\\emph\s*\{([^}]*)\}/g, (_, text) => {
    return `<em>${escapeHtml(text)}</em>`;
  });

  // 7. \href{url}{text}
  content = content.replace(/\\href\s*\{([^}]*)\}\s*\{([^}]*)\}/g, (_, url, text) => {
    return `<a href="${escapeHtml(url)}" target="_blank" class="text-accent hover:underline">${escapeHtml(text)}</a>`;
  });

  // 8. Strip math mode $...$
  content = content.replace(/\$[^$]*\$/g, '');

  // 9. Strip remaining commands (keep inner content)
  content = content.replace(/\\[a-zA-Z]+(?:\s*\{([^}]*)\})?/g, (match, innerContent) => {
    return innerContent || '';
  });

  // 10. Collapse multiple blank lines
  content = content.replace(/\n\s*\n+/g, '\n\n');

  // 11. Escape any remaining HTML and wrap paragraphs
  content = content
    .split('\n\n')
    .map((para) => {
      const trimmed = para.trim();
      return trimmed ? `<p class="mb-2">${trimmed}</p>` : '';
    })
    .join('');

  return content;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export default function TailorModal({ result, internship, onClose }: TailorModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedState, setCopiedState] = useState(false);
  const { clearResult } = useTailor();

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.latex);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.latex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-tailored.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const handleReTailor = useCallback(() => {
    if (!result) return;
    clearResult(result.internshipId);
    onClose();
  }, [result, clearResult, onClose]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
      />

      {/* Modal Panel */}
      <div
        className={`relative z-10 flex flex-col bg-white border border-gray-200/80 shadow-2xl spa-fade-up ${
          isFullscreen
            ? 'fixed inset-0 rounded-none'
            : 'w-[96vw] h-[92vh] max-w-[1400px] rounded-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <p className="font-serif text-base font-semibold text-gray-900">
              {internship?.company} — {internship?.role}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Tailored resume
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>

            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Split Pane Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane - LaTeX Code */}
          <div className="flex w-1/2 flex-col border-r border-gray-100">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">LaTeX</p>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-all hover:border-gray-300"
              >
                {copiedState ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-accent">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-accent">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-gray-700">
                <code>{result.latex}</code>
              </pre>
            </div>
          </div>

          {/* Right Pane - Preview */}
          <div className="flex w-1/2 flex-col bg-gray-50/40">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Preview</p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-all hover:border-gray-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download .tex</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-[680px] rounded-xl border border-gray-200/80 bg-white p-8 shadow-sm">
                <div dangerouslySetInnerHTML={{ __html: parseLatexToHtml(result.latex) }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">Tailored {timeAgo(result.tailoredAt)}</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReTailor}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900"
            >
              Re-tailor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
