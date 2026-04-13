'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { useNavigation } from '@/store/navigation';

const empresaLinks = [
  { label: 'Inicio', page: 'inicio' as const },
  { label: 'Preguntas frecuentes', page: 'faq' as const },
  { label: 'Contacto', page: 'contacto' as const },
];

const legalLinks = [
  { label: 'Aviso legal', page: 'legal' as const },
  { label: 'Política de privacidad', page: 'privacidad' as const },
  { label: 'Política de cookies', page: 'cookies' as const },
];

export function Footer() {
  const { navigate } = useNavigation();

  return (
    <footer className="bg-de-blue-darker text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Dimension</span>{' '}
                <span className="text-de-blue-light">Energy</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Optimizamos tu tarifa de luz con GBP Energía para que ahorres sin complicaciones.
              Servicio gratuito, sin letra pequeña.
            </p>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
              Empresa
            </h3>
            <ul className="space-y-3">
              {empresaLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="mailto:energy@dimensionexpert.com"
                  className="transition-colors hover:text-white"
                >
                  energy@dimensionexpert.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/34600971950"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  600 971 950
                </a>
              </li>
              <li>L-V 9:00-19:00</li>
              <li>S 10:00-14:00</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-white/50">
            © {new Date().getFullYear()} Dimension Energy. Todos los derechos reservados.
            Comercializadora de referencia: GBP Energía.
          </p>
        </div>
      </div>
    </footer>
  );
}
