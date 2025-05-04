import { useState, useEffect } from 'react';
import type { SystemPreferences, AccessibilitySettings } from '../types';

const defaultPreferences: SystemPreferences = {
  theme: 'system',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  language: 'pt-BR'
};

const defaultAccessibility: AccessibilitySettings = {
  screenReader: false,
  keyboardNavigation: true,
  animationSpeed: 'normal',
  contrastLevel: 'normal'
};

export function useSystemPreferences() {
  const [preferences, setPreferences] = useState<SystemPreferences>(() => {
    const saved = localStorage.getItem('systemPreferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    return saved ? JSON.parse(saved) : defaultAccessibility;
  });

  useEffect(() => {
    localStorage.setItem('systemPreferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(accessibility));
  }, [accessibility]);

  // Aplicar preferências ao documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Tamanho da fonte
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizes[preferences.fontSize];

    // Redução de movimento
    if (preferences.reducedMotion) {
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--transition-duration');
    }

    // Alto contraste
    if (preferences.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Tema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = preferences.theme === 'dark' || (preferences.theme === 'system' && prefersDark);
    
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [preferences]);

  return {
    preferences,
    setPreferences,
    accessibility,
    setAccessibility
  };
}