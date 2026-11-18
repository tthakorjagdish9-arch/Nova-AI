import { AppLanguage } from '../types/studio';

export const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  label: string;
  nativeName: string;
}> = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'es', label: 'Spanish', nativeName: 'Español' },
  { code: 'fr', label: 'French', nativeName: 'Français' },
  { code: 'de', label: 'German', nativeName: 'Deutsch' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語' },
];

export interface UiTranslations {
  navDesign: string;
  navReel: string;
  navChat: string;
  navTemplates: string;
  navSaved: string;
  titleDesign: string;
  descDesign: string;
  titleReel: string;
  descReel: string;
  titleChat: string;
  descChat: string;
  titleTemplates: string;
  descTemplates: string;
  titleSaved: string;
  descSaved: string;
  titleAdmin: string;
  descAdmin: string;
  creditsLabel: string;
  adminPanel: string;
  helpSupport: string;
  signIn: string;
  signOut: string;
  welcomeHeadline: string;
  welcomeSubhead: string;
  welcomeBonus: string;
  continueWithGoogle: string;
}

export const TRANSLATIONS: Record<AppLanguage, UiTranslations> = {
  en: {
    navDesign: 'Design Studio',
    navReel: 'Reel Studio',
    navChat: 'AI Chat',
    navTemplates: 'Templates',
    navSaved: 'Saved Work',
    titleDesign: 'AI Graphic & Design Studio',
    descDesign:
      'Generate layered compositions from prompts, customize typography & colors, and export 2x PNG or PDF.',
    titleReel: 'AI Short Video & Reel Studio',
    descReel:
      'Turn ideas into viral hook scripts with US, UK, or Indian AI voices, synchronized scenes, and 9:16 preview.',
    titleChat: 'Nova AI Creative Assistant',
    descChat:
      'Brainstorm hooks, brand copy, color systems, and campaign ideas with multi-turn AI chat.',
    titleTemplates: 'Curated Template Library',
    descTemplates:
      'Social Media · YouTube Thumbnails · Logos · Posters ready for instant customization.',
    titleSaved: 'Cloud Workspace Library',
    descSaved:
      'Access and reopen your persisted graphic designs and short video reels.',
    titleAdmin: 'Workspace Admin Panel',
    descAdmin:
      'Manage user accounts, welcome credits, role permissions, and support tickets.',
    creditsLabel: 'Credits',
    adminPanel: 'Admin Panel',
    helpSupport: 'Help & Support',
    signIn: 'Sign in',
    signOut: 'Sign out',
    welcomeHeadline: 'Create Studio Graphics & 9:16 Reels with Nova AI',
    welcomeSubhead:
      'Sign in or create your workspace to unlock prompt-driven design layers, global AI voices, and multi-turn creative chat.',
    welcomeBonus: 'Includes 50 free welcome credits on first sign-up',
    continueWithGoogle: 'Continue with Google',
  },
  es: {
    navDesign: 'Estudio Gráfico',
    navReel: 'Estudio Reel',
    navChat: 'Chat IA',
    navTemplates: 'Plantillas',
    navSaved: 'Guardados',
    titleDesign: 'Estudio de Diseño Gráfico IA',
    descDesign:
      'Genera composiciones por capas, personaliza tipografía y colores, y exporta en PNG 2x o PDF.',
    titleReel: 'Estudio de Video Corto y Reels IA',
    descReel:
      'Convierte ideas en guiones virales con voces globales, escenas sincronizadas y vista previa 9:16.',
    titleChat: 'Asistente Creativo Nova AI',
    descChat:
      'Genera ideas de ganchos, copys de marca, paletas de color y campañas con chat conversacional.',
    titleTemplates: 'Biblioteca de Plantillas',
    descTemplates:
      'Redes Sociales · Miniaturas YouTube · Logotipos · Pósteres listos para personalizar.',
    titleSaved: 'Proyectos en la Nube',
    descSaved:
      'Accede y reabre tus diseños gráficos y reels de video guardados.',
    titleAdmin: 'Panel de Administración',
    descAdmin:
      'Administra usuarios, créditos de bienvenida, roles y tickets de soporte.',
    creditsLabel: 'Créditos',
    adminPanel: 'Panel Admin',
    helpSupport: 'Ayuda y Soporte',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    welcomeHeadline: 'Crea Gráficos y Reels 9:16 con Nova AI',
    welcomeSubhead:
      'Inicia sesión o crea tu espacio para acceder a diseño por capas, voces globales y chat creativo.',
    welcomeBonus: 'Incluye 50 créditos de bienvenida gratis al registrarte',
    continueWithGoogle: 'Continuar con Google',
  },
  fr: {
    navDesign: 'Studio Design',
    navReel: 'Studio Reel',
    navChat: 'Chat IA',
    navTemplates: 'Modèles',
    navSaved: 'Projets',
    titleDesign: 'Studio de Design Graphique IA',
    descDesign:
      'Créez des compositions multicouches, personnalisez la typographie et exportez en PNG 2x ou PDF.',
    titleReel: 'Studio Vidéo Courte & Reel IA',
    descReel:
      'Transformez vos idées en scripts viraux avec voix mondiales, scènes synchronisées et aperçu 9:16.',
    titleChat: 'Assistant Créatif Nova AI',
    descChat:
      'Imaginez des accroches, textes de marque et palettes de couleurs via le chat IA.',
    titleTemplates: 'Bibliothèque de Modèles',
    descTemplates:
      'Réseaux Sociaux · Miniatures YouTube · Logos · Affiches prêts à personnaliser.',
    titleSaved: 'Espace Cloud',
    descSaved: 'Retrouvez vos designs graphiques et vidéos sauvegardés.',
    titleAdmin: 'Panneau d’Administration',
    descAdmin:
      'Gérez les utilisateurs, les crédits de bienvenue, les rôles et les tickets.',
    creditsLabel: 'Crédits',
    adminPanel: 'Admin',
    helpSupport: 'Aide & Support',
    signIn: 'Connexion',
    signOut: 'Déconnexion',
    welcomeHeadline: 'Créez Visuels et Reels 9:16 avec Nova AI',
    welcomeSubhead:
      'Connectez-vous ou créez votre compte pour accéder au studio graphique, aux voix IA et au chat.',
    welcomeBonus: 'Inclut 50 crédits de bienvenue gratuits à l’inscription',
    continueWithGoogle: 'Continuer avec Google',
  },
  de: {
    navDesign: 'Design Studio',
    navReel: 'Reel Studio',
    navChat: 'KI-Chat',
    navTemplates: 'Vorlagen',
    navSaved: 'Gespeichert',
    titleDesign: 'KI-Grafik- & Designstudio',
    descDesign:
      'Erstellen Sie Ebenen-Kompositionen aus Prompts und exportieren Sie in 2x PNG oder PDF.',
    titleReel: 'KI-Kurzvideo- & Reel-Studio',
    descReel:
      'Verwandeln Sie Ideen in virale Skripte mit globalen Stimmen, Szenen und 9:16-Vorschau.',
    titleChat: 'Nova AI Kreativ-Assistent',
    descChat:
      'Entwickeln Sie Hooks, Markentexte und Farbkonzepte im Multi-Turn-KI-Chat.',
    titleTemplates: 'Vorlagen-Bibliothek',
    descTemplates:
      'Social Media · YouTube-Thumbnails · Logos · Poster sofort anpassbar.',
    titleSaved: 'Cloud-Arbeitsbereich',
    descSaved: 'Öffnen Sie Ihre gespeicherten Grafikdesigns und Video-Reels.',
    titleAdmin: 'Admin-Bereich',
    descAdmin:
      'Verwalten Sie Benutzerkonten, Willkommens-Credits, Rollen und Support-Tickets.',
    creditsLabel: 'Credits',
    adminPanel: 'Admin-Panel',
    helpSupport: 'Hilfe & Support',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    welcomeHeadline: 'Erstellen Sie Studio-Grafiken & 9:16 Reels mit Nova AI',
    welcomeSubhead:
      'Melden Sie sich an, um Design-Ebenen, globale KI-Stimmen und Kreativ-Chat freizuschalten.',
    welcomeBonus: 'Inklusive 50 kostenlosen Willkommens-Credits bei Registrierung',
    continueWithGoogle: 'Mit Google fortfahren',
  },
  hi: {
    navDesign: 'डिज़ाइन स्टूडियो',
    navReel: 'रील स्टूडियो',
    navChat: 'AI चैट',
    navTemplates: 'टेम्पलेट्स',
    navSaved: 'सेव किए गए',
    titleDesign: 'AI ग्राफिक और डिज़ाइन स्टूडियो',
    descDesign:
      'प्रॉम्प्ट से लेयर्ड डिज़ाइन बनाएं, टाइपोग्राफी और रंग बदलें, और PNG या PDF में एक्सपोर्ट करें।',
    titleReel: 'AI शॉर्ट वीडियो और रील स्टूडियो',
    descReel:
      'अपने आइडिया से वायरल स्क्रिप्ट, US/UK/भारतीय आवाज़ें और 9:16 वर्टिकल रील बनाएं।',
    titleChat: 'Nova AI क्रिएटिव असिस्टेंट',
    descChat:
      'हुक आइडिया, ब्रांड कॉपी, कलर पैलेट और कैंपेन रणनीति के लिए AI चैट करें।',
    titleTemplates: 'प्रोफेशनल टेम्पलेट लाइब्रेरी',
    descTemplates:
      'सोशल मीडिया · यूट्यूब थंबनेल · लोगो · पोस्टर तुरंत कस्टमाइज़ करें।',
    titleSaved: 'क्लाउड वर्कस्पेस',
    descSaved: 'अपने सेव किए गए ग्राफिक डिज़ाइन और वीडियो रील्स खोलें।',
    titleAdmin: 'एडमिन पैनल',
    descAdmin:
      'उपयोगकर्ताओं, वेलकम क्रेडिट्स, भूमिकाओं और सपोर्ट टिकटों का प्रबंधन करें।',
    creditsLabel: 'क्रेडिट्स',
    adminPanel: 'एडमिन पैनल',
    helpSupport: 'सहायता और सपोर्ट',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    welcomeHeadline: 'Nova AI के साथ स्टूडियो ग्राफिक्स और 9:16 रील्स बनाएं',
    welcomeSubhead:
      'प्रॉम्प्ट-आधारित डिज़ाइन, ग्लोबल AI आवाज़ें और क्रिएटिव चैट अनलॉक करने के लिए साइन इन करें।',
    welcomeBonus: 'पहले साइन-अप पर 50 मुफ्त वेलकम क्रेडिट शामिल हैं',
    continueWithGoogle: 'Google के साथ जारी रखें',
  },
  ja: {
    navDesign: 'デザイン',
    navReel: 'リール制作',
    navChat: 'AIチャット',
    navTemplates: 'テンプレート',
    navSaved: '保存済み',
    titleDesign: 'AI グラフィック＆デザインスタジオ',
    descDesign:
      'プロンプトからレイヤー構成を生成し、タイポグラフィや色を調整して高解像度PNG/PDFで書き出します。',
    titleReel: 'AI ショート動画＆リールスタジオ',
    descReel:
      'アイデアからバイラル台本、多言語AI音声、自動字幕付きの9:16縦型動画を生成します。',
    titleChat: 'Nova AI クリエイティブチャット',
    descChat:
      'フック案、ブランドコピー、配色設計を対話型AIと共同作成します。',
    titleTemplates: 'スタジオテンプレート',
    descTemplates:
      'SNS投稿 · YouTubeサムネイル · ロゴ · ポスターを即座に編集可能。',
    titleSaved: 'クラウド保存済み',
    descSaved: '保存したグラフィックデザインと動画リールを開きます。',
    titleAdmin: '管理パネル',
    descAdmin:
      'ユーザーアカウント、ウェルカムクレジット、権限、サポートチケットを管理します。',
    creditsLabel: 'クレジット',
    adminPanel: '管理パネル',
    helpSupport: 'ヘルプ・サポート',
    signIn: 'サインイン',
    signOut: 'サインアウト',
    welcomeHeadline: 'Nova AIでスタジオ品質のデザインと9:16リールを作成',
    welcomeSubhead:
      'サインインして、AIデザインレイヤー、多言語ナレーション、対話型クリエイティブチャットを始めましょう。',
    welcomeBonus: '初回登録で50ウェルカムクレジットを無料進呈',
    continueWithGoogle: 'Googleで続行',
  },
};
