'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowDown, Play } from 'lucide-react';
import { useNavigation } from '@/store/navigation';

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      {/* Energy rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute h-48 w-48 rounded-full border-2 border-de-blue/10" style={{ animation: 'ring-expand 4s ease-out infinite' }} />
        <div className="absolute h-48 w-48 rounded-full border-2 border-de-blue/10" style={{ animation: 'ring-expand 4s ease-out infinite 1.3s' }} />
        <div className="absolute h-48 w-48 rounded-full border-2 border-de-blue/10" style={{ animation: 'ring-expand 4s ease-out infinite 2.6s' }} />
      </div>

      {/* Main SVG illustration */}
      <svg viewBox="0 0 400 360" className="relative z-10 w-full" fill="none">
        {/* House body */}
        <rect x="100" y="150" width="180" height="140" rx="4" fill="#e8f4fd" stroke="#0067B0" strokeWidth="2" />
        {/* Roof */}
        <polygon points="80,155 200,60 320,155" fill="#0067B0" stroke="#004d85" strokeWidth="2" />
        {/* Chimney */}
        <rect x="250" y="85" width="30" height="50" rx="2" fill="#004d85" />
        {/* Door */}
        <rect x="165" y="220" width="50" height="70" rx="4" fill="#0067B0" />
        <circle cx="207" cy="260" r="3" fill="#fff" />
        {/* Window left */}
        <rect x="115" y="180" width="35" height="35" rx="3" fill="#00a3e0" opacity="0.5" />
        <line x1="132.5" y1="180" x2="132.5" y2="215" stroke="#0067B0" strokeWidth="1" />
        <line x1="115" y1="197.5" x2="150" y2="197.5" stroke="#0067B0" strokeWidth="1" />
        {/* Window right */}
        <rect x="230" y="180" width="35" height="35" rx="3" fill="#00a3e0" opacity="0.5" />
        <line x1="247.5" y1="180" x2="247.5" y2="215" stroke="#0067B0" strokeWidth="1" />
        <line x1="230" y1="197.5" x2="265" y2="197.5" stroke="#0067B0" strokeWidth="1" />

        {/* Solar panel */}
        <g>
          <rect x="270" y="110" width="60" height="40" rx="2" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1.5" />
          <line x1="285" y1="110" x2="285" y2="150" stroke="#1e3a8a" strokeWidth="0.5" />
          <line x1="300" y1="110" x2="300" y2="150" stroke="#1e3a8a" strokeWidth="0.5" />
          <line x1="315" y1="110" x2="315" y2="150" stroke="#1e3a8a" strokeWidth="0.5" />
          <line x1="270" y1="123" x2="330" y2="123" stroke="#1e3a8a" strokeWidth="0.5" />
          <line x1="270" y1="136" x2="330" y2="136" stroke="#1e3a8a" strokeWidth="0.5" />
          {/* Sun rays */}
          <circle cx="300" cy="80" r="15" fill="#f59e0b" opacity="0.8" />
          <line x1="300" y1="55" x2="300" y2="45" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="320" y1="60" x2="327" y2="53" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="280" y1="60" x2="273" y2="53" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="330" y1="80" x2="340" y2="80" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="270" y1="80" x2="260" y2="80" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Ground */}
        <ellipse cx="200" cy="300" rx="140" ry="15" fill="#e2e8f0" />
      </svg>

      {/* Floating card: Savings */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute -left-4 bottom-28 z-20 rounded-xl bg-white p-3 shadow-lg ring-1 ring-de-border lg:-left-8"
        style={{ animation: 'card-float 4s ease-in-out infinite' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📉</span>
          <div>
            <p className="text-xs font-medium text-de-text-light">Tu ahorro mensual</p>
            <p className="text-sm font-bold text-de-success">-€45.20</p>
          </div>
        </div>
      </motion.div>

      {/* Floating card: Active Tariff */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute -right-4 top-36 z-20 rounded-xl bg-white p-3 shadow-lg ring-1 ring-de-border lg:-right-8"
        style={{ animation: 'card-float 4s ease-in-out infinite 1s' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-xs font-medium text-de-text-light">Tarifa optimizada</p>
            <p className="text-sm font-bold text-de-blue">Activa</p>
          </div>
        </div>
      </motion.div>

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-de-blue/30" style={{ animation: 'particle-float-1 5s ease-in-out infinite' }} />
        <div className="absolute left-[70%] top-[15%] h-1.5 w-1.5 rounded-full bg-de-blue-light/30" style={{ animation: 'particle-float-2 6s ease-in-out infinite' }} />
        <div className="absolute left-[50%] top-[80%] h-2.5 w-2.5 rounded-full bg-de-blue/20" style={{ animation: 'particle-float-3 7s ease-in-out infinite' }} />
        <div className="absolute left-[85%] top-[60%] h-2 w-2 rounded-full bg-de-blue-light/20" style={{ animation: 'particle-float-1 5.5s ease-in-out infinite 0.5s' }} />
        <div className="absolute left-[25%] top-[70%] h-1.5 w-1.5 rounded-full bg-de-blue/25" style={{ animation: 'particle-float-2 6.5s ease-in-out infinite 1s' }} />
      </div>
    </div>
  );
}

export function Hero() {
  const { navigate } = useNavigation();

  const handleCompare = () => {
    const el = document.getElementById('formulario');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHowItWorks = () => {
    const el = document.getElementById('pasos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: '+2,500', label: 'Familias ahorrando' },
    { value: '~30%', label: 'Ahorro promedio' },
    { value: '<24h', label: 'Respuesta garantizada' },
  ];

  return (
    <section className="de-gradient relative min-h-screen overflow-hidden pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge className="mb-6 gap-2 rounded-full border-de-blue/20 bg-de-blue/10 px-3 py-1.5 text-de-blue">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-de-blue opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-de-blue" />
                </span>
                Ahorro inteligente para tu hogar
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-de-blue-dark sm:text-4xl md:text-5xl lg:text-6xl"
            >
              ¿Cansado de cambiar cada{' '}
              <span className="de-gradient-text">3 meses</span>{' '}
              de compañía de luz?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-8 max-w-lg text-base text-de-text-light sm:text-lg md:text-xl"
            >
              Garantizamos que tendrás el mejor precio sin brincar de una compañía a otra.
              Sin letras pequeñas, sin permanencia y con gestión 100% personalizada para ti.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
              <Button
                onClick={handleCompare}
                size="lg"
                className="gap-2 bg-de-blue px-6 py-6 text-base hover:bg-de-blue-dark sm:text-lg"
              >
                <Zap className="h-5 w-5" />
                Comparar mi tarifa ahora
              </Button>
              <Button
                onClick={handleHowItWorks}
                variant="outline"
                size="lg"
                className="gap-2 border-de-blue/30 px-6 py-6 text-base text-de-blue hover:bg-de-blue/5 sm:text-lg"
              >
                <Play className="h-5 w-5" />
                Ver cómo funciona
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 grid grid-cols-3 gap-4 border-t border-de-border pt-8"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-de-blue sm:text-2xl md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-de-text-light sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-de-text-light"
        >
          <span className="text-xs">Descubre más</span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
