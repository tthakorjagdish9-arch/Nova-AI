import {
  ASSET_POSTER_ARCH,
  ASSET_REEL_STUDIO,
  ASSET_REEL_TWILIGHT,
  ASSET_SOCIAL_PRODUCT,
  REEL_BACKDROPS,
} from '../data/templates';
import {
  CaptionStyle,
  ChatMessageItem,
  DbUserProfile,
  DesignCategory,
  ReelScene,
  SavedDesignProject,
  SavedReelProject,
  SupportTicketItem,
  VoiceAccent,
} from '../types/studio';

const KEYS = {
  USERS: 'nova_ai_users_v1',
  ACTIVE_EMAIL: 'nova_ai_active_email_v1',
  DESIGNS: 'nova_ai_designs_v1',
  REELS: 'nova_ai_reels_v1',
  CHAT: 'nova_ai_chat_v1',
  TICKETS: 'nova_ai_tickets_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted browsers
  }
}

// ---------- Auth & Credits (localStorage) ----------

export function getActiveUser(): DbUserProfile | null {
  const email = window.localStorage.getItem(KEYS.ACTIVE_EMAIL);
  if (!email) return null;
  const users = safeRead<DbUserProfile[]>(KEYS.USERS, []);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function loginOrSignUpLocal(params: {
  email: string;
  displayName?: string;
}): DbUserProfile {
  const cleanEmail = params.email.trim().toLowerCase();
  const users = safeRead<DbUserProfile[]>(KEYS.USERS, []);
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    if (params.displayName?.trim()) {
      existing.displayName = params.displayName.trim();
      safeWrite(KEYS.USERS, users);
    }
    window.localStorage.setItem(KEYS.ACTIVE_EMAIL, existing.email);
    return existing;
  }

  const nextId =
    users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const newUser: DbUserProfile = {
    id: nextId,
    uid: `local-${nextId}-${Date.now()}`,
    email: cleanEmail,
    displayName:
      params.displayName?.trim() || cleanEmail.split('@')[0] || 'Nova Creator',
    photoUrl: null,
    credits: 50,
    role: users.length === 0 ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };

  const updated = [newUser, ...users];
  safeWrite(KEYS.USERS, updated);
  window.localStorage.setItem(KEYS.ACTIVE_EMAIL, newUser.email);
  return newUser;
}

export function logoutLocal(): void {
  window.localStorage.removeItem(KEYS.ACTIVE_EMAIL);
}

export function deductLocalCredits(
  email: string,
  amount: number
): DbUserProfile | null {
  const users = safeRead<DbUserProfile[]>(KEYS.USERS, []);
  let updatedUser: DbUserProfile | null = null;
  const next = users.map((u) => {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      updatedUser = { ...u, credits: Math.max(0, u.credits - amount) };
      return updatedUser;
    }
    return u;
  });
  safeWrite(KEYS.USERS, next);
  return updatedUser;
}

export function listAllLocalUsers(): DbUserProfile[] {
  return safeRead<DbUserProfile[]>(KEYS.USERS, []);
}

export function adminPatchLocalUser(
  id: number,
  patch: { credits?: number; role?: string }
): DbUserProfile | null {
  const users = safeRead<DbUserProfile[]>(KEYS.USERS, []);
  let updatedUser: DbUserProfile | null = null;
  const next = users.map((u) => {
    if (u.id === id) {
      updatedUser = {
        ...u,
        credits:
          typeof patch.credits === 'number'
            ? Math.max(0, Math.round(patch.credits))
            : u.credits,
        role:
          patch.role === 'admin' || patch.role === 'user' ? patch.role : u.role,
      };
      return updatedUser;
    }
    return u;
  });
  safeWrite(KEYS.USERS, next);
  return updatedUser;
}

// ---------- Designs CRUD ----------

export function listLocalDesigns(email?: string): SavedDesignProject[] {
  const all = safeRead<Array<SavedDesignProject & { ownerEmail?: string }>>(
    KEYS.DESIGNS,
    []
  );
  if (!email) return all;
  return all.filter(
    (d) => !d.ownerEmail || d.ownerEmail.toLowerCase() === email.toLowerCase()
  );
}

