import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services';
import type { SupportedLanguage } from '../../types';

type FontSize = 'sm' | 'md' | 'lg';

export default function AccessibilityBar() {
  const { t, lang } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('gigw-font-size') as FontSize) || 'md');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('gigw-contrast') === 'high');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('gigw-font-size', fontSize);
    const sizes = { sm: '87.5%', md: '100%', lg: '112.5%' };
    document.documentElement.style.fontSize = sizes[fontSize];
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('gigw-contrast', highContrast ? 'high' : 'normal');
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLangToggle = async () => {
    const newLang: SupportedLanguage = lang === 'en' ? 'hi' : 'en';
    if (user) {
      await AuthService.updateUserProfile(user.uid, { language: newLang });
      await refreshProfile();
    } else {
      localStorage.setItem('gigw-lang', newLang);
    }
  };

  const sizeLabel: Record<FontSize, string> = { sm: 'A-', md: 'A', lg: 'A+' };

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Accessibility settings"
        title="Accessibility"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-[#0A2540] border border-white/10 rounded-xl shadow-2xl p-3 z-50 text-white text-xs space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 font-medium tracking-wide text-[10px] w-12">FONT</span>
            <div className="flex items-center gap-0.5">
              {(['sm', 'md', 'lg'] as FontSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    fontSize === s
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={`Font size ${s}`}
                >
                  {sizeLabel[s]}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors font-medium w-full ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {highContrast ? 'Normal Contrast' : 'High Contrast'}
          </button>
        </div>
      )}

      <span className="text-white/20 mx-1.5">|</span>

      <button
        onClick={handleLangToggle}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 transition-colors text-white/90"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {lang === 'en' ? 'हिन्दी' : 'English'}
      </button>
    </div>
  );
}
