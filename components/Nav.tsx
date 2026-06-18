'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',          label: 'Dashboard' },
  { href: '/cenik',     label: 'Živý ceník' },
  { href: '/changelog', label: 'Changelog' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{ borderTop: '1px solid #e5e7eb', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0 }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? '#DB0D15' : '#666',
                borderBottom: active ? '2px solid #DB0D15' : '2px solid transparent',
                textDecoration: 'none',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.03em',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
