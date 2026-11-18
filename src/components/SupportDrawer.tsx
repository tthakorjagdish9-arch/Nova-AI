import React, { useEffect, useState } from 'react';
import { CheckCircle2, LifeBuoy, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createLocalSupportTicket,
  listLocalSupportTickets,
} from '../lib/localStudioApi';
import { SupportTicketItem } from '../types/studio';

interface SupportDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportDrawer({ open, onClose }: SupportDrawerProps) {
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Export & Rendering');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] =
    useState<SupportTicketItem | null>(null);
  const [recentTickets, setRecentTickets] = useState<SupportTicketItem[]>([]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!open) return;
    setRecentTickets(listLocalSupportTickets(user?.email));
  }, [open, user?.email]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = createLocalSupportTicket({
      email: email.trim(),
      subject: subject.trim(),
      category,
      priority,
      message: message.trim(),
    });
    setSubmittedTicket(ticket);
    setRecentTickets((prev) => [ticket, ...prev]);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-drawer-title"
        className="w-full max-w-md h-full bg-white dark:bg-[#0F141D] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LifeBuoy className="w-4 h-4 text-indigo-500" />
            <h2
              id="support-drawer-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              Help &amp; Support
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close support drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our global creator support desk responds within 24 hours across North America, Europe, and Asia-Pacific timezones.
          </p>

          {submittedTicket && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Ticket #{submittedTicket.id} Logged
              </div>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-200/80">
                Confirmation saved for {submittedTicket.email}.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reply Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option>Export &amp; Rendering</option>
                  <option>AI Voice Synthesis</option>
                  <option>Billing &amp; Refunds</option>
                  <option>Account &amp; Sync</option>
                  <option>General Question</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of how we can help"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Details
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include browser, project dimensions, or steps to reproduce..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Support Ticket
            </button>
          </form>

          {recentTickets.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Your Recent Tickets
              </h3>
              {recentTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#090C12]/60 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {t.subject}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums shrink-0">
                      #{t.id} · {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.category} · {t.priority}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
