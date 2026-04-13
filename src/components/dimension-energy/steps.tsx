'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    number: '01',
    title: 'Sube tu última factura',
    description:
      'Envíanos tu factura de luz actual a través de nuestro formulario. Aceptamos archivos en PDF, JPG o PNG. El proceso es rápido y seguro.',
    icon: '📤',
  },
  {
    number: '02',
    title: 'Recibe tu propuesta',
    description:
      'Nuestro equipo de expertos analiza tu consumo actual y te envía una propuesta personalizada con la mejor tarifa disponible en menos de 24 horas.',
    icon: '📊',
    badge: '⏱️ Respuesta en <24h',
  },
  {
    number: '03',
    title: 'Gestionamos el cambio',
    description:
      'Una vez aprobada la propuesta, nos encargamos de todo el proceso de cambio de comercializadora sin que tengas que hacer nada más.',
    icon: '✅',
  },
];

function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof steps)[number];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Connecting line (desktop only, between cards) */}
      {index < total - 1 && (
        <div className="absolute top-8 left-[calc(50%+2.5rem)] hidden h-0.5 w-[calc(100%-5rem)] bg-gradient-to-r from-de-blue/40 to-de-blue-light/40 md:block" />
      )}

      {/* Number circle */}
      <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-de-blue to-de-blue-light shadow-lg">
        <span className="text-xl font-bold text-white">{step.number}</span>
      </div>

      {/* Icon */}
      <div className="mb-3 text-3xl">{step.icon}</div>

      {/* Title */}
      <h3 className="mb-3 text-lg font-bold text-de-blue-dark sm:text-xl">
        {step.title}
      </h3>

      {/* Badge */}
      {step.badge && (
        <Badge className="mb-3 gap-1.5 rounded-full border-de-blue/20 bg-de-blue/10 px-3 py-1 text-de-blue">
          {step.badge}
        </Badge>
      )}

      {/* Description */}
      <p className="max-w-xs text-sm leading-relaxed text-de-text-light sm:text-base">
        {step.description}
      </p>
    </motion.div>
  );
}

export function Steps() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section id="pasos" className="bg-white py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-2xl font-extrabold text-de-blue-dark sm:text-3xl md:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-de-text-light sm:text-lg">
            Un proceso simple en 3 pasos. Te respondemos en menos de 24 horas con la mejor propuesta para tu hogar.
          </p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
