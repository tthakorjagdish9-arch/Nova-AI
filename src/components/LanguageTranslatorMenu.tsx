import React, { useEffect, useRef, useState } from 'react';
import { Check, Globe, Languages } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../data/i18n';
import { translateDemoText } from '../lib/localStudioApi';
import { AppLanguage } from '../types/studio';

interface LanguageTranslatorMenuProps {
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
}

export default function LanguageTranslatorMenu({
  language,
  onChangeLanguage,
}: LanguageTranslatorMenuProps) {
  const [open, setOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const currentLang =
    LANGUAGE_OPTIONS.find((l) => l.code === language) ?? LANGUAGE_OPTIONS[0];

  const handleTranslateText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;
    setTranslatedText(translateDemoText(sourceText, targetLang));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language translator globe"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
        <span className="uppercase font-mono">{currentLang.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] shadow-2xl p-4 z-50 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Interface Language
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    onChangeLanguage(opt.code);
                    setTargetLang(opt.label);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                    language === opt.code
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{opt.nativeName}</span>
                  {language === opt.code && (
                    <Check className="w-3 h-3 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Translator</span>
            </div>

            <form onSubmit={handleTranslateText} className="space-y-2">
              <textarea
                rows={2}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste a hook, caption, or tagline..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
              <div className="flex items-center gap-2">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.code} value={l.label}>
                      {l.label} ({l.nativeName})
                    </option>
                  ))}
                  <option value="Portuguese">Portuguese</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Korean">Korean</option>
                </select>
                <button
                  type="submit"
                  disabled={!sourceText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium whitespace-nowrap"
                >
                  Translate
                </button>
              </div>
            </form>

            {translatedText && (
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#090C12] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                {translatedText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
