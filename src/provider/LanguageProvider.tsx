import React, { createContext, useState, useEffect } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n from '../locales/i18n';

interface LanguageContextType {
  language: string;
  changeLanguage: (lng: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  changeLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(i18n.language || 'es');

  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    document.documentElement.lang = lng;
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const { t } = useI18nTranslation();
  const { language, changeLanguage } = React.useContext(LanguageContext);
  return { t, language, changeLanguage };
}
