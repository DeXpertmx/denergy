'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { useNavigation } from '@/store/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Inicio', page: 'inicio' as const, scroll: false },
  { label: 'Beneficios', page: 'inicio' as const, scroll: 'beneficios' },
  { label: 'FAQ', page: 'faq' as const, scroll: false },
  { label: 'Contacto', page: 'contacto' as const, scroll: false },
];

function handleScrollTo(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function Navbar() {
  const { currentPage, navigate, mobileMenuOpen, setMobileMenuOpen } = useNavigation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (link: (typeof navLinks)[number]) => {
    setMobileMenuOpen(false);
    if (link.scroll) {
      if (currentPage !== 'inicio') {
        navigate('inicio');
        setTimeout(() => handleScrollTo(link.scroll), 100);
      } else {
        handleScrollTo(link.scroll);
      }
    } else {
      navigate(link.page);
    }
  };

  const handleUploadBill = () => {
    setMobileMenuOpen(false);
    if (currentPage !== 'inicio') {
      navigate('inicio');
      setTimeout(() => handleScrollTo('formulario'), 100);
    } else {
      handleScrollTo('formulario');
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-de-border'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <button
            onClick={() => navigate('inicio')}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-de-blue">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-de-blue-dark">Dimension</span>
              <span className="text-de-blue"> Energy</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  currentPage === link.page && !link.scroll
                    ? 'text-de-blue bg-de-blue/10'
                    : 'text-de-text hover:text-de-blue hover:bg-de-blue/5'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button onClick={handleUploadBill} className="gap-2 bg-de-blue hover:bg-de-blue-dark">
              <Zap className="h-4 w-4" />
              Subir factura
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-de-text hover:bg-de-blue/5 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader className="pt-2">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-de-blue">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span>
                <span className="text-de-blue-dark">Dimension</span>{' '}
                <span className="text-de-blue">Energy</span>
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pt-4">
            {navLinks.map((link) => (
              <SheetClose key={link.label} asChild>
                <button
                  onClick={() => handleNav(link)}
                  className={cn(
                    'rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors',
                    currentPage === link.page && !link.scroll
                      ? 'text-de-blue bg-de-blue/10'
                      : 'text-de-text hover:text-de-blue hover:bg-de-blue/5'
                  )}
                >
                  {link.label}
                </button>
              </SheetClose>
            ))}
            <div className="pt-4">
              <Button
                onClick={handleUploadBill}
                className="w-full gap-2 bg-de-blue hover:bg-de-blue-dark"
              >
                <Zap className="h-4 w-4" />
                Subir factura
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.header>
  );
}
