import { useState, useEffect } from 'react';
import type { SystemSettings, SystemPreferences, AccessibilitySettings } from '../types';

const SHOW_PRODUCT_IMAGES_KEY = 'showProductImages';

const defaultPreferences: SystemPreferences = {
  theme: 'system',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  language: 'pt-BR',
  store: {
    showProductImages: localStorage.getItem(SHOW_PRODUCT_IMAGES_KEY) !== 'false'
  }
};

const defaultAccessibility: AccessibilitySettings = {
  screenReader: false,
  keyboardNavigation: true,
  animationSpeed: 'normal',
  contrastLevel: 'normal'
};

export function useSystemSettings() {
  const [preferences, setPreferences] = useState<SystemPreferences>(() => {
    const saved = localStorage.getItem('systemPreferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('systemSettings');
    const defaultSettings: SystemSettings = {
      whatsApp: {
        number: '',
        messageTemplate: 'Olá! Seu pedido foi recebido:\n\n{items}\n\nTotal: R$ {total}\n\nObrigado pela preferência!',
        pickupAddress: {
          street: '',
          number: '',
          neighborhood: ''
        }
      },
      store: {
        subtitle: 'Sabor e tecnologia em cada pedido',
        showProductImages: true,
        instagramUrl: 'https://www.instagram.com/sistemasgermantech?igsh=MTdhYWowZjB2d3ZtYg==',
        businessHours: {
          'Segunda-feira': { open: '10:00', close: '22:00' },
          'Terça-feira': { open: '10:00', close: '22:00' },
          'Quarta-feira': { open: '10:00', close: '22:00' },
          'Quinta-feira': { open: '10:00', close: '22:00' },
          'Sexta-feira': { open: '10:00', close: '23:00' },
          'Sábado': { open: '10:00', close: '23:00' },
          'Domingo': { open: '12:00', close: '20:00' }
        },
        specialDates: []
      }
    };
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    return saved ? JSON.parse(saved) : defaultAccessibility;
  });

  useEffect(() => {
    localStorage.setItem('systemPreferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  const updateShowProductImages = (show: boolean) => {
    localStorage.setItem(SHOW_PRODUCT_IMAGES_KEY, String(show));
    setPreferences(prev => ({
      ...prev,
      store: {
        ...prev.store,
        showProductImages: show
      }
    }));
  };

  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(accessibility));
  }, [accessibility]);

  // Listen for storage events to sync settings across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SHOW_PRODUCT_IMAGES_KEY) {
        const show = e.newValue !== 'false';
        setPreferences(prev => ({
          ...prev,
          store: {
            ...prev.store,
            showProductImages: show
          }
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return {
    preferences,
    setPreferences,
    systemSettings,
    setSystemSettings,
    accessibility,
    setAccessibility,
    updateShowProductImages
  };
}