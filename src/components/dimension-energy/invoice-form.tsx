'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Zap, AlertCircle } from 'lucide-react';
import { useNavigation } from '@/store/navigation';
import { cn } from '@/lib/utils';

interface InvoiceFormProps {
  onFileSelected: (file: File, formData: InvoiceFormData) => void;
}

export interface InvoiceFormData {
  nombre: string;
  email: string;
  whatsapp: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export function InvoiceForm({ onFileSelected }: InvoiceFormProps) {
  const { navigate } = useNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = useCallback(() => {
    setNombre('');
    setEmail('');
    setWhatsapp('');
    setPrivacyAccepted(false);
    setFile(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  React.useImperativeHandle(
    React.useRef(null),
    () => ({ resetForm }),
    [resetForm]
  );

  const validateFile = (f: File): string | null => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(f.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
      return 'Formato no válido. Sube un archivo PDF, JPG o PNG.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'El archivo supera el límite de 10MB.';
    }
    return null;
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
    setErrorMessage('');
    if (f) {
      const error = validateFile(f);
      if (error) {
        setErrorMessage(error);
        setFile(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileChange(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!file) {
      setErrorMessage('Por favor, sube tu factura.');
      return;
    }
    if (!nombre.trim()) {
      setErrorMessage('Por favor, introduce tu nombre.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Por favor, introduce un email válido.');
      return;
    }
    if (!privacyAccepted) {
      setErrorMessage('Debes aceptar la política de privacidad.');
      return;
    }

    onFileSelected(file, { nombre: nombre.trim(), email: email.trim(), whatsapp: whatsapp.trim() });
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section id="formulario" className="bg-de-bg-alt py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-2xl font-extrabold text-de-blue-dark sm:text-3xl md:text-4xl">
            Comienza a ahorrar hoy
          </h2>
          <p className="text-base text-de-text-light sm:text-lg">
            Sube tu factura y te enviaremos una propuesta personalizada sin compromiso.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-de-border sm:p-8">
          {/* Shimmer top border */}
          <div className="absolute left-0 right-0 top-0 h-1 de-shimmer" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre y apellidos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border-de-border focus-visible:ring-de-blue"
              />
            </div>

            {/* Email & WhatsApp */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-de-border focus-visible:ring-de-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp <span className="text-de-text-light">(opcional)</span></Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="600 000 000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="border-de-border focus-visible:ring-de-blue"
                />
              </div>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label>Tu factura de luz</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors sm:p-8',
                  isDragging
                    ? 'border-de-blue bg-de-blue/5'
                    : file
                    ? 'border-de-success/50 bg-de-success/5'
                    : 'border-de-border hover:border-de-blue/50 hover:bg-de-blue/5'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />

                {file ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-de-success" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-de-text">{file.name}</p>
                      <p className="text-xs text-de-text-light">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="rounded-full p-1 text-de-text-light transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-de-blue/10">
                      <Upload className="h-6 w-6 text-de-blue" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-de-text">
                        Arrastra tu factura aquí o{' '}
                        <span className="text-de-blue underline">busca un archivo</span>
                      </p>
                      <p className="mt-1 text-xs text-de-text-light">
                        PDF, JPG o PNG — Máximo 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error message */}
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

            {/* Privacy */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-0.5 border-de-border data-[state=checked]:bg-de-blue data-[state=checked]:border-de-blue"
              />
              <Label htmlFor="privacy" className="text-xs leading-relaxed text-de-text-light sm:text-sm">
                Acepto la{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('privacidad');
                  }}
                  className="font-medium text-de-blue underline hover:text-de-blue-dark"
                >
                  política de privacidad
                </button>{' '}
                y consiento el tratamiento de mis datos para recibir la propuesta tarifaria.
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 bg-de-blue py-6 text-base hover:bg-de-blue-dark sm:text-lg"
            >
              <Zap className="h-5 w-5" />
              Analizar mi factura
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
