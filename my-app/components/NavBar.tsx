'use client';

import { useResume } from '@/context/ResumeContext';

export default function NavBar() {
  const { open } = useResume();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Wordmark */}
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Summer&nbsp;<span className="text-accent">’27</span>
          </span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-gray-400 sm:inline">
            Internships
          </span>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={open}
          className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:text-gray-900 hover:shadow-md sm:px-5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-accent transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M9 13h6M9 17h4" />
          </svg>
          <span className="hidden sm:inline">Resume Settings</span>
          <span className="sm:hidden">Resume</span>
        </button>
      </nav>
    </header>
  );
}
