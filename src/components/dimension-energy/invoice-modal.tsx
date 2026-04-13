'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExtractedInvoiceData {
  titular: string;
  cups: string;
  direccion: string;
  comercializadoraActual: string;
  tarifaActual: string;
  potenciaP1: string;
  potenciaP2: string;
  consumoMensual: string;
  importeTotal: string;
  fechaFactura: string;
  periodoFacturacion: string;
}

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  extractedData: ExtractedInvoiceData | null;
  onConfirm: (data: ExtractedInvoiceData) => void;
}

const fields: { key: keyof ExtractedInvoiceData; label: string; full?: boolean; placeholder: string }[] = [
  { key: 'titular', label: 'Titular', placeholder: 'Nombre del titular' },
  { key: 'cups', label: 'CUPS', placeholder: 'ES00XXXXXXXXXXXXXX' },
  { key: 'direccion', label: 'Dirección', full: true, placeholder: 'Calle, número, piso, ciudad' },
  { key: 'comercializadoraActual', label: 'Comercializadora actual', placeholder: 'Nombre de la comercializadora' },
  { key: 'tarifaActual', label: 'Tarifa actual', placeholder: 'Ej: 2.0TD, 3.0TD' },
  { key: 'potenciaP1', label: 'Potencia P1 (kW)', placeholder: 'Ej: 4.4' },
  { key: 'potenciaP2', label: 'Potencia P2 (kW)', placeholder: 'Ej: 1.1' },
  { key: 'consumoMensual', label: 'Consumo mensual (kWh)', placeholder: 'Ej: 350' },
  { key: 'importeTotal', label: 'Importe total (€)', placeholder: 'Ej: 85.30' },
  { key: 'fechaFactura', label: 'Fecha factura', placeholder: 'DD/MM/AAAA' },
  { key: 'periodoFacturacion', label: 'Período facturación', placeholder: 'Ej: 01/03/2025 - 31/03/2025' },
];

export function InvoiceModal({ open, onClose, extractedData, onConfirm }: InvoiceModalProps) {
  const isProcessing = extractedData === null;

  // Track user edits on top of extractedData — avoids stale state
  const [localEdits, setLocalEdits] = useState<Partial<ExtractedInvoiceData>>({});

  const handleDialogChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setLocalEdits({});
      onClose();
    }
  }, [onClose]);

  const formData: ExtractedInvoiceData = useMemo(() => {
    const base = extractedData ?? {
      titular: '',
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
    };
    return { ...base, ...localEdits };
  }, [extractedData, localEdits]);

  const handleChange = (key: keyof ExtractedInvoiceData, value: string) => {
    setLocalEdits((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        {isProcessing ? (
          <>
            <DialogTitle className="sr-only">Analizando tu factura</DialogTitle>
            <DialogDescription className="sr-only">
              Extrayendo datos de la factura de electricidad
            </DialogDescription>
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-de-blue/20" style={{ animation: 'pulse-ring 2s ease-in-out infinite' }} />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-de-blue">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-lg font-bold text-de-blue-dark">
                  Analizando tu factura...
                </h3>
                <p className="text-sm text-de-text-light">
                  Estamos extrayendo los datos de tu factura. Esto puede tardar unos segundos.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl text-de-blue-dark">
                Datos extraídos de tu factura
              </DialogTitle>
              <DialogDescription className="text-sm text-de-text-light">
                Revisa y edita los datos extraídos antes de confirmar.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 p-6 pt-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className={cn(field.full ? 'sm:col-span-2' : '')}
                >
                  <Label
                    htmlFor={`invoice-${field.key}`}
                    className="mb-1.5 text-xs font-medium text-de-text"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={`invoice-${field.key}`}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="border-de-border text-sm focus-visible:ring-de-blue"
                  />
                </div>
              ))}
            </div>

            <DialogFooter className="border-t border-de-border p-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-de-border text-de-text"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                className="gap-2 bg-de-blue hover:bg-de-blue-dark"
              >
                ✓ Confirmar y enviar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
