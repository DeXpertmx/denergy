'use client';

import React from 'react';
import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. Información legal',
    content: `En cumplimiento del deber de información recogido en la Ley 34/2002 de Servicios de la Sociedad de la Información y el Comercio Electrónico (LSSI-CE), se identifican los datos del titular de esta web:

Denominación: Dimension Energy
NIF/CIF: [A12345678]
Domicilio: [Dirección completa]
Correo electrónico: energy@dimensionexpert.com
Teléfono: 600 971 950
Comercializadora de referencia: GBP Energía`,
  },
  {
    title: '2. Objeto',
    content: `Dimension Energy es un servicio de intermediación que ayuda a los consumidores a optimizar su tarifa eléctrica a través de GBP Energía. Nuestra función consiste en analizar el consumo del usuario y encontrar la tarifa más adecuada dentro de la oferta de GBP Energía.

Esta web tiene como finalidad informativa y de captación de clientes para el servicio de optimización tarifaria.`,
  },
  {
    title: '3. Condiciones de uso',
    content: `El acceso y uso de esta web atribuye la condición de usuario e implica la aceptación plena de todas las condiciones incluidas en este aviso legal. El usuario se compromete a utilizar la web y sus servicios de conformidad con la ley, la moral, el orden público y las presentes condiciones.

El usuario es responsable de la veracidad y exactitud de los datos que facilite a través de los formularios de la web. Dimension Energy no se hace responsable de la inexactitud de los datos proporcionados por el usuario.`,
  },
  {
    title: '4. Propiedad intelectual e industrial',
    content: `Todos los contenidos de esta web (textos, imágenes, diseños, logos, iconos, gráficos, etc.) son propiedad de Dimension Energy o de sus legítimos titulares y están protegidos por las leyes de propiedad intelectual e industrial.

Queda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se pueda realizar con los contenidos de la web sin autorización expresa por escrito de Dimension Energy.

El diseño, la estructura y el código fuente de la web están protegidos por derechos de propiedad intelectual.`,
  },
  {
    title: '5. Naturaleza del servicio: intermediación',
    content: `Dimension Energy actúa como intermediario entre el consumidor final y la comercializadora GBP Energía. Nuestro servicio consiste en:

a) Recibir y analizar la factura eléctrica del usuario para conocer su perfil de consumo.
b) Comparar las tarifas disponibles de GBP Energía para encontrar la opción más económica.
c) Presentar una propuesta personalizada al usuario.
d) Gestionar, si el usuario lo aprueba, el proceso de cambio de comercializadora hacia GBP Energía.

Dimension Energy no es una comercializadora de energía eléctrica ni presta directamente servicios de suministro. El contrato de suministro se formaliza directamente entre el usuario y GBP Energía.`,
  },
  {
    title: '6. Naturaleza del servicio: sobre el precio',
    content: `Los precios y tarifas indicados en esta web son orientativos y pueden variar en función del perfil de consumo de cada usuario, las condiciones del mercado y la oferta vigente de GBP Energía en el momento de la solicitud.

La propuesta tarifaria final se comunicará al usuario de forma individualizada tras el análisis de su factura. Los precios pueden estar sujetos a impuestos y tasas reguladas aplicables en cada momento.

Dimension Energy se reserva el derecho a modificar los precios publicados sin previo aviso, aplicándose siempre el precio vigente en el momento de la contratación.`,
  },
  {
    title: '7. Naturaleza del servicio: sobre el ahorro',
    content: `Las estimaciones de ahorro presentadas por Dimension Energy se basan en el análisis comparativo entre la tarifa actual del usuario y las tarifas disponibles de GBP Energía. Estas estimaciones son orientativas y dependen de factores como:

• El consumo real del usuario durante el período analizado.
• Las condiciones de la tarifa actual (potencia, peajes de acceso, impuestos).
• Las fluctuaciones del mercado mayorista de energía.
• Los hábitos de consumo del usuario.

Dimension Energy no garantiza un ahorro mínimo o fijo. El ahorro real dependerá de las condiciones individuales de cada usuario y del mercado eléctrico en cada momento.`,
  },
  {
    title: '8. Naturaleza del servicio: gratuidad',
    content: `El servicio de análisis tarifario y asesoramiento ofrecido por Dimension Energy es gratuito para el consumidor final. Dimension Energy percibe una comisión de GBP Energía por cada cambio de comercializadora gestionado exitosamente.

Esta comisión no se traslada al usuario en forma de coste adicional ni se refleja en su factura eléctrica. El precio que el usuario paga es el tarifa estándar de GBP Energía aplicable a su perfil de consumo.`,
  },
  {
    title: '9. Limitación de responsabilidad',
    content: `Dimension Energy no se hace responsable de:
• Daños y perjuicios derivados del uso inadecuado de la web o de sus servicios.
• Interrupciones, fallos técnicos o errores en el funcionamiento de la web.
• Contenidos, productos o servicios de terceros accesibles a través de enlaces o referencias.
• Decisiones tomadas por el usuario basadas en la información proporcionada en la web.
• Variaciones en las tarifas o condiciones de GBP Energía posteriores a la aceptación de la propuesta.
• Incumplimientos por parte de GBP Energía de sus obligaciones contractuales con el usuario.

Dimension Energy realiza sus mejores esfuerzos para garantizar la exactitud y actualización de la información, pero no puede garantizar que la misma sea completa, exacta o actualizada en todo momento.`,
  },
  {
    title: '10. Enlaces a terceros',
    content: `Esta web puede contener enlaces a sitios web de terceros. Estos enlaces se incluyen por motivos informativos y no implican necessarily aprobación, asociación o responsabilidad por los contenidos de dichos sitios.

Dimension Energy no se hace responsable del contenido, la política de privacidad, las prácticas o las opiniones de los sitios web de terceros. El acceso a sitios de terceros se realiza bajo la responsabilidad exclusiva del usuario.`,
  },
  {
    title: '11. Protección de datos',
    content: `Para el tratamiento de datos personales, Dimension Energy se rige por su Política de Privacidad, que forma parte integrante de las presentes condiciones de uso.

Al utilizar los formularios de esta web, el usuario consiente el tratamiento de sus datos según lo establecido en la Política de Privacidad. El usuario puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición contactando a energy@dimensionexpert.com.`,
  },
  {
    title: '12. Resolución de conflictos y legislación aplicable',
    content: `Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia que pueda surgir del acceso o uso de esta web, las partes se someten a los Juzgados y Tribunales del domicilio del usuario, de conformidad con lo establecido en la Ley 7/2017, de 2 de noviembre, por la que se incorpora al ordenamiento jurídico español la Directiva 2013/11/UE del Parlamento Europeo y del Consejo, de 21 de mayo de 2013, relativa a la resolución alternativa de litigios en materia de consumo.

El usuario puede presentar reclamaciones a través de la plataforma europea de resolución de litigios en línea (ODR): https://ec.europa.eu/consumers/odr`,
  },
];

export function LegalPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-14"
        >
          <h1 className="mb-2 text-2xl font-extrabold text-de-blue-dark sm:text-3xl md:text-4xl">
            Aviso Legal y Términos de Uso
          </h1>
          <p className="text-sm text-de-text-light">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-lg font-bold text-de-blue-dark">
                {section.title}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-de-text-light">
                {section.content}
              </p>
            </section>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
