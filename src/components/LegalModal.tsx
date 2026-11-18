import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'refund' | null;

interface LegalModalProps {
  docType: LegalDocType;
  onClose: () => void;
}

const LEGAL_CONTENT: Record<
  Exclude<LegalDocType, null>,
  { title: string; updated: string; sections: Array<{ heading: string; body: string }> }
> = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Effective November 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'When you sign in to Nova AI, we store your account identifier, display name, and email address strictly to authenticate your session and persist your graphic designs, reel scripts, chat history, and support tickets.',
      },
      {
        heading: '2. Creative Assets & AI Prompts',
        body: 'Prompts entered into the Graphic Design Studio, Short Video Reel Studio, or AI Chat are processed exclusively to generate your requested layouts, scripts, translations, and voiceover audio. Your saved studio projects remain private to your authenticated workspace.',
      },
      {
        heading: '3. Global Data Protection & Deletion',
        body: 'In compliance with GDPR, CCPA, and international privacy standards, you may delete individual projects directly from your Saved Work view or submit an account deletion request at any time through the Help & Support drawer.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: 'Effective November 2026',
    sections: [
      {
        heading: '1. Commercial Ownership',
        body: 'You retain full commercial rights to all graphic compositions, PNG/PDF exports, video scripts, and 9:16 vertical reel exports you create using Nova AI.',
      },
      {
        heading: '2. Acceptable Creative Use',
        body: 'Users agree not to synthesize deceptive impersonations, infringing trademarks, or unlawful content using the platform’s AI voiceover or design tools.',
      },
      {
        heading: '3. Service Availability',
        body: 'Nova AI provides cloud persistence and high-resolution client-side rendering. Scheduled maintenance windows are communicated in advance to active workspace members.',
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    updated: 'Effective November 2026',
    sections: [
      {
        heading: '1. 14-Day Global Satisfaction Guarantee',
        body: 'All paid studio plans include a 14-day unconditional refund window from the date of initial purchase or renewal. No lengthy questionnaires or hidden cancellation fees apply.',
      },
      {
        heading: '2. Fast Processing Across Currencies',
        body: 'Approved refunds are returned to your original payment method within 3 to 5 business days across USD, EUR, GBP, INR, and supported international cards.',
      },
      {
        heading: '3. How to Request a Refund',
        body: 'Open the Help & Support drawer, select "Billing & Refunds" as the topic, and include your account email. Our billing team processes requests within 24 hours.',
      },
    ],
  },
};

export default function LegalModal({ docType, onClose }: LegalModalProps) {
  if (!docType) return null;
  const doc = LEGAL_CONTENT[docType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <div>
              <h2
                id="legal-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                {doc.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {doc.updated}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal policy modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {doc.sections.map((section) => (
            <div key={section.heading} className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {section.heading}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
