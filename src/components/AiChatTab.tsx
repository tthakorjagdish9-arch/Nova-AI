import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  addLocalChatMessage,
  clearLocalChatMessages,
  generateDemoChatReply,
  listLocalChatMessages,
} from '../lib/localStudioApi';
import { ChatMessageItem } from '../types/studio';

const MODES = [
  'Creative Studio',
  'Viral Hook Writer',
  'Brand & Copywriter',
  'Design Critique',
];

const STARTER_PROMPTS = [
  'Write 5 scroll-stopping 3-second hooks for a minimalist desk setup reel',
  'Suggest a deep obsidian and warm amber color palette with typography pairings',
  'Draft punchy Instagram carousel copy for a new SaaS productivity launch',
  'Give me a 4-scene storyboard structure for a 20-second product reveal',
];

export default function AiChatTab() {
  const { user, spendCredits } = useAuth();

  const [mode, setMode] = useState(MODES[0]);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(listLocalChatMessages(user?.email));
  }, [user?.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!spendCredits(1)) {
      setError('Insufficient credits. Grant more credits in the Admin Panel.');
      return;
    }

    const text = input.trim();
    setInput('');
    setError(null);

    const userMsg = addLocalChatMessage({
      role: 'user',
      content: text,
      mode,
      ownerEmail: user?.email,
    });

    const replyText = generateDemoChatReply(text, mode);
    const assistantMsg = addLocalChatMessage({
      role: 'assistant',
      content: replyText,
      mode,
      ownerEmail: user?.email,
    });

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  };

  const handleClear = () => {
    clearLocalChatMessages(user?.email);
    setMessages([]);
  };

  const handleCopy = (id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Mode & Prompt Rail */}
      <aside className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md p-4 space-y-5">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Assistant Focus
          </h2>
          <div className="space-y-1.5">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  mode === m
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 space-y-2">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Prompt Starters
          </p>
          {STARTER_PROMPTS.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => setInput(starter)}
              className="w-full text-left text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-500 p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/40 transition-colors"
            >
              {starter}
            </button>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">1 credit per reply</span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-rose-500 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Chat
            </button>
          )}
        </div>
      </aside>

      {/* Main Chat Thread */}
      <section className="lg:col-span-9 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md flex flex-col h-[620px]">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Nova AI Chat · {mode}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {messages.length} messages
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Start a Creative Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask Nova AI to draft viral reel hooks, refine brand typography, brainstorm poster copy, or review your campaign angle.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-[#090C12] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800/80 text-[11px] text-slate-500">
                      <span>{msg.mode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Nova AI (${mode})...`}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}
