'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNavigation } from '@/store/navigation';

const faqItems = [
  {
    question: '¿Cuánto cuesta el servicio de Dimension Energy?',
    answer:
      'Nuestro servicio es completamente gratuito para el consumidor final. Nosotros recibimos una comisión de la comercializadora (GBP Energía) cuando gestionamos un cambio de tarifa. Nunca pagas nada extra en tu factura.',
  },
  {
    question: '¿Habrá cortes de suministro al cambiar de compañía?',
    answer:
      'No, en absoluto. El cambio de comercializadora no implica ningún corte de suministro. La luz y el gas siguen llegando a tu hogar sin interrupciones durante todo el proceso.',
  },
  {
    question: '¿Qué garantía tengo de que la nueva tarifa será mejor?',
    answer:
      'Realizamos un análisis detallado de tu perfil de consumo (potencia contratada, hábitos de uso, hora valle/hora punta) y comparamos todas las tarifas disponibles de GBP Energía. Si no encontramos una tarifa que suponga un ahorro real, te lo comunicaremos sin compromiso.',
  },
  {
    question: '¿Por qué necesitáis ver mi factura?',
    answer:
      'Para ofrecerte una propuesta personalizada y precisa, necesitamos analizar los datos reales de tu consumo: potencia contratada, consumo mensual, tarifa actual y comercializadora. Sin estos datos no podemos identificar la tarifa óptima para tu caso. Toda la información se trata de forma confidencial según nuestra política de privacidad.',
  },
  {
    question: '¿Existe permanencia con la nueva tarifa?',
    answer:
      'La mayoría de las tarifas que ofrecemos a través de GBP Energía no tienen permanencia. Si en algún momento encuentras una mejor opción, podrás cambiar sin penalizaciones. Te informaremos siempre de las condiciones antes de proceder.',
  },
  {
    question: '¿Cuánto tiempo tarda todo el proceso?',
    answer:
      'Desde que nos envías tu factura, te respondemos con una propuesta en menos de 24 horas. Una vez que la apruebas, el cambio de comercializadora se realiza en un plazo de 2 a 3 semanas, dependiendo de la compañía actual.',
  },
  {
    question: '¿Trabajáis con todas las comercializadoras?',
    answer:
      'Trabajamos principalmente con GBP Energía como comercializadora de referencia, ya que nos permite ofrecer las mejores condiciones del mercado para nuestros clientes. GBP Energía está registrada y regulada por la CNMC, garantizando un servicio seguro y de calidad.',
  },
  {
    question: '¿Qué hacéis con mis datos personales?',
    answer:
      'Tus datos se utilizan únicamente para gestionar tu solicitud de cambio de tarifa y contactarte con la propuesta. No compartimos tu información con terceros sin tu consentimiento. Todos los datos se almacenan de forma segura y puedes ejercer tus derechos de acceso, rectificación y supresión en cualquier momento. Consulta nuestra política de privacidad para más detalles.',
  },
  {
    question: '¿Qué formatos de factura aceptáis?',
    answer:
      'Aceptamos facturas en formato PDF, JPG y PNG. Puedes subirlas directamente a través de nuestro formulario o enviarlas por WhatsApp. El tamaño máximo es de 10MB.',
  },
  {
    question: '¿Qué es el perfilado de precios?',
    answer:
      'El perfilado de precios es un análisis que realizamos comparando tu consumo real con las diferentes tarifas disponibles. Tenemos en cuenta factores como la potencia contratada (P1 y P2), tu consumo horario, si tienes discriminación horaria y la estacionalidad de tu consumo. Esto nos permite identificar exactamente qué tarifa te ahorrará más dinero al mes.',
  },
];

export function FAQ() {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center md:mb-14"
        >
          <h1 className="mb-4 text-2xl font-extrabold text-de-blue-dark sm:text-3xl md:text-4xl">
            Preguntas Frecuentes
          </h1>
          <p className="text-base text-de-text-light sm:text-lg">
            Resolvemos tus dudas sobre nuestro servicio y el proceso de cambio de tarifa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-de-border"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-de-text hover:text-de-blue sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-de-text-light sm:text-base">
                  {item.answer.split('política de privacidad').length > 1 ? (
                    <>
                      {item.answer.split('política de privacidad')[0]}
                      <button
                        type="button"
                        onClick={() => navigate('privacidad')}
                        className="font-medium text-de-blue underline hover:text-de-blue-dark"
                      >
                        política de privacidad
                      </button>
                      {item.answer.split('política de privacidad')[1]}
                    </>
                  ) : (
                    item.answer
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
