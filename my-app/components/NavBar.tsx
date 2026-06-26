'use client';

import { useResume } from '@/context/ResumeContext';

export default function NavBar() {
  const { open } = useResume();

  return (
    <nav>
      <span>Summer 2027 Internship Dashboard</span>
      <button type="button" onClick={open}>
        Resume Settings
      </button>
    </nav>
  );
}
