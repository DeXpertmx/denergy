'use client';

import React from 'react';
import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. Responsable del tratamiento',
    content: `El responsable del tratamiento de los datos personales recogidos en esta web es Dimension Energy, con NIF/CIF [A12345678], domiciliada en [Dirección completa], y correo electrónico energy@dimensionexpert.com. El responsable actúa en calidad de intermediario entre el consumidor final y la comercializadora GBP Energía para la optimización de tarifas eléctricas.`,
  },
  {
    title: '2. Datos personales que recopilamos',
    content: `Recopilamos los siguientes datos personales:
• Nombre y apellidos
• Dirección de correo electrónico
• Número de teléfono / WhatsApp
• Datos de la factura eléctrica (titular, CUPS, dirección de suministro, comercializadora actual, tarifa actual, potencia contratada, consumo e importe)
• Dirección postal de suministro

Estos datos se proporcionan voluntariamente por el usuario a través de los formularios de contacto y de subida de factura.`,
  },
  {
    title: '3. Finalidad del tratamiento',
    content: `Los datos personales se tratan con las siguientes finalidades:
• Analizar la factura eléctrica del usuario para identificar oportunidades de ahorro.
• Elaborar una propuesta personalizada de tarifa eléctrica a través de GBP Energía.
• Gestionar el proceso de cambio de comercializadora cuando el usuario lo apruebe.
• Enviar comunicaciones relacionadas con el servicio contratado.
• Atender consultas y solicitudes de información.
• Cumplir con las obligaciones legales aplicables.

Los datos no serán utilizados para fines distintos a los indicados sin consentimiento previo del usuario.`,
  },
  {
    title: '4. Base legal del tratamiento',
    content: `El tratamiento de los datos personales se basa en:
• El consentimiento del interesado (Art. 6.1.a RGPD) para el análisis de la factura y envío de propuestas.
• La ejecución de un contrato o precontrato (Art. 6.1.b RGPD) cuando el usuario solicita el cambio de comercializadora.
• El interés legítimo del responsable (Art. 6.1.f RGPD) para la gestión de la relación comercial.
• El cumplimiento de obligaciones legales (Art. 6.1.c RGPD).`,
  },
  {
    title: '5. Destinatarios de los datos',
    content: `Los datos personales podrán ser comunicados a:
• GBP Energía: como comercializadora de referencia para la gestión del cambio de tarifa y la formalización del contrato de suministro.
• Proveedores de servicios técnicos: necesarios para el funcionamiento de la web y la prestación del servicio (alojamiento, gestión de envíos de email, etc.), siempre bajo acuerdos de confidencialidad.
• Administraciones públicas: cuando sea necesario para el cumplimiento de obligaciones legales.

No se realizarán transferencias internacionales de datos a terceros países sin las garantías adecuadas.`,
  },
  {
    title: '6. Plazo de conservación de los datos',
    content: `Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos:
• Datos de contacto: se conservarán mientras exista un interés legítimo o se mantenga la relación comercial.
• Datos de la factura y del suministro: se conservarán durante la vigencia del contrato de suministro y hasta 5 años después de su finalización por obligaciones legales.
• Datos relativos al consentimiento: se conservarán hasta que el usuario retire su consentimiento.
• Datos de comunicaciones: se conservarán durante un máximo de 2 años.

Una vez transcurridos los plazos de conservación, los datos serán eliminados de forma segura.`,
  },
  {
    title: '7. Derechos del interesado',
    content: `El usuario tiene derecho a ejercer los siguientes derechos sobre sus datos personales:
• Acceso: solicitar información sobre los datos que tratamos.
• Rectificación: corregir datos inexactos o incompletos.
• Supresión: solicitar la eliminación de sus datos (derecho al olvido).
• Limitación: solicitar la limitación del tratamiento en determinadas circunstancias.
• Oposición: oponerse al tratamiento de sus datos por motivos legítimos.
• Portabilidad: recibir sus datos en formato estructurado y de uso común.
• Revocar el consentimiento: en cualquier momento, sin afectar a la licitud del tratamiento previo.

Para ejercer estos derechos, el usuario puede contactar a través de energy@dimensionexpert.com. El plazo de respuesta es de un mes desde la recepción de la solicitud.`,
  },
  {
    title: '8. Medidas de seguridad',
    content: `Dimension Energy adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad de los datos personales, incluyendo:
• Cifrado de comunicaciones mediante protocolo HTTPS.
• Control de acceso a los datos con sistemas de autenticación.
• Copias de seguridad periódicas y plan de recuperación.
• Formación del personal en protección de datos.
• Revisión periódica de las medidas de seguridad implementadas.

A pesar de adoptar estas medidas, ningún sistema de transmisión por Internet es 100% seguro. No podemos garantizar la seguridad absoluta de la información transmitida.`,
  },
  {
    title: '9. Protección de menores',
    content: `Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos conscientemente datos personales de menores. Si un menor ha proporcionado datos personales sin consentimiento paterno, los padres o tutores pueden contactarnos para solicitar su eliminación inmediata.`,
  },
  {
    title: '10. Modificaciones de la política de privacidad',
    content: `Dimension Energy se reserva el derecho a modificar esta política de privacidad para adaptarla a novedades legislativas o cambios en el servicio. Las modificaciones entrarán en vigor a partir de su publicación en esta página.

Recomendamos revisar esta política periódicamente. El uso continuado de la web después de la publicación de cambios implica la aceptación de los mismos.`,
  },
];

export function PrivacyPage() {
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
            Política de Privacidad
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
