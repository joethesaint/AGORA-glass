'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Transparency', href: '/transparency' },
    { name: 'Performance', href: '/performance' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${pathname === link.href
                ? 'text-[#00A3FF] font-semibold'
                : 'text-[#8A93A3] hover:text-[#F2F2F2]'
              }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-[#1E2532] rounded-lg transition-colors"
      >
        {isOpen ? <X size={18} className="text-[#8A93A3]" /> : <Menu size={18} className="text-[#8A93A3]" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Menu */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-64 bg-[#0B0E14] border-l border-[#1E2532] z-50 p-6 space-y-4"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-white">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[#1E2532] rounded-lg transition-colors"
                >
                  <X size={18} className="text-[#8A93A3]" />
                </button>
              </div>

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${pathname === link.href
                      ? 'bg-[#00A3FF]/10 text-[#00A3FF] font-semibold'
                      : 'text-[#8A93A3] hover:bg-[#1E2532] hover:text-[#F2F2F2]'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};