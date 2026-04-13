'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Phone,
  Clock,
  Building2,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useNavigation } from '@/store/navigation';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'energy@dimensionexpert.com',
    href: 'mailto:energy@dimensionexpert.com',
  },
  {
    icon: Phone,
    label: 'Teléfono / WhatsApp',
    value: '600 971 950',
    href: 'https://wa.me/34600971950',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'L-V 9:00-19:00, S 10:00-14:00',
    href: null,
  },
  {
    icon: Building2,
    label: 'Comercializadora',
    value: 'GBP Energía',
    href: null,
  },
];

export function Contact() {
  const { navigate } = useNavigation();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setErrorMessage('Por favor, completa todos los campos obligatorios.');
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

    setStatus('success');
  };

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setWhatsapp('');
    setAsunto('');
    setMensaje('');
    setPrivacyAccepted(false);
    setStatus('idle');
    setErrorMessage('');
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-de-success" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-2 text-2xl font-bold text-de-blue-dark">
              ¡Mensaje enviado!
            </h2>
            <p className="mb-6 text-de-text-light">
              Hemos recibido tu mensaje correctamente. Te responderemos lo antes posible.
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-de-blue/30 text-de-blue hover:bg-de-blue/5"
            >
              Enviar otro mensaje
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 lg:col-span-2"
          >
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="rounded-xl bg-de-bg-alt p-4 ring-1 ring-de-border"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-de-blue/10">
                    <info.icon className="h-5 w-5 text-de-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-de-text-light">
                      {info.label}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-de-blue hover:text-de-blue-dark"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-de-text">
                        {info.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-de-border sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-nombre">Nombre *</Label>
                    <Input
                      id="contact-nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="border-de-border focus-visible:ring-de-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-de-border focus-visible:ring-de-blue"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-whatsapp">
                      WhatsApp <span className="text-de-text-light">(opcional)</span>
                    </Label>
                    <Input
                      id="contact-whatsapp"
                      type="tel"
                      placeholder="600 000 000"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="border-de-border focus-visible:ring-de-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-asunto">Asunto</Label>
                    <Input
                      id="contact-asunto"
                      type="text"
                      placeholder="Asunto del mensaje"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className="border-de-border focus-visible:ring-de-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-mensaje">Mensaje *</Label>
                  <Textarea
                    id="contact-mensaje"
                    placeholder="Escribe tu mensaje aquí..."
                    rows={5}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="border-de-border focus-visible:ring-de-blue resize-none"
                  />
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="contact-privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                    className="mt-0.5 border-de-border data-[state=checked]:bg-de-blue data-[state=checked]:border-de-blue"
                  />
                  <Label htmlFor="contact-privacy" className="text-xs leading-relaxed text-de-text-light sm:text-sm">
                    Acepto la{' '}
                    <button
                      type="button"
                      onClick={() => navigate('privacidad')}
                      className="font-medium text-de-blue underline hover:text-de-blue-dark"
                    >
                      política de privacidad
                    </button>
                  </Label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-de-blue py-6 text-base hover:bg-de-blue-dark"
                >
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
