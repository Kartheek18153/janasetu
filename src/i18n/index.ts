import { useAuth } from '../context/AuthContext';
import type { SupportedLanguage } from '../types';
import en from './en';
import hi from './hi';
import gu from './gu';
import mr from './mr';
import ta from './ta';
import te from './te';
import bn from './bn';

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en, hi, gu, mr, ta, te, bn,
};

export function t(key: string, lang: SupportedLanguage = 'en', params?: Record<string, string>): string {
  const dict = translations[lang] || en;
  let text = dict[key] || en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

export function useTranslation() {
  const { user } = useAuth();
  const lang = (user?.language || 'en') as SupportedLanguage;
  return { t: (key: string, params?: Record<string, string>) => t(key, lang, params), lang };
}

export { en, hi, gu, mr, ta, te, bn };
