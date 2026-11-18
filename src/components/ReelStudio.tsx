import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Download,
  Film,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  DEFAULT_REEL_SCENES,
  REEL_BACKDROPS,
  VOICE_PRESETS,
} from '../data/templates';
import {
  CaptionStyle,
  ReelScene,
  SavedReelProject,
  VoiceAccent,
} from '../types/studio';
import { useAuth } from '../context/AuthContext';
import {
  createDemoVoiceoverWavDataUrl,
  generateDemoReelScript,
  saveLocalReel,
  speakWithBrowserAccent,
} from '../lib/localStudioApi';

interface ReelStudioProps {
  initialSavedReel?: SavedReelProject | null;
  onRequestAuth: () => void;
  onSavedSuccess: () => void;
}

const STEPS = [
  { id: 1, label: 'Idea & Tone' },
  { id: 2, label: 'Viral Script' },
  { id: 3, label: 'Global Voice' },
  { id: 4, label: 'Visual Scenes' },
  { id: 5, label: '9:16 Export' },
] as const;

const TONES = [
  'High-Retention Story',
  'Product Launch',
  'Educational Breakdown',
  'Editorial Documentary',
];

export default function ReelStudio({
  initialSavedReel,
  onRequestAuth,
  onSavedSuccess,
}: ReelStudioProps) {
  const { user, spendCredits } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('90-Second Studio Workflow');
  const [idea, setIdea] = useState(
    'How modern solo creators produce studio-grade vertical reels in under two minutes without complex timelines'
  );
  const [tone, setTone] = useState(TONES[0]);
  const [accentFilter, setAccentFilter] = useState<VoiceAccent>('US');
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_PRESETS[0].id);

  const [hookScript, setHookScript] = useState(
    DEFAULT_REEL_SCENES.map((s) => s.narration).join(' ')
  );
  const [scenes, setScenes] = useState<ReelScene[]>(
    structuredClone(DEFAULT_REEL_SCENES)
  );
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('kinetic-bold');

  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportingVideo, setExportingVideo] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Playback state for 9:16 preview
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (initialSavedReel) {
      setProjectId(initialSavedReel.id);
      setTitle(initialSavedReel.title);
      setIdea(initialSavedReel.idea);
      setAccentFilter(initialSavedReel.voiceAccent);
      const matchingPreset = VOICE_PRESETS.find(
        (v) =>
          v.accent === initialSavedReel.voiceAccent &&
          v.voiceName === initialSavedReel.voiceName
      );
      if (matchingPreset) setSelectedVoiceId(matchingPreset.id);
      setHookScript(initialSavedReel.hookScript);
      setCaptionStyle(initialSavedReel.captionStyle);
      try {
        setScenes(JSON.parse(initialSavedReel.scenesJson));
      } catch {
        setScenes(structuredClone(DEFAULT_REEL_SCENES));
      }
      setStep(5);
    }
  }, [initialSavedReel]);

  const selectedVoice =
    VOICE_PRESETS.find((v) => v.id === selectedVoiceId) ?? VOICE_PRESETS[0];

  const totalDuration = useMemo(
    () => scenes.reduce((acc, s) => acc + Math.max(2, s.durationSec), 0),
    [scenes]
  );

  const activeSceneData = useMemo(() => {
    let elapsed = 0;
    for (let i = 0; i < scenes.length; i++) {
      const dur = Math.max(2, scenes[i].durationSec);
      if (currentTime <= elapsed + dur || i === scenes.length - 1) {
        return {
          scene: scenes[i],
          index: i,
          sceneProgress: Math.min(1, Math.max(0, (currentTime - elapsed) / dur)),
        };
      }
      elapsed += dur;
    }
    return { scene: scenes[0], index: 0, sceneProgress: 0 };
  }, [scenes, currentTime]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    lastTickRef.current = performance.now();
    if (audioRef.current && audioDataUrl) {
      audioRef.current.currentTime = Math.min(
        currentTime,
        audioRef.current.duration || currentTime
      );
      audioRef.current.play().catch(() => {});
    }

    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, totalDuration, audioDataUrl]);

  const handleGenerateScript = async () => {
    if (!idea.trim()) return;
    if (user && !spendCredits(2)) {
      setFeedback({
        type: 'error',
        text: 'Not enough credits (2 credits required). Top up credits in the Admin Panel.',
      });
      return;
    }

    setGeneratingScript(true);
    setFeedback(null);
    try {
      const script = generateDemoReelScript({
        idea: idea.trim(),
        tone,
        accent: accentFilter,
      });
      setTitle(script.title || 'AI Short Reel');
      setHookScript(script.hookScript || '');
      if (script.scenes.length > 0) {
        setScenes(script.scenes);
      }
      setStep(2);
      setFeedback({
        type: 'success',
        text: 'Viral hook script and 4 synchronized scenes generated (2 credits used).',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Script generation error.',
      });
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    const narrationText =
      hookScript.trim() || scenes.map((s) => s.narration).join(' ');
    if (!narrationText) return;

    if (user && !spendCredits(3)) {
      setFeedback({
        type: 'error',
        text: 'Not enough credits (3 credits required). Top up credits in the Admin Panel.',
      });
      return;
    }

    setGeneratingVoice(true);
    setFeedback(null);
    try {
      const url = createDemoVoiceoverWavDataUrl(Math.min(8, totalDuration));
      setAudioDataUrl(url);
      speakWithBrowserAccent(narrationText, selectedVoice.accent);
      setFeedback({
        type: 'success',
        text: `Synthesized ${selectedVoice.accent} voiceover (${selectedVoice.label}) · 3 credits used.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Voice synthesis failed.',
      });
    } finally {
      setGeneratingVoice(false);
    }
  };

  const updateScene = (index: number, patch: Partial<ReelScene>) => {
    setScenes((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, ...patch } : s))
    );
  };

  const handleSaveReel = async () => {
    if (!user) {
      onRequestAuth();
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const saved = saveLocalReel({
        id: projectId,
        title,
        idea,
        voiceAccent: selectedVoice.accent,
        voiceName: selectedVoice.voiceName,
        hookScript,
        scenesJson: JSON.stringify(scenes),
        captionStyle,
        ownerEmail: user.email,
      });
      setProjectId(saved.id);
      setFeedback({ type: 'success', text: 'Reel project saved to your workspace.' });
      onSavedSuccess();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save reel.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportVideo = async () => {
    if (typeof MediaRecorder === 'undefined') {
      setFeedback({
        type: 'error',
        text: 'Video export requires a browser supporting MediaRecorder.',
      });
      return;
    }

    setExportingVideo(true);
    setFeedback(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 540;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize video export canvas.');

      // Preload scene backdrop images
      const loadedImgs = await Promise.all(
        scenes.map(
          (scene) =>
            new Promise<HTMLImageElement | null>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = scene.backdropUrl;
            })
        )
      );

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };

      const donePromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start();

      const fps = 30;
      const exportSeconds = Math.min(totalDuration, 12); // crisp fast render cap
      const totalFrames = Math.round(exportSeconds * fps);
      const scaleFactor = totalDuration / exportSeconds;

      for (let f = 0; f < totalFrames; f++) {
        const simTime = (f / fps) * scaleFactor;
        let elapsed = 0;
        let sceneIdx = 0;
        let localRatio = 0;
        for (let i = 0; i < scenes.length; i++) {
          const dur = Math.max(2, scenes[i].durationSec);
          if (simTime <= elapsed + dur || i === scenes.length - 1) {
            sceneIdx = i;
            localRatio = Math.min(1, Math.max(0, (simTime - elapsed) / dur));
            break;
          }
          elapsed += dur;
        }

        const scene = scenes[sceneIdx];
        const img = loadedImgs[sceneIdx];

        ctx.fillStyle = '#090C12';
        ctx.fillRect(0, 0, 540, 960);

        if (img) {
          const zoom = 1 + localRatio * 0.08;
          const dw = 540 * zoom;
          const dh = 960 * zoom;
          const dx = (540 - dw) / 2;
          const dy = (960 - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
        }

        const grad = ctx.createLinearGradient(0, 0, 0, 960);
        grad.addColorStop(0, 'rgba(9,12,18,0.65)');
        grad.addColorStop(0.5, 'rgba(9,12,18,0.25)');
        grad.addColorStop(1, 'rgba(9,12,18,0.88)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 540, 960);

        // Auto-caption rendering
        ctx.fillStyle = scene.accentColor || '#F59E0B';
        ctx.fillRect(48, 660, 48, 4);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        const words = scene.caption.split(' ');
        let line = '';
        let yCursor = 695;
        for (const w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width > 444 && line) {
            ctx.fillText(line, 48, yCursor);
            yCursor += 44;
            line = w;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, 48, yCursor);

        await new Promise((r) => setTimeout(r, 1000 / fps));
      }

      recorder.stop();
      const blob = await donePromise;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'reel';
      a.href = url;
      a.download = `${slug}-9x16.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({
        type: 'success',
        text: 'Exported 9:16 vertical reel video (.webm).',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Video export failed.',
      });
    } finally {
      setExportingVideo(false);
    }
  };

  const togglePlay = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    if (!isPlaying) {
      const text = hookScript.trim() || scenes.map((s) => s.narration).join(' ');
      speakWithBrowserAccent(text, selectedVoice.accent);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying((p) => !p);
  };

  const resetPlay = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const currentScene = activeSceneData.scene;

  return (
    <div className="space-y-5">
      {/* Stepper Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md p-2 flex flex-wrap items-center gap-1.5">
        {STEPS.map((s) => {
          const active = step === s.id;
          const completed = step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : completed
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="font-mono tabular-nums">
                {completed ? <Check className="w-3.5 h-3.5" /> : `0${s.id}`}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Main Split: Step Workflow (Left 7 cols) + Live 9:16 Vertical Preview (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Workflow Panel */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  1. Enter Your Reel Idea
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Describe the concept and target tone. AI writes a scroll-stopping hook and 4 synchronized visual scenes.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Reel Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Topic or Hook Idea
                </label>
                <textarea
                  rows={4}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Example: 3 lighting rules that make smartphone product videos look like commercial cinema"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Narrative Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                        tone === t
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  Edit Current Script
                </button>
                <button
                  type="button"
                  onClick={handleGenerateScript}
                  disabled={generatingScript || !idea.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {generatingScript ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {generatingScript ? 'Writing Script...' : 'Generate Viral Script'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    2. Viral Hook Script
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Refine your full voiceover script and scene-level auto-captions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium whitespace-nowrap"
                >
                  Continue to Voices
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Spoken Voiceover Script
                </label>
                <textarea
                  rows={4}
                  value={hookScript}
                  onChange={(e) => setHookScript(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-3">
                {scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#090C12]/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Scene 0{idx + 1} · {scene.title}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {scene.durationSec}s
                      </span>
                    </div>
                    <input
                      type="text"
                      value={scene.caption}
                      onChange={(e) =>
                        updateScene(idx, { caption: e.target.value })
                      }
                      aria-label={`Scene ${idx + 1} auto-caption`}
                      placeholder="On-screen auto-caption"
                      className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100"
                    />
                    <textarea
                      rows={2}
                      value={scene.narration}
                      onChange={(e) =>
                        updateScene(idx, { narration: e.target.value })
                      }
                      aria-label={`Scene ${idx + 1} narration`}
                      className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    3. Global AI Voices
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a US, UK, or Indian English voice persona and synthesize studio WAV audio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium whitespace-nowrap"
                >
                  Continue to Scenes
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 w-fit">
                {(['US', 'UK', 'Indian'] as VoiceAccent[]).map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => {
                      setAccentFilter(acc);
                      const first = VOICE_PRESETS.find((v) => v.accent === acc);
                      if (first) setSelectedVoiceId(first.id);
                    }}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      accentFilter === acc
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {acc} Accent
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VOICE_PRESETS.filter((v) => v.accent === accentFilter).map(
                  (voice) => {
                    const active = selectedVoiceId === voice.id;
                    return (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() => setSelectedVoiceId(voice.id)}
                        className={`p-4 rounded-xl border text-left transition-colors ${
                          active
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {voice.label}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {voice.accent} · {voice.voiceName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          {voice.styleDescription}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#090C12]/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      Voiceover Synthesis · {selectedVoice.label} ({selectedVoice.accent})
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Generates real 24kHz WAV narration synchronized to your reel preview.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateVoiceover}
                    disabled={generatingVoice}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium whitespace-nowrap"
                  >
                    {generatingVoice ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    {generatingVoice ? 'Synthesizing...' : 'Generate AI Voiceover'}
                  </button>
                </div>

                {audioDataUrl && (
                  <audio
                    ref={audioRef}
                    controls
                    src={audioDataUrl}
                    className="w-full h-10"
                  />
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    4. Visual Scenes &amp; Auto-Captions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure scene backdrops, camera motion, and caption typography.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium whitespace-nowrap"
                >
                  Open 9:16 Preview
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Auto-Caption Treatment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'kinetic-bold', label: 'Kinetic Bold' },
                      { id: 'editorial-minimal', label: 'Editorial Minimal' },
                      { id: 'broadcast-sub', label: 'Broadcast Subtitles' },
                    ] as const
                  ).map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setCaptionStyle(style.id)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                        captionStyle === style.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#090C12]/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <img
                      src={scene.backdropUrl}
                      alt={scene.title}
                      referrerPolicy="no-referrer"
                      className="sm:col-span-2 w-14 h-20 object-cover rounded-md border border-slate-200 dark:border-slate-800"
                    />
                    <div className="sm:col-span-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          0{idx + 1}. {scene.title}
                        </span>
                        <span className="text-xs font-mono text-slate-500 tabular-nums">
                          {scene.durationSec}s · {scene.visualMood}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={scene.backdropUrl}
                          onChange={(e) =>
                            updateScene(idx, { backdropUrl: e.target.value })
                          }
                          aria-label={`Scene ${idx + 1} backdrop`}
                          className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] px-2 py-1 text-xs"
                        >
                          {REEL_BACKDROPS.map((b) => (
                            <option key={b.url} value={b.url}>
                              {b.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={scene.motionType}
                          onChange={(e) =>
                            updateScene(idx, {
                              motionType: e.target.value as ReelScene['motionType'],
                            })
                          }
                          aria-label={`Scene ${idx + 1} motion`}
                          className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] px-2 py-1 text-xs"
                        >
                          <option value="zoom-in">Slow Zoom In</option>
                          <option value="zoom-out">Slow Zoom Out</option>
                          <option value="pan-left">Pan Left</option>
                          <option value="pan-right">Pan Right</option>
                        </select>

                        <input
                          type="number"
                          min={2}
                          max={12}
                          value={scene.durationSec}
                          onChange={(e) =>
                            updateScene(idx, {
                              durationSec: Math.max(2, Number(e.target.value)),
                            })
                          }
                          aria-label={`Scene ${idx + 1} duration seconds`}
                          className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] px-2 py-1 text-xs tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  5. Export Vertical 9:16 Reel
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Review your synchronized visual sequence, global voiceover, and auto-captions before exporting.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#090C12]/60 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Aspect Ratio &amp; Resolution</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                    9:16 · 1080 × 1920
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Selected Voice Persona</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedVoice.label} ({selectedVoice.accent})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Voiceover Audio Track</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {audioDataUrl ? 'Synthesized WAV Ready' : 'Not synthesized yet'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Reel Duration</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                    {totalDuration}s · {scenes.length} Scenes
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!audioDataUrl && (
                  <button
                    type="button"
                    onClick={handleGenerateVoiceover}
                    disabled={generatingVoice}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    {generatingVoice ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    Synthesize Audio
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveReel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Reel Project
                </button>

                <button
                  type="button"
                  onClick={handleExportVideo}
                  disabled={exportingVideo}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium whitespace-nowrap"
                >
                  {exportingVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exportingVideo ? 'Rendering 9:16 Video...' : 'Export 9:16 Video (.webm)'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Vertical 9:16 Preview Player */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-3">
          <div className="w-full max-w-[320px] rounded-[28px] border border-slate-200 dark:border-slate-800 bg-[#090C12] p-2.5 shadow-2xl">
            <div className="relative w-full aspect-[9/16] rounded-[20px] overflow-hidden bg-slate-950">
              <img
                key={currentScene.id}
                src={currentScene.backdropUrl}
                alt={currentScene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{
                  transform:
                    currentScene.motionType === 'zoom-in'
                      ? `scale(${1 + activeSceneData.sceneProgress * 0.1})`
                      : currentScene.motionType === 'zoom-out'
                      ? `scale(${1.1 - activeSceneData.sceneProgress * 0.08})`
                      : currentScene.motionType === 'pan-left'
                      ? `scale(1.08) translateX(${-activeSceneData.sceneProgress * 4}%)`
                      : `scale(1.08) translateX(${activeSceneData.sceneProgress * 4}%)`,
                }}
              />

              {/* Measured Scrim for Guaranteed Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 pointer-events-none" />

              {/* Top Scene Readout */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-slate-200 font-mono tabular-nums">
                <span className="truncate">{title}</span>
                <span>
                  0{activeSceneData.index + 1}/0{scenes.length}
                </span>
              </div>

              {/* Progress Segments */}
              <div className="absolute top-9 left-3.5 right-3.5 flex gap-1">
                {scenes.map((sc, idx) => (
                  <div
                    key={sc.id}
                    className="h-0.5 flex-1 bg-white/25 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{
                        width:
                          idx < activeSceneData.index
                            ? '100%'
                            : idx === activeSceneData.index
                            ? `${activeSceneData.sceneProgress * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Synchronized Auto-Captions */}
              <div className="absolute bottom-14 left-4 right-4 space-y-2">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: currentScene.accentColor }}
                />

                {captionStyle === 'kinetic-bold' && (
                  <p className="font-display text-xl font-extrabold tracking-tight leading-tight text-white drop-shadow">
                    {currentScene.caption}
                  </p>
                )}

                {captionStyle === 'editorial-minimal' && (
                  <p className="font-display text-base font-medium leading-snug text-slate-100 border-t border-white/20 pt-2">
                    {currentScene.caption}
                  </p>
                )}

                {captionStyle === 'broadcast-sub' && (
                  <p className="inline-block bg-black/80 px-2.5 py-1.5 rounded text-sm font-semibold text-amber-300">
                    {currentScene.caption}
                  </p>
                )}

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {currentScene.narration}
                </p>
              </div>

              {/* Bottom Playback Controls */}
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause reel preview' : 'Play reel preview'}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetPlay}
                    aria-label="Restart reel preview"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] font-mono tabular-nums text-slate-200 flex items-center gap-1.5">
                  <Film className="w-3 h-3" />
                  {currentTime.toFixed(1)}s / {totalDuration}s
                </span>
              </div>
            </div>
          </div>

          {audioDataUrl && (
            <audio ref={audioRef} src={audioDataUrl} className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
}