export function saveLocalDesign(
  input: Omit<SavedDesignProject, 'id'> & { id?: number; ownerEmail?: string }
): SavedDesignProject {
  const all = safeRead<Array<SavedDesignProject & { ownerEmail?: string }>>(
    KEYS.DESIGNS,
    []
  );
  const now = new Date().toISOString();

  if (input.id) {
    const idx = all.findIndex((d) => d.id === input.id);
    if (idx >= 0) {
      const updated = { ...all[idx], ...input, updatedAt: now };
      all[idx] = updated;
      safeWrite(KEYS.DESIGNS, all);
      return updated;
    }
  }

  const nextId = all.reduce((max, d) => Math.max(max, d.id), 0) + 1;
  const created: SavedDesignProject & { ownerEmail?: string } = {
    ...input,
    id: nextId,
    createdAt: now,
    updatedAt: now,
  };
  safeWrite(KEYS.DESIGNS, [created, ...all]);
  return created;
}

export function deleteLocalDesign(id: number): void {
  const all = safeRead<SavedDesignProject[]>(KEYS.DESIGNS, []);
  safeWrite(
    KEYS.DESIGNS,
    all.filter((d) => d.id !== id)
  );
}

// ---------- Reels CRUD ----------

export function listLocalReels(email?: string): SavedReelProject[] {
  const all = safeRead<Array<SavedReelProject & { ownerEmail?: string }>>(
    KEYS.REELS,
    []
  );
  if (!email) return all;
  return all.filter(
    (r) => !r.ownerEmail || r.ownerEmail.toLowerCase() === email.toLowerCase()
  );
}

export function saveLocalReel(
  input: Omit<SavedReelProject, 'id'> & { id?: number; ownerEmail?: string }
): SavedReelProject {
  const all = safeRead<Array<SavedReelProject & { ownerEmail?: string }>>(
    KEYS.REELS,
    []
  );
  const now = new Date().toISOString();

  if (input.id) {
    const idx = all.findIndex((r) => r.id === input.id);
    if (idx >= 0) {
      const updated = { ...all[idx], ...input, updatedAt: now };
      all[idx] = updated;
      safeWrite(KEYS.REELS, all);
      return updated;
    }
  }

  const nextId = all.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const created: SavedReelProject & { ownerEmail?: string } = {
    ...input,
    id: nextId,
    createdAt: now,
    updatedAt: now,
  };
  safeWrite(KEYS.REELS, [created, ...all]);
  return created;
}

export function deleteLocalReel(id: number): void {
  const all = safeRead<SavedReelProject[]>(KEYS.REELS, []);
  safeWrite(
    KEYS.REELS,
    all.filter((r) => r.id !== id)
  );
}

// ---------- Chat Messages ----------

export function listLocalChatMessages(email?: string): ChatMessageItem[] {
  const all = safeRead<Array<ChatMessageItem & { ownerEmail?: string }>>(
    KEYS.CHAT,
    []
  );
  if (!email) return all;
  return all.filter(
    (m) => !m.ownerEmail || m.ownerEmail.toLowerCase() === email.toLowerCase()
  );
}

export function addLocalChatMessage(input: {
  role: 'user' | 'assistant';
  content: string;
  mode: string;
  ownerEmail?: string;
}): ChatMessageItem {
  const all = safeRead<Array<ChatMessageItem & { ownerEmail?: string }>>(
    KEYS.CHAT,
    []
  );
  const nextId = all.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const item: ChatMessageItem & { ownerEmail?: string } = {
    id: nextId,
    role: input.role,
    content: input.content,
    mode: input.mode,
    ownerEmail: input.ownerEmail,
    createdAt: new Date().toISOString(),
  };
  safeWrite(KEYS.CHAT, [...all, item]);
  return item;
}

export function clearLocalChatMessages(email?: string): void {
  if (!email) {
    safeWrite(KEYS.CHAT, []);
    return;
  }
  const all = safeRead<Array<ChatMessageItem & { ownerEmail?: string }>>(
    KEYS.CHAT,
    []
  );
  safeWrite(
    KEYS.CHAT,
    all.filter(
      (m) => m.ownerEmail && m.ownerEmail.toLowerCase() !== email.toLowerCase()
    )
  );
}

