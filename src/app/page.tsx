'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from '@/store/navigation';
import { useCookies } from '@/store/navigation';
import { Navbar } from '@/components/dimension-energy/navbar';
import { Hero } from '@/components/dimension-energy/hero';
import { Benefits } from '@/components/dimension-energy/benefits';
import { Steps } from '@/components/dimension-energy/steps';
import { InvoiceForm } from '@/components/dimension-energy/invoice-form';
import type { InvoiceFormData } from '@/components/dimension-energy/invoice-form';
import { InvoiceModal } from '@/components/dimension-energy/invoice-modal';
import type { ExtractedInvoiceData } from '@/components/dimension-energy/invoice-modal';
import { FAQ } from '@/components/dimension-energy/faq';
// Contact form is handled by inline ContactInternal below
import { Footer } from '@/components/dimension-energy/footer';
import { PrivacyPage } from '@/components/dimension-energy/privacy-page';
import { CookiesPage } from '@/components/dimension-energy/cookies-page';
import { LegalPage } from '@/components/dimension-energy/legal-page';
import { RGPDBanner } from '@/components/dimension-energy/rgpd-banner';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Phone, Clock, Building2, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PageId } from '@/store/navigation';

export default function HomePage() {
  const { currentPage } = useNavigation();
  const { showBanner } = useCookies();
  const { toast } = useToast();

  // Invoice extraction flow state
  const [modalOpen, setModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFormData, setPendingFormData] = useState<InvoiceFormData | null>(null);



  // Hash navigation on load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') || 'inicio';
    const validPages: PageId[] = ['inicio', 'faq', 'contacto', 'privacidad', 'cookies', 'legal'];
    if (validPages.includes(hash as PageId)) {
      useNavigation.getState().navigate(hash as PageId);
    }
    // Show cookie banner
    setTimeout(() => showBanner(), 1000);
  }, [showBanner]);

  // Handle hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'inicio';
      const validPages: PageId[] = ['inicio', 'faq', 'contacto', 'privacidad', 'cookies', 'legal'];
      if (validPages.includes(hash as PageId)) {
        useNavigation.getState().navigate(hash as PageId);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ---- Invoice extraction flow ----
  const handleFileSelected = useCallback(async (file: File, formData: InvoiceFormData) => {
    setPendingFile(file);
    setPendingFormData(formData);
    setIsExtracting(true);
    setExtractedData(null);
    setModalOpen(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Call VLM extraction API
      const response = await fetch('/api/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setExtractedData({
          titular: result.data.titular || formData.nombre || '',
          cups: result.data.cups || '',
          direccion: result.data.direccion || '',
          comercializadoraActual: result.data.comercializadoraActual || result.data.comercializadora || result.data.comercializadora_actual || '',
          tarifaActual: result.data.tarifaActual || result.data.tarifa || result.data.tarifa_actual || '',
          potenciaP1: result.data.potenciaP1 || result.data.potencia_p1 || '',
          potenciaP2: result.data.potenciaP2 || result.data.potencia_p2 || '',
          consumoMensual: result.data.consumoMensual || result.data.consumo_mensual || '',
          importeTotal: result.data.importeTotal || result.data.importe_total || '',
          fechaFactura: result.data.fechaFactura || result.data.fecha_factura || '',
          periodoFacturacion: result.data.periodoFacturacion || result.data.periodo_facturacion || '',
        });
      } else {
        // Fallback: create empty form for manual entry
        setExtractedData({
          titular: formData.nombre,
          cups: '',
          direccion: '',
          comercializadoraActual: '',
          tarifaActual: '',
          potenciaP1: '',
          potenciaP2: '',
          consumoMensual: '',
          importeTotal: '',
          fechaFactura: '',
          periodoFacturacion: '',
        });
        toast({
          title: 'Extracción parcial',
          description: 'No se pudieron extraer todos los datos automáticamente. Completa los campos manualmente.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error extracting invoice:', error);
      // Fallback: create empty form for manual entry
      setExtractedData({
        titular: formData.nombre,
        cups: '',
        direccion: '',
        comercializadoraActual: '',
        tarifaActual: '',
        potenciaP1: '',
        potenciaP2: '',
        consumoMensual: '',
        importeTotal: '',
        fechaFactura: '',
        periodoFacturacion: '',
      });
      toast({
        title: 'Error en la extracción',
        description: 'No se pudo procesar la factura automáticamente. Completa los datos manualmente.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleInvoiceConfirm = useCallback(async (data: ExtractedInvoiceData) => {
    if (!pendingFile || !pendingFormData) return;

    setModalOpen(false);

    try {
      const base64 = await fileToBase64(pendingFile);

      const context = [
        'RESUMEN DE FACTURA ELÉCTRICA - Dimension Energy',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        `Titular: ${data.titular}`,
        `CUPS: ${data.cups}`,
        `Dirección: ${data.direccion}`,
        '',
        'CONTRATO ACTUAL',
        `Comercializadora: ${data.comercializadoraActual}`,
        `Tarifa: ${data.tarifaActual}`,
        `Fecha: ${data.fechaFactura}`,
        `Período: ${data.periodoFacturacion}`,
        '',
        'POTENCIAS',
        `P1: ${data.potenciaP1}`,
        `P2: ${data.potenciaP2}`,
        '',
        'CONSUMO',
        `Mensual: ${data.consumoMensual} kWh`,
        '',
        `IMPORTE TOTAL: ${data.importeTotal}`,
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Nota: El cliente ha solicitado perfilado de precios con GBP Energía.',
      ].join('\n');

      const payload = {
        lead: pendingFormData,
        invoice: {
          titular: data.titular,
          cups: data.cups,
          direccion: data.direccion,
          comercializadora: data.comercializadoraActual,
          tarifa: data.tarifaActual,
          potencia_p1: data.potenciaP1,
          potencia_p2: data.potenciaP2,
          consumo_mensual: data.consumoMensual,
          importe_total: data.importeTotal,
          fecha_factura: data.fechaFactura,
          periodo_facturacion: data.periodoFacturacion,
          file_name: pendingFile.name,
          file_type: pendingFile.type,
          file_size: pendingFile.size,
          file_base64: base64,
        },
        context,
      };

      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Factura enviada correctamente',
          description: 'Te contactaremos por WhatsApp en menos de 24 horas.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Datos guardados localmente',
          description: 'Se han guardado tus datos. Te contactaremos pronto.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Error al enviar',
        description: 'Hubo un problema al enviar tus datos. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }

    // Reset state
    setPendingFile(null);
    setPendingFormData(null);
    setExtractedData(null);
    setIsExtracting(false);
  }, [pendingFile, pendingFormData, toast]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setPendingFile(null);
    setPendingFormData(null);
    setExtractedData(null);
    setIsExtracting(false);
  }, []);

  // ---- Contact form submission handler ----
  const handleContactSubmit = useCallback(async (data: {
    nombre: string;
    email: string;
    whatsapp: string;
    asunto: string;
    mensaje: string;
  }) => {
    try {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: data }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Mensaje enviado',
          description: 'Te responderemos lo antes posible.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Datos guardados',
          description: 'Hemos recibido tu mensaje.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
      toast({
        title: 'Error al enviar',
        description: 'Hubo un problema. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // ---- Render page sections ----
  const renderPage = () => {
    switch (currentPage) {
      case 'inicio':
        return (
          <motion.div
            key="inicio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Hero />
            <Benefits />
            <Steps />
            <InvoiceForm onFileSelected={handleFileSelected} />
            <Footer />
          </motion.div>
        );

      case 'faq':
        return (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FAQ />
            <Footer />
          </motion.div>
        );

      case 'contacto':
        return (
          <motion.div
            key="contacto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ContactWrapper onSubmit={handleContactSubmit} />
            <Footer />
          </motion.div>
        );

      case 'privacidad':
        return (
          <motion.div
            key="privacidad"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PrivacyPage />
            <Footer />
          </motion.div>
        );

      case 'cookies':
        return (
          <motion.div
            key="cookies"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CookiesPage />
            <Footer />
          </motion.div>
        );

      case 'legal':
        return (
          <motion.div
            key="legal"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LegalPage />
            <Footer />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>

      {/* Invoice extraction modal */}
      <InvoiceModal
        open={modalOpen}
        onClose={handleModalClose}
        extractedData={extractedData}
        onConfirm={handleInvoiceConfirm}
      />

      {/* RGPD Cookie Banner */}
      <RGPDBanner />
    </div>
  );
}

// ---- Helper components ----

// ContactWrapper extends Contact to actually submit to API
function ContactWrapper({ onSubmit }: { onSubmit: (data: {
  nombre: string;
  email: string;
  whatsapp: string;
  asunto: string;
  mensaje: string;
}) => void }) {
  return <ContactWithSubmit onSubmit={onSubmit} />;
}

// Extended Contact that uses the API
function ContactWithSubmit({ onSubmit }: { onSubmit: (data: {
  nombre: string;
  email: string;
  whatsapp: string;
  asunto: string;
  mensaje: string;
}) => void }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (data: {
    nombre: string;
    email: string;
    whatsapp: string;
    asunto: string;
    mensaje: string;
  }) => {
    setStatus('submitting');
    await onSubmit(data);
    setStatus('success');
  };

  if (status === 'submitting') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-de-blue" />
          <p className="text-sm text-de-text-light">Enviando mensaje...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <svg className="mx-auto mb-4 h-16 w-16 text-de-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-2 text-2xl font-bold text-de-blue-dark">Mensaje enviado</h2>
            <p className="mb-6 text-de-text-light">
              Hemos recibido tu mensaje. Te responderemos lo antes posible.
              Si es urgente, llámanos al 600 971 950.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="inline-flex items-center gap-2 rounded-full border-2 border-de-blue/30 px-6 py-3 text-sm font-medium text-de-blue transition-colors hover:bg-de-blue/5"
            >
              Enviar otro mensaje
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return <ContactInternal onSubmit={handleSubmit} />;
}

// Internal Contact form that calls onSubmit

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'energy@dimensionexpert.com', href: 'mailto:energy@dimensionexpert.com' },
  { icon: Phone, label: 'Teléfono / WhatsApp', value: '600 971 950', href: 'https://wa.me/34600971950' },
  { icon: Clock, label: 'Horario', value: 'L-V 9:00-19:00, S 10:00-14:00', href: null },
  { icon: Building2, label: 'Comercializadora', value: 'GBP Energía', href: null },
];

function ContactInternal({ onSubmit }: { onSubmit: (data: { nombre: string; email: string; whatsapp: string; asunto: string; mensaje: string }) => void }) {
  const { navigate } = useNavigation();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setErrorMessage('Por favor, completa los campos obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Por favor, introduce un email válido.');
      return;
    }
    if (!privacyAccepted) {
      setErrorMessage('Debes aceptar la política de privacidad.');
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      asunto: asunto.trim(),
      mensaje: mensaje.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center md:mb-14"
        >
          <h1 className="mb-4 text-2xl font-extrabold text-de-blue-dark sm:text-3xl md:text-4xl">
            Contacta con nosotros
          </h1>
          <p className="text-base text-de-text-light sm:text-lg">
            Estamos aquí para ayudarte. Envíanos un mensaje o contacta directamente.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 lg:col-span-2"
          >
            {contactInfo.map((info) => (
              <div key={info.label} className="rounded-xl bg-de-bg-alt p-4 ring-1 ring-de-border">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-de-blue/10">
                    <info.icon className="h-5 w-5 text-de-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-de-text-light">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-de-blue hover:text-de-blue-dark">
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-de-text">{info.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-de-border sm:p-8">
              <div className="absolute left-0 right-0 top-0 h-1 de-shimmer" />
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c-nombre">Nombre *</Label>
                    <Input id="c-nombre" type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="border-de-border focus-visible:ring-de-blue" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email *</Label>
                    <Input id="c-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="border-de-border focus-visible:ring-de-blue" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c-wa">WhatsApp</Label>
                    <Input id="c-wa" type="tel" placeholder="600 000 000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="border-de-border focus-visible:ring-de-blue" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-asunto">Asunto</Label>
                    <Input id="c-asunto" type="text" placeholder="¿En qué podemos ayudarte?" value={asunto} onChange={(e) => setAsunto(e.target.value)} className="border-de-border focus-visible:ring-de-blue" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-msg">Mensaje *</Label>
                  <Textarea id="c-msg" placeholder="Escribe tu mensaje aquí..." rows={5} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="border-de-border focus-visible:ring-de-blue resize-none" />
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox id="c-priv" checked={privacyAccepted} onCheckedChange={(checked) => setPrivacyAccepted(checked === true)} className="mt-0.5 border-de-border data-[state=checked]:bg-de-blue data-[state=checked]:border-de-blue" />
                  <Label htmlFor="c-priv" className="text-xs leading-relaxed text-de-text-light sm:text-sm">
                    Acepto la{' '}
                    <button type="button" onClick={() => navigate('privacidad')} className="font-medium text-de-blue underline hover:text-de-blue-dark">
                      política de privacidad
                    </button>.
                  </Label>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 bg-de-blue py-6 text-base hover:bg-de-blue-dark">
                  <Send className="h-5 w-5" />
                  Enviar mensaje
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Utility: convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
