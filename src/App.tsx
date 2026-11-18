/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Coins,
  LifeBuoy,
  Loader2,
  LogOut,
  Moon,
  Shield,
  Sun,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import NovaLogo from './components/NovaLogo';
import AuthGateScreen from './components/AuthGateScreen';
import DesignStudio from './components/DesignStudio';
import ReelStudio from './components/ReelStudio';
import AiChatTab from './components/AiChatTab';
import TemplatesShowcase from './components/TemplatesShowcase';
import SavedProjectsView from './components/SavedProjectsView';
import AdminPanel from './components/AdminPanel';
import SupportDrawer from './components/SupportDrawer';
import LegalModal, { LegalDocType } from './components/LegalModal';
import LanguageTranslatorMenu from './components/LanguageTranslatorMenu';
import { TRANSLATIONS } from './data/i18n';
import {
  AppLanguage,
  DesignTemplate,
  SavedDesignProject,
  SavedReelProject,
} from './types/studio';

type WorkspaceTab =
  | 'design'
  | 'reel'
  | 'chat'
  | 'templates'
  | 'saved'
  | 'admin';

function StudioShell() {
  const {
    user,
    dbUser,
    loading,
    signInWithEmail,
    signInAsDemo,
    signOutUser,
    authError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('design');
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [supportOpen, setSupportOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  const [selectedTemplate, setSelectedTemplate] =
    useState<DesignTemplate | null>(null);
  const [loadedDesign, setLoadedDesign] = useState<SavedDesignProject | null>(
    null
  );
  const [loadedReel, setLoadedReel] = useState<SavedReelProject | null>(null);
  const [refreshSavedKey, setRefreshSavedKey] = useState(0);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSelectTemplate = (tpl: DesignTemplate) => {
    setLoadedDesign(null);
    setSelectedTemplate({ ...tpl, layers: structuredClone(tpl.layers) });
    setActiveTab('design');
  };

  const handleOpenSavedDesign = (design: SavedDesignProject) => {
    setSelectedTemplate(null);
    setLoadedDesign(design);
    setActiveTab('design');
  };

  const handleOpenSavedReel = (reel: SavedReelProject) => {
    setLoadedReel(reel);
    setActiveTab('reel');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090C12] text-slate-500">
        <div className="flex items-center gap-3 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading Nova AI...</span>
        </div>
      </div>
    );
  }

  // Login / Sign-Up screen appears first for unauthenticated visitors
  if (!user) {
    return (
      <>
        <AuthGateScreen
          t={t}
          language={language}
          onChangeLanguage={setLanguage}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((prev) => !prev)}
          onSignInWithEmail={signInWithEmail}
          onSignInAsDemo={signInAsDemo}
          authError={authError}
          onOpenSupport={() => setSupportOpen(true)}
          onOpenLegal={(doc) => setLegalDoc(doc)}
        />
        <SupportDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />
        <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />
      </>
    );
  }

  const navItems: Array<{ id: WorkspaceTab; label: string }> = [
    { id: 'design', label: t.navDesign },
    { id: 'reel', label: t.navReel },
    { id: 'chat', label: t.navChat },
    { id: 'templates', label: t.navTemplates },
    { id: 'saved', label: t.navSaved },
  ];

  const isAdmin = dbUser?.role === 'admin';
  const credits = dbUser?.credits ?? 50;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090C12] dark:text-slate-100 transition-colors duration-200">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#090C12]/85 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Nova AI Brand Wordmark & Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className="text-lg text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            <NovaLogo size={26} />
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary studio navigation"
            className="hidden md:flex items-center gap-6"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    active
                      ? 'border-indigo-500 text-slate-900 dark:text-slate-100'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={signOutUser}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="max-w-[130px] truncate">
                {user.displayName || user.email}
              </span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Workspace Utility Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              {activeTab === 'design' && t.titleDesign}
              {activeTab === 'reel' && t.titleReel}
              {activeTab === 'chat' && t.titleChat}
              {activeTab === 'templates' && t.titleTemplates}
              {activeTab === 'saved' && t.titleSaved}
              {activeTab === 'admin' && t.titleAdmin}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'design' && t.descDesign}
              {activeTab === 'reel' && t.descReel}
              {activeTab === 'chat' && t.descChat}
              {activeTab === 'templates' && t.descTemplates}
              {activeTab === 'saved' && t.descSaved}
              {activeTab === 'admin' && t.descAdmin}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Live Welcome Credits Readout */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-xs font-medium text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {credits} {t.creditsLabel}
              </span>
            </div>

            {/* Language Translator Globe */}
            <LanguageTranslatorMenu
              language={language}
              onChangeLanguage={setLanguage}
            />

            {/* Admin Panel Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'admin'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.adminPanel}</span>
              </button>
            )}

            {/* Theme Switch */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={
                darkMode ? 'Switch to light theme' : 'Switch to dark theme'
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Help & Support */}
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.helpSupport}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {authError && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-300">
            {authError}
          </div>
        )}

        {/* Active Studio View */}
        {activeTab === 'design' && (
          <DesignStudio
            initialTemplate={selectedTemplate}
            initialSavedDesign={loadedDesign}
            onRequestAuth={signInAsDemo}
            onSavedSuccess={() => setRefreshSavedKey((k) => k + 1)}
          />
        )}

        {activeTab === 'reel' && (
          <ReelStudio
            initialSavedReel={loadedReel}
            onRequestAuth={signInAsDemo}
            onSavedSuccess={() => setRefreshSavedKey((k) => k + 1)}
          />
        )}

        {activeTab === 'chat' && <AiChatTab />}

        {activeTab === 'templates' && (
          <TemplatesShowcase onSelectTemplate={handleSelectTemplate} />
        )}

        {activeTab === 'saved' && (
          <SavedProjectsView
            refreshTrigger={refreshSavedKey}
            onOpenDesign={handleOpenSavedDesign}
            onOpenReel={handleOpenSavedReel}
            onSwitchToDesign={() => setActiveTab('design')}
            onSwitchToReel={() => setActiveTab('reel')}
          />
        )}

        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Trust & Legal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-[#090C12] mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Nova AI · Designed for global creators</p>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap"
            >
              {t.helpSupport}
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('privacy')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('terms')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('refund')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap"
            >
              Refund Policy
            </button>
          </div>
        </div>
      </footer>

      <SupportDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />
      <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error?.message || 'Unexpected rendering error.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090C12] p-6">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] p-6 space-y-4 text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Nova AI Recovery
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <StudioShell />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
