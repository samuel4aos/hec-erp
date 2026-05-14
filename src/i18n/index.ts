import { create } from 'zustand';

export type Lang = 'en' | 'yo' | 'ha' | 'ig' | 'fr';

const LANGS: Record<Lang, string> = {
  en: 'English',
  yo: 'Yorùbá',
  ha: 'Hausa',
  ig: 'Igbo',
  fr: 'Français',
};

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: any = {};

const langFiles: Record<Lang, () => Promise<any>> = {
  en: () => import('./en.json'),
  yo: () => import('./yo.json'),
  ha: () => import('./ha.json'),
  ig: () => import('./ig.json'),
  fr: () => import('./fr.json'),
};

async function loadLang(l: Lang) {
  if (translations[l]) return;
  try {
    const mod = await langFiles[l]();
    translations[l] = mod.default;
  } catch {
    translations[l] = {};
  }
}

// Preload English
loadLang('en');

export const useI18n = create<I18nState>((set, get) => ({
  lang: 'en',
  setLang: async (l: Lang) => {
    await loadLang(l);
    set({ lang: l });
  },
  t: (key: string) => {
    const { lang } = get();
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  },
}));

export { LANGS };
