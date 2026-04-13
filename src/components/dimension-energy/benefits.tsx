'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const benefits = [
  {
    emoji: '💰',
    title: 'Mejor precio garantizado',
    description:
      'Realizamos un perfilado inteligente de tu consumo para encontrar la tarifa más económica del mercado con GBP Energía. Sin comisiones ocultas y con total transparencia en cada propuesta.',
  },
  {
    emoji: '🔄',
    title: 'Sin cambios constantes',
    description:
      'No cambiamos de comercializadora cada pocos meses. Buscamos la tarifa óptima a largo plazo para que no tengas que preocuparte por fluctuaciones innecesarias en tu factura.',
  },
  {
    emoji: '🛡️',
    title: 'Gestión 100% gratuita',
    description:
      'Todo el proceso de análisis, comparativa y cambio de tarifa es completamente gratuito para ti. Nosotros nos encargamos de todo el papeleo y trámites necesarios.',
  },
];

function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof benefits)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-de-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8"
    >
      {/* Gradient top border */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-de-blue to-de-blue-light opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-4 text-4xl">{benefit.emoji}</div>
      <h3 className="mb-3 text-lg font-bold text-de-blue-dark sm:text-xl">
        {benefit.title}
      </h3>
      <p className="text-sm leading-relaxed text-de-text-light sm:text-base">
        {benefit.description}
      </p>
    </motion.div>
  );
}

export function Benefits() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section id="beneficios" className="bg-de-bg-alt py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-2xl font-extrabold text-de-blue-dark sm:text-3xl md:text-4xl">
            ¿Por qué elegir Dimension Energy?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-de-text-light sm:text-lg">
            Nos dedicamos a encontrar la mejor tarifa de luz para tu hogar,
            para que solo te preocupes de lo que realmente importa.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