// ---------- Support Tickets ----------

export function listLocalSupportTickets(email?: string): SupportTicketItem[] {
  const all = safeRead<SupportTicketItem[]>(KEYS.TICKETS, []);
  if (!email) return all;
  return all.filter((t) => t.email.toLowerCase() === email.toLowerCase());
}

export function createLocalSupportTicket(input: {
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}): SupportTicketItem {
  const all = safeRead<SupportTicketItem[]>(KEYS.TICKETS, []);
  const nextId = all.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  const ticket: SupportTicketItem = {
    id: nextId,
    email: input.email,
    subject: input.subject,
    category: input.category,
    priority: input.priority,
    message: input.message,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  safeWrite(KEYS.TICKETS, [ticket, ...all]);
  return ticket;
}

export function updateLocalSupportTicketStatus(
  id: number,
  status: string
): SupportTicketItem | null {
  const all = safeRead<SupportTicketItem[]>(KEYS.TICKETS, []);
  let updated: SupportTicketItem | null = null;
  const next = all.map((t) => {
    if (t.id === id) {
      updated = { ...t, status };
      return updated;
    }
    return t;
  });
  safeWrite(KEYS.TICKETS, next);
  return updated;
}

// ---------- Smart Local Demo AI Generators (Zero External Dependencies) ----------

export function generateDemoDesign(params: {
  prompt: string;
  category: DesignCategory;
}) {
  const p = params.prompt.toLowerCase();
  const words = params.prompt
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const isLight =
    p.includes('minimal') ||
    p.includes('white') ||
    p.includes('nordic') ||
    p.includes('cream') ||
    p.includes('editorial') ||
    p.includes('clean');
  const isAmber =
    p.includes('gold') ||
    p.includes('amber') ||
    p.includes('coffee') ||
    p.includes('luxury') ||
    p.includes('warm');
  const isEmerald =
    p.includes('eco') ||
    p.includes('green') ||
    p.includes('finance') ||
    p.includes('wellness');
  const isRose =
    p.includes('fashion') ||
    p.includes('beauty') ||
    p.includes('crimson') ||
    p.includes('red');

  const backgroundColor = isLight ? '#F5F4F0' : '#090C12';
  const primaryColor = isLight ? '#0F172A' : '#F8FAFC';
  const secondaryColor = isLight ? '#475569' : '#CBD5E1';
  const accentColor = isAmber
    ? '#F59E0B'
    : isEmerald
    ? '#10B981'
    : isRose
    ? '#F43F5E'
    : '#6366F1';

  const titleWords = words.slice(0, 3).map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1).replace(/[^a-zA-Z0-9]/g, '')
  );
  const title =
    titleWords.length > 0 ? titleWords.join(' ') : `${params.category} Edition`;

  const headline =
    words.length >= 4
      ? words
          .slice(0, 5)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : `Crafted for ${title}`;

  const subheadline = `Designed in ${params.category} · ${params.prompt.trim().slice(0, 68)}`;

  const svgIcons = [
    'M50 8 L92 50 L50 92 L8 50 Z M50 26 L74 50 L50 74 L26 50 Z',
    'M50 10 L86 30 V70 L50 90 L14 70 V30 Z M50 28 L70 40 V60 L50 72 L30 60 V40 Z',
    'M20 80 V45 A30 30 0 0 1 80 45 V80 H64 V45 A14 14 0 0 0 36 45 V82 Z',
  ];

  return {
    title,
    backgroundColor,
    accentColor,
    primaryColor,
    secondaryColor,
    headline,
    subheadline,
    footerLabel: `${params.category} · NOVA AI`,
    fontFamily: p.includes('tech') || p.includes('code') ? 'JetBrains Mono' : 'Plus Jakarta Sans',
    layoutStyle: 'editorial-split',
    svgIconPath: svgIcons[params.prompt.length % svgIcons.length],
  };
}

