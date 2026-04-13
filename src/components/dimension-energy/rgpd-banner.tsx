'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Settings, Cookie } from 'lucide-react';
import { useCookies } from '@/store/navigation';
import { useNavigation } from '@/store/navigation';
import { cn } from '@/lib/utils';

function SettingsPanel() {
  const { preferences, savePreferences, rejectAll } = useCookies();
  const analytics = preferences?.analytics ?? true;
  const [analyticsLocal, setAnalyticsLocal] = useState(analytics);
  const marketing = preferences?.marketing ?? true;
  const [marketingLocal, setMarketingLocal] = useState(marketing);

  const handleSave = () => {
    savePreferences(analyticsLocal, marketingLocal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="mt-4 rounded-xl bg-white p-5 shadow-lg ring-1 ring-de-border"
    >
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-4 w-4 text-de-blue" />
        <h3 className="text-sm font-semibold text-de-blue-dark">
          Configuración de cookies
        </h3>
      </div>

      <div className="space-y-4">
        {/* Necessary cookies */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-3">
            <Cookie className="h-4 w-4 text-de-text-light" />
            <div>
              <Label className="text-sm font-medium text-de-text">
                Cookies necesarias
              </Label>
              <p className="text-xs text-de-text-light">
                Imprescindibles para el funcionamiento del sitio.
              </p>
            </div>
          </div>
          <Switch checked={true} disabled className="opacity-60" />
        </div>

        {/* Analytics cookies */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-3">
            <Cookie className="h-4 w-4 text-de-text-light" />
            <div>
              <Label htmlFor="analytics-toggle" className="text-sm font-medium text-de-text">
                Cookies analíticas
              </Label>
              <p className="text-xs text-de-text-light">
                Nos ayudan a mejorar el sitio web.
              </p>
            </div>
          </div>
          <Switch
            id="analytics-toggle"
            checked={analyticsLocal}
            onCheckedChange={setAnalyticsLocal}
          />
        </div>

        {/* Marketing cookies */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-3">
            <Cookie className="h-4 w-4 text-de-text-light" />
            <div>
              <Label htmlFor="marketing-toggle" className="text-sm font-medium text-de-text">
                Cookies de marketing
              </Label>
              <p className="text-xs text-de-text-light">
                Para mostrarte contenido relevante.
              </p>
            </div>
          </div>
          <Switch
            id="marketing-toggle"
            checked={marketingLocal}
            onCheckedChange={setMarketingLocal}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={rejectAll}
          variant="outline"
          size="sm"
          className="flex-1 border-de-border text-de-text"
        >
          Rechazar no esenciales
        </Button>
        <Button
          onClick={handleSave}
          size="sm"
          className="flex-1 bg-de-blue hover:bg-de-blue-dark"
        >
          Guardar preferencias
        </Button>
      </div>
    </motion.div>
  );
}

export function RGPDBanner() {
  const {
    preferences,
    bannerVisible,
    showBanner,
    hideBanner,
    acceptAll,
    rejectAll,
    openSettings,
    settingsOpen,
    closeSettings,
  } = useCookies();
  const { navigate } = useNavigation();
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      showBanner();
    }, 1000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  useEffect(() => {
    setSettingsExpanded(settingsOpen);
  }, [settingsOpen]);

  const handleOpenSettings = () => {
    setSettingsExpanded(true);
    openSettings();
  };

  const handleCloseSettings = () => {
    setSettingsExpanded(false);
    closeSettings();
  };

  if (!bannerVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="mx-auto max-w-3xl">
          <div
            className={cn(
              'rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-de-border',
              settingsExpanded && 'pb-4'
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-de-blue/10">
                <Shield className="h-5 w-5 text-de-blue" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-de-blue-dark">
                  🍪 Respetamos tu privacidad
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-de-text-light">
                  Utilizamos cookies para mejorar tu experiencia. Puedes leer más en nuestra{' '}
                  <button
                    type="button"
                    onClick={() => {
                      navigate('cookies');
                      hideBanner();
                    }}
                    className="font-medium text-de-blue underline hover:text-de-blue-dark"
                  >
                    política de cookies
                  </button>{' '}
                  y{' '}
                  <button
                    type="button"
                    onClick={() => {
                      navigate('privacidad');
                      hideBanner();
                    }}
                    className="font-medium text-de-blue underline hover:text-de-blue-dark"
                  >
                    política de privacidad
                  </button>
                  .
                </p>
              </div>
            </div>

            {!settingsExpanded ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={acceptAll}
                  size="sm"
                  className="flex-1 bg-de-blue hover:bg-de-blue-dark"
                >
                  Aceptar todas
                </Button>
                <Button
                  onClick={rejectAll}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-de-border text-de-text"
                >
                  Rechazar no esenciales
                </Button>
                <Button
                  onClick={handleOpenSettings}
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-de-blue hover:bg-de-blue/5"
                >
                  ⚙️ Configurar
                </Button>
              </div>
            ) : (
              <SettingsPanel />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
