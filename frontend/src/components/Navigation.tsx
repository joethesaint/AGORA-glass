'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation = () => {
  const pathname = usePathname();
  
  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Transparency', href: '/transparency' },
  ];

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <Link 
          key={link.href}
          href={link.href}
          className={`text-sm ${pathname === link.href ? 'text-[#00A3FF] font-semibold' : 'text-[#8A93A3] hover:text-[#F2F2F2]'}`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};