export function generateDemoReelScript(params: {
  idea: string;
  tone: string;
  accent: VoiceAccent;
}): { title: string; hookScript: string; scenes: ReelScene[] } {
  const cleanIdea = params.idea.trim();
  const shortTopic =
    cleanIdea
      .split(/\s+/)
      .slice(0, 4)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Creator Spotlight';

  const scenes: ReelScene[] = [
    {
      id: `scene-${Date.now()}-0`,
      title: 'The 3-Second Hook',
      narration: `Stop scrolling—most people miss the real breakthrough behind ${cleanIdea.slice(0, 60)}.`,
      caption: `THE SECRET TO ${shortTopic.toUpperCase()}`,
      durationSec: 5,
      backdropUrl: ASSET_REEL_TWILIGHT,
      accentColor: '#F59E0B',
      gradientOverlay: 'from-black/85 via-black/30 to-black/60',
      visualMood: `${params.tone} visual opener`,
      motionType: 'zoom-in',
    },
    {
      id: `scene-${Date.now()}-1`,
      title: 'Core Insight',
      narration: `Here is how top creators structure ${shortTopic.toLowerCase()} in under ninety seconds with crisp visual hierarchy.`,
      caption: 'LOCK YOUR VISUAL HIERARCHY',
      durationSec: 5,
      backdropUrl: ASSET_REEL_STUDIO,
      accentColor: '#6366F1',
      gradientOverlay: 'from-black/85 via-black/30 to-black/60',
      visualMood: 'Studio craft close-up',
      motionType: 'pan-right',
    },
    {
      id: `scene-${Date.now()}-2`,
      title: 'Execution Rhythm',
      narration: `Pair tight pacing with ${params.accent} studio narration and frame-accurate captions that hold attention.`,
      caption: `${params.accent.toUpperCase()} VOICE + AUTO CAPTIONS`,
      durationSec: 5,
      backdropUrl: ASSET_POSTER_ARCH,
      accentColor: '#10B981',
      gradientOverlay: 'from-black/85 via-black/30 to-black/60',
      visualMood: 'Architectural contrast frame',
      motionType: 'zoom-out',
    },
    {
      id: `scene-${Date.now()}-3`,
      title: 'Final Callout',
      narration: `Save this workflow and publish your next 9:16 reel in minutes with Nova AI.`,
      caption: 'PUBLISH YOUR 9:16 REEL TODAY',
      durationSec: 5,
      backdropUrl: ASSET_SOCIAL_PRODUCT,
      accentColor: '#F43F5E',
      gradientOverlay: 'from-black/85 via-black/30 to-black/60',
      visualMood: 'High-contrast luxury finish',
      motionType: 'pan-left',
    },
  ];

  // Guarantee valid backdrop URLs from REEL_BACKDROPS
  scenes.forEach((s, idx) => {
    s.backdropUrl = REEL_BACKDROPS[idx % REEL_BACKDROPS.length].url;
  });

  return {
    title: shortTopic,
    hookScript: scenes.map((s) => s.narration).join(' '),
    scenes,
  };
}

// Synthesize a clean playable stereo/mono WAV tone + speak via browser SpeechSynthesis
export function createDemoVoiceoverWavDataUrl(durationSec = 4): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Warm subtle ambient studio chord envelope so audio track plays smoothly
  const freqs = [220, 277.18, 329.63];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env =
      Math.min(1, t / 0.15) * Math.max(0, 1 - t / durationSec) * 0.12;
    let sample = 0;
    for (const f of freqs) {
      sample += Math.sin(2 * Math.PI * f * t) / freqs.length;
    }
    const int16 = Math.max(-1, Math.min(1, sample * env)) * 32767;
    view.setInt16(44 + i * 2, int16, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

export function speakWithBrowserAccent(text: string, accent: VoiceAccent): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langTag =
      accent === 'UK' ? 'en-GB' : accent === 'Indian' ? 'en-IN' : 'en-US';
    utter.lang = langTag;
    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find((v) =>
      v.lang.toLowerCase().startsWith(langTag.toLowerCase())
    );
    if (matched) utter.voice = matched;
    utter.rate = 1.02;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignore speechSynthesis restrictions
  }
}

