'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HIDE_ON = ['/', '/login', '/survey'];

const INSTRUCTOR_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/teams', label: 'Teams' },
  { href: '/projects', label: 'Projects' },
  { href: '/checkins', label: 'Check-ins' },
];

const STUDENT_LINKS = [
  { href: '/join', label: 'Join' },
  { href: '/checkin', label: 'Check-in' },
  { href: '/history', label: 'History' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/teams', label: 'Teams' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('tm_role'));
  }, [pathname]);

  if (HIDE_ON.includes(pathname) || !role) return null;

  const links = role === 'instructor' ? INSTRUCTOR_LINKS : STUDENT_LINKS;

  const handleSignOut = () => {
    localStorage.removeItem('tm_role');
    localStorage.removeItem('tm_name');
    localStorage.removeItem('tm_email');
    localStorage.removeItem('tm_student_id');
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href={role === 'instructor' ? '/dashboard' : '/checkin'}>
          <span className="text-xs font-mono text-emerald-600 tracking-widest uppercase">TeamMatch</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                pathname === link.href
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs text-stone-400 hover:text-stone-600 transition"
      >
        Sign out
      </button>
    </nav>
  );
}
