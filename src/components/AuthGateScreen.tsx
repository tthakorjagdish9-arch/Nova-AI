import React, { useState } from 'react';
import {
  CheckCircle2,
  Gift,
  LifeBuoy,
  LogIn,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';
import NovaLogo from './NovaLogo';
import LanguageTranslatorMenu from './LanguageTranslatorMenu';
import { ASSET_REEL_TWILIGHT, ASSET_SOCIAL_PRODUCT } from '../data/templates';
import { UiTranslations } from '../data/i18n';
import { AppLanguage } from '../types/studio';
import { LegalDocType } from './LegalModal';

interface AuthGateScreenProps {
  t: UiTranslations;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onSignInWithEmail: (email: string, displayName?: string) => Promise<void>;
  onSignInAsDemo: () => Promise<void>;
  authError: string | null;
  onOpenSupport: () => void;
  onOpenLegal: (doc: LegalDocType) => void;
}

export default function AuthGateScreen({
  t,
  language,
  onChangeLanguage,
  darkMode,
  onToggleDark,
  onSignInWithEmail,
  onSignInAsDemo,
  authError,
  onOpenSupport,
  onOpenLegal,
}: AuthGateScreenProps) {
  const [authTab, setAuthTab] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSignInWithEmail(email, name);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setSubmitting(true);
    try {
      await onSignInAsDemo();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090C12] dark:text-slate-100 transition-colors">
      {/* Minimal Top Bar for Auth Gate */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#090C12]/80 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <NovaLogo className="text-lg text-slate-900 dark:text-slate-100" />

          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageTranslatorMenu
              language={language}
              onChangeLanguage={onChangeLanguage}
            />
            <button
              type="button"
              onClick={onToggleDark}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              type="button"
              onClick={onOpenSupport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.helpSupport}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Auth Hero */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Auth Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Gift className="w-4 h-4 shrink-0" />
              <span>{t.welcomeBonus}</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 text-balance leading-tight">
              {t.welcomeHeadline}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              {t.welcomeSubhead}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0F141D]/90 backdrop-blur-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/70">
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  authTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Create Account · 50 Free Credits
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  authTab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {authTab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-300">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {authTab === 'signup'
                    ? 'Create Account & Claim 50 Credits'
                    : 'Sign In to Workspace'}
                </span>
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="px-3 text-[11px] text-slate-400 bg-white dark:bg-[#0F141D] shrink-0">
                or
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            <button
              type="button"
              onClick={handleDemo}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090C12] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Instant Demo Access · 50 Free Credits</span>
            </button>

            <div className="space-y-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>AI Graphic Studio, 9:16 Video Reels &amp; Multi-Turn Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant browser workspace · No external API key required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual Studio Preview */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4 items-stretch">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] overflow-hidden shadow-lg flex flex-col">
            <div className="relative flex-1 min-h-[260px]">
              <img
                src={ASSET_SOCIAL_PRODUCT}
                alt="Nova AI graphic design preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-mono text-amber-300">
                  DESIGN STUDIO · 1080 × 1080
                </p>
                <p className="text-sm font-bold mt-0.5">
                  Layered Typography &amp; Vector Marks
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] overflow-hidden shadow-lg flex flex-col">
            <div className="relative flex-1 min-h-[260px]">
              <img
                src={ASSET_REEL_TWILIGHT}
                alt="Nova AI 9:16 vertical reel preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-mono text-indigo-300">
                  REEL STUDIO · 9:16 VERTICAL
                </p>
                <p className="text-sm font-bold mt-0.5">
                  Global AI Voices &amp; Auto-Captions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-[#090C12]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Nova AI · Built for global creators</p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={onOpenSupport}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {t.helpSupport}
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('refund')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Refund Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
