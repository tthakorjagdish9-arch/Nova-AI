export type DesignCategory =
  | 'Social Media'
  | 'YouTube Thumbnails'
  | 'Logos'
  | 'Posters';

export type LayerType = 'text' | 'rect' | 'circle' | 'image' | 'svg';

export interface DesignLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  imageUrl?: string;
  svgPath?: string;
  svgViewBox?: string;
}

export interface DesignTemplate {
  id: string;
  title: string;
  category: DesignCategory;
  width: number;
  height: number;
  backgroundColor: string;
  layers: DesignLayer[];
}

export interface SavedDesignProject {
  id: number;
  title: string;
  category: DesignCategory;
  width: number;
  height: number;
  backgroundColor: string;
  layersJson: string;
  prompt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type VoiceAccent = 'US' | 'UK' | 'Indian';
export type PrebuiltVoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoicePreset {
  id: string;
  label: string;
  accent: VoiceAccent;
  voiceName: PrebuiltVoiceName;
  styleDescription: string;
  speechStylePrompt: string;
}

export type CaptionStyle = 'kinetic-bold' | 'editorial-minimal' | 'broadcast-sub';

export interface ReelScene {
  id: string;
  title: string;
  narration: string;
  caption: string;
  durationSec: number;
  backdropUrl: string;
  accentColor: string;
  gradientOverlay: string;
  visualMood: string;
  motionType: 'zoom-in' | 'pan-left' | 'pan-right' | 'zoom-out';
}

export interface SavedReelProject {
  id: number;
  title: string;
  idea: string;
  voiceAccent: VoiceAccent;
  voiceName: PrebuiltVoiceName;
  hookScript: string;
  scenesJson: string;
  captionStyle: CaptionStyle;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketItem {
  id: number;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  createdAt?: string;
}

export interface DbUserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  credits: number;
  role: 'user' | 'admin' | string;
  createdAt?: string;
}

export interface ChatMessageItem {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  mode: string;
  createdAt?: string;
}

export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ja';
