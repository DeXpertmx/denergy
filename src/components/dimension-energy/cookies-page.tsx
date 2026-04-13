'use client';

import React from 'react';
import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. ¿Qué son las cookies?',
    content: `Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita una página web. Sirven para recordar las preferencias del usuario, facilitar la navegación y recopilar información estadística sobre el uso del sitio.

Las cookies utilizadas en esta web no causan daño al dispositivo del usuario y no contienen información personal directamente identificable (excepto las que el usuario proporcione voluntariamente).`,
  },
  {
    title: '2. Tipos de cookies utilizadas',
    content: `Nuestra web utiliza los siguientes tipos de cookies:

a) Cookies necesarias (técnicas)
Son imprescindibles para el funcionamiento básico de la web. Permiten la navegación y el uso de funciones básicas como el acceso a áreas seguras. Sin estas cookies, la web no puede funcionar correctamente.
• Identificador de sesión
• Configuración de preferencias de cookies

b) Cookies analíticas
Nos ayudan a entender cómo los usuarios interactúan con la web recopilando información de forma anónima. Nos permiten mejorar la experiencia del usuario.
• Google Analytics: mide el tráfico y el comportamiento de los usuarios de forma anónima.
• Estadísticas de uso del sitio web

c) Cookies de marketing
Se utilizan para mostrar publicidad relevante y personalizar el contenido del usuario. Estas cookies son de terceros y se activan solo con el consentimiento del usuario.
• Cookies de redes sociales
• Remarketing y publicidad personalizada`,
  },
  {
    title: '3. Gestión de cookies',
    content: `El usuario puede gestionar y eliminar las cookies a través de las siguientes opciones:

• Banner de cookies: al acceder por primera vez a la web, aparece un banner que permite aceptar todas las cookies, rechazar las no esenciales o configurar las preferencias.
• Configuración del navegador: el usuario puede configurar su navegador para bloquear o eliminar cookies. A continuación, los enlaces a las instrucciones de los navegadores más comunes:
  - Chrome: chrome://settings/cookies
  - Firefox: about:preferences#privacy
  - Safari: Preferencias > Privacidad
  - Edge: edge://settings/privacy

La desactivación de cookies puede afectar a la funcionalidad de la web.`,
  },
  {
    title: '4. Cookies de terceros',
    content: `Algunas cookies utilizadas en nuestra web son gestionadas por terceros:

• Google Analytics: utiliza cookies para analizar el tráfico del sitio web. La información generada se transmite y se almacena en servidores de Google. Google puede utilizar estos datos para contextualizar y personalizar los anuncios de su red publicitaria.
• Redes sociales: los botones de compartir en redes sociales pueden instalar cookies de dichas plataformas cuando el usuario interactúa con ellos.

Puede consultar la política de privacidad y cookies de estos terceros en sus respectivas páginas web.`,
  },
  {
    title: '5. Base legal',
    content: `El uso de cookies en esta web se basa en:
• Cookies necesarias: se instalan en base al interés legítimo del responsable para garantizar el correcto funcionamiento del sitio web (Art. 6.1.f RGPD).
• Cookies analíticas y de marketing: se instalan previo consentimiento expreso del usuario (Art. 6.1.a RGPD y LSSI-CE).

El consentimiento se obtiene a través del banner de cookies que aparece en la primera visita, y puede ser revocado en cualquier momento a través de la configuración de cookies.`,
  },
  {
    title: '6. Actualizaciones',
    content: `Dimension Energy se reserva el derecho a actualizar esta política de cookies para reflejar cambios en las cookies utilizadas o por requisitos legales. Recomendamos revisar esta política periódicamente.

Los cambios entrarán en vigor a partir de su publicación en esta página. El uso continuado del sitio web después de cualquier cambio implica la aceptación de la nueva política.

Si tiene dudas sobre nuestra política de cookies, puede contactarnos en energy@dimensionexpert.com.`,
  },
];

export function CookiesPage() {
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
            Política de Cookies
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