export function generateDemoChatReply(message: string, mode: string): string {
  const clean = message.trim();
  if (mode === 'Viral Hook Writer') {
    return [
      `Here are 3 high-retention hooks tailored to "${clean.slice(0, 70)}":`,
      '',
      `1. Contrarian Opener: "Stop doing ${clean.slice(0, 35)} the slow way—here is the 60-second system that actually converts."`,
      `2. Curiosity Gap: "Nobody talks about the 3-second visual detail that doubled retention on this campaign."`,
      `3. Direct Outcome: "Watch how we turn a raw idea into a finished 9:16 vertical reel in four steps."`,
      '',
      'Tip: Keep Scene 1 captions under 6 words and swap angles every 4–5 seconds.',
    ].join('\n');
  }

  if (mode === 'Brand & Copywriter') {
    return [
      `Brand Copy Direction for "${clean.slice(0, 60)}":`,
      '',
      '• Display Headline: "Precision Built for Modern Creators."',
      '• Supporting Subcopy: "Zero friction from first prompt to print-ready PNG, PDF, and 9:16 video."',
      '• CTA Micro-Copy: "Start Creating" / "Explore Templates"',
      '',
      'Recommended Font Pairing: Plus Jakarta Sans (700) for display + DM Sans (400) for body readability.',
    ].join('\n');
  }

  if (mode === 'Design Critique') {
    return [
      `Studio Critique for "${clean.slice(0, 60)}":`,
      '',
      '1. Contrast & Hierarchy: Ensure display headlines maintain >= 4.5:1 contrast over photographic backdrops using a bottom gradient scrim.',
      '2. Spacing & Margins: Keep at least 7–8% safe padding around outer canvas edges for social crop safety.',
      '3. Accent Restraint: Concentrate your primary accent color strictly on one focal emblem or CTA block.',
    ].join('\n');
  }

  return [
    `Nova AI Studio Plan for "${clean.slice(0, 65)}":`,
    '',
    '• Visual Direction: Deep obsidian canvas (#090C12) with crisp alabaster typography (#F8FAFC) and focused indigo/amber highlights.',
    '• Graphic Deliverable: Open Design Studio -> pick Social Media (1080×1080) or Poster (1080×1440) -> export 2x PNG & print PDF.',
    '• Short Video Deliverable: Open Reel Studio -> paste your concept -> select US, UK, or Indian voice narration -> preview & export 9:16.',
  ].join('\n');
}

export function translateDemoText(text: string, targetLanguage: string): string {
  const prefixes: Record<string, string> = {
    Spanish: '[ES]',
    French: '[FR]',
    German: '[DE]',
    Hindi: '[HI]',
    Japanese: '[JA]',
    Portuguese: '[PT]',
    Arabic: '[AR]',
    Korean: '[KO]',
    English: '[EN]',
  };
  const commonDict: Record<string, Record<string, string>> = {
    Spanish: {
      hello: 'Hola',
      welcome: 'Bienvenido a Nova AI',
      create: 'Crea diseños increíbles con Nova AI',
    },
    French: {
      hello: 'Bonjour',
      welcome: 'Bienvenue sur Nova AI',
      create: 'Créez des visuels professionnels avec Nova AI',
    },
    German: {
      hello: 'Hallo',
      welcome: 'Willkommen bei Nova AI',
      create: 'Erstellen Sie Studio-Grafiken mit Nova AI',
    },
    Hindi: {
      hello: 'नमस्ते',
      welcome: 'Nova AI में आपका स्वागत है',
      create: 'Nova AI के साथ शानदार डिज़ाइन बनाएं',
    },
    Japanese: {
      hello: 'こんにちは',
      welcome: 'Nova AIへようこそ',
      create: 'Nova AIでスタジオ品質のデザインを作成',
    },
  };

  const lower = text.trim().toLowerCase();
  const dict = commonDict[targetLanguage];
  if (dict && dict[lower]) {
    return dict[lower];
  }
  const tag = prefixes[targetLanguage] ?? `[${targetLanguage.slice(0, 2).toUpperCase()}]`;
  return `${tag} ${text.trim()}`;
}

export type { CaptionStyle };
