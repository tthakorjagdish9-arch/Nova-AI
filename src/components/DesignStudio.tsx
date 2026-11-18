import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Circle,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Layers,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Square,
  Trash2,
  Type as TypeIcon,
} from 'lucide-react';
import {
  ASSET_POSTER_ARCH,
  ASSET_SOCIAL_PRODUCT,
  ASSET_YOUTUBE_TECH,
  DESIGN_TEMPLATES,
  buildDesignLayersFromAi,
} from '../data/templates';
import {
  DesignCategory,
  DesignLayer,
  DesignTemplate,
  SavedDesignProject,
} from '../types/studio';
import { downloadDesignAsPdf, downloadDesignAsPng } from '../utils/exportDesign';
import { useAuth } from '../context/AuthContext';
import { generateDemoDesign, saveLocalDesign } from '../lib/localStudioApi';

interface DesignStudioProps {
  initialTemplate?: DesignTemplate | null;
  initialSavedDesign?: SavedDesignProject | null;
  onRequestAuth: () => void;
  onSavedSuccess: () => void;
}

const CATEGORIES: Array<'All' | DesignCategory> = [
  'All',
  'Social Media',
  'YouTube Thumbnails',
  'Logos',
  'Posters',
];

const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'DM Sans',
  'JetBrains Mono',
  'Georgia',
];

const SWATCHES = [
  '#090C12',
  '#0F172A',
  '#1E293B',
  '#F8FAFC',
  '#FAF8F5',
  '#4F46E5',
  '#F59E0B',
  '#10B981',
  '#F43F5E',
  '#D4AF37',
];

export default function DesignStudio({
  initialTemplate,
  initialSavedDesign,
  onRequestAuth,
  onSavedSuccess,
}: DesignStudioProps) {
  const { user, spendCredits } = useAuth();

  const defaultTpl = DESIGN_TEMPLATES[0];
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState(defaultTpl.title);
  const [category, setCategory] = useState<DesignCategory>(defaultTpl.category);
  const [width, setWidth] = useState(defaultTpl.width);
  const [height, setHeight] = useState(defaultTpl.height);
  const [backgroundColor, setBackgroundColor] = useState(
    defaultTpl.backgroundColor
  );
  const [layers, setLayers] = useState<DesignLayer[]>(
    structuredClone(defaultTpl.layers)
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    defaultTpl.layers[defaultTpl.layers.length - 1]?.id ?? ''
  );

  const [leftTab, setLeftTab] = useState<'prompt' | 'templates' | 'layers'>(
    'prompt'
  );
  const [templateFilter, setTemplateFilter] = useState<'All' | DesignCategory>(
    'All'
  );
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<DesignCategory>('Social Media');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    layerId: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    if (initialTemplate) {
      setProjectId(undefined);
      setTitle(initialTemplate.title);
      setCategory(initialTemplate.category);
      setWidth(initialTemplate.width);
      setHeight(initialTemplate.height);
      setBackgroundColor(initialTemplate.backgroundColor);
      const cloned = structuredClone(initialTemplate.layers);
      setLayers(cloned);
      setSelectedLayerId(cloned[cloned.length - 1]?.id ?? '');
    }
  }, [initialTemplate]);

  useEffect(() => {
    if (initialSavedDesign) {
      setProjectId(initialSavedDesign.id);
      setTitle(initialSavedDesign.title);
      setCategory(initialSavedDesign.category);
      setWidth(initialSavedDesign.width);
      setHeight(initialSavedDesign.height);
      setBackgroundColor(initialSavedDesign.backgroundColor);
      try {
        const parsed = JSON.parse(initialSavedDesign.layersJson) as DesignLayer[];
        setLayers(parsed);
        setSelectedLayerId(parsed[parsed.length - 1]?.id ?? '');
      } catch {
        setLayers([]);
      }
    }
  }, [initialSavedDesign]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;

  const applyTemplate = (tpl: DesignTemplate) => {
    setProjectId(undefined);
    setTitle(tpl.title);
    setCategory(tpl.category);
    setWidth(tpl.width);
    setHeight(tpl.height);
    setBackgroundColor(tpl.backgroundColor);
    const cloned = structuredClone(tpl.layers);
    setLayers(cloned);
    setSelectedLayerId(cloned[cloned.length - 1]?.id ?? '');
    setFeedback({ type: 'success', text: `Loaded "${tpl.title}" template.` });
  };

  const handleGenerateAiDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (user && !spendCredits(2)) {
      setFeedback({
        type: 'error',
        text: 'Not enough credits (2 credits required). Top up credits in the Admin Panel.',
      });
      return;
    }

    setGeneratingAi(true);
    setFeedback(null);

    const dims =
      aiCategory === 'YouTube Thumbnails'
        ? { w: 1280, h: 720 }
        : aiCategory === 'Logos'
        ? { w: 1000, h: 1000 }
        : aiCategory === 'Posters'
        ? { w: 1080, h: 1440 }
        : { w: 1080, h: 1080 };

    try {
      const gen = generateDemoDesign({
        prompt: aiPrompt.trim(),
        category: aiCategory,
      });
      const newLayers = buildDesignLayersFromAi(gen, aiCategory);
      setProjectId(undefined);
      setTitle(gen.title || 'AI Studio Composition');
      setCategory(aiCategory);
      setWidth(dims.w);
      setHeight(dims.h);
      setBackgroundColor(gen.backgroundColor || '#0B0E14');
      setLayers(newLayers);
      setSelectedLayerId(newLayers[newLayers.length - 1]?.id ?? '');
      setLeftTab('layers');
      setFeedback({
        type: 'success',
        text: 'Generated layered composition ready for customization (2 credits used).',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'Unable to generate design.',
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const updateLayer = (id: string, patch: Partial<DesignLayer>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer))
    );
  };

  const moveLayer = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= layers.length) return;
    const copy = [...layers];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setLayers(copy);
  };

  const duplicateLayer = (layer: DesignLayer) => {
    const clone: DesignLayer = {
      ...structuredClone(layer),
      id: `layer-${Date.now()}`,
      name: `${layer.name} Copy`,
      x: Math.min(85, layer.x + 3),
      y: Math.min(85, layer.y + 3),
    };
    setLayers((prev) => [...prev, clone]);
    setSelectedLayerId(clone.id);
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (selectedLayerId === id) {
        setSelectedLayerId(next[next.length - 1]?.id ?? '');
      }
      return next;
    });
  };

  const addNewLayer = (kind: 'text' | 'rect' | 'circle' | 'image') => {
    const id = `layer-${Date.now()}`;
    let layer: DesignLayer;
    if (kind === 'text') {
      layer = {
        id,
        name: 'Text Layer',
        type: 'text',
        visible: true,
        x: 15,
        y: 42,
        width: 70,
        height: 12,
        rotation: 0,
        opacity: 1,
        text: 'New Editorial Heading',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 52,
        fontWeight: '700',
        letterSpacing: -1,
        textAlign: 'left',
        lineHeight: 1.15,
        color: '#F8FAFC',
      };
    } else if (kind === 'rect') {
      layer = {
        id,
        name: 'Rectangle Block',
        type: 'rect',
        visible: true,
        x: 20,
        y: 25,
        width: 40,
        height: 24,
        rotation: 0,
        opacity: 0.9,
        color: '#4F46E5',
        borderRadius: 14,
      };
    } else if (kind === 'circle') {
      layer = {
        id,
        name: 'Geometric Circle',
        type: 'circle',
        visible: true,
        x: 30,
        y: 25,
        width: 28,
        height: 28,
        rotation: 0,
        opacity: 0.85,
        color: '#F59E0B',
      };
    } else {
      const fallbackImg =
        category === 'YouTube Thumbnails'
          ? ASSET_YOUTUBE_TECH
          : category === 'Posters'
          ? ASSET_POSTER_ARCH
          : ASSET_SOCIAL_PRODUCT;
      layer = {
        id,
        name: 'Studio Photo Layer',
        type: 'image',
        visible: true,
        x: 10,
        y: 10,
        width: 80,
        height: 50,
        rotation: 0,
        opacity: 0.95,
        imageUrl: fallbackImg,
      };
    }
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(id);
    setLeftTab('layers');
  };

  const handlePointerDownLayer = (
    e: React.PointerEvent,
    layer: DesignLayer
  ) => {
    e.stopPropagation();
    setSelectedLayerId(layer.id);
    dragState.current = {
      layerId: layer.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: layer.x,
      origY: layer.y,
    };
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (!dragState.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragState.current.startClientX) / rect.width) * 100;
    const dyPct =
      ((e.clientY - dragState.current.startClientY) / rect.height) * 100;

    updateLayer(dragState.current.layerId, {
      x: Math.round((dragState.current.origX + dxPct) * 10) / 10,
      y: Math.round((dragState.current.origY + dyPct) * 10) / 10,
    });
  };

  const handlePointerUpCanvas = () => {
    dragState.current = null;
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    setExporting(format);
    setFeedback(null);
    try {
      const payload = { title, width, height, backgroundColor, layers };
      if (format === 'png') {
        await downloadDesignAsPng(payload);
      } else {
        await downloadDesignAsPdf(payload);
      }
      setFeedback({
        type: 'success',
        text: `Exported high-resolution ${format.toUpperCase()} (${width}×${height}).`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Export failed.',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleSaveProject = async () => {
    if (!user) {
      onRequestAuth();
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const saved = saveLocalDesign({
        id: projectId,
        title,
        category,
        width,
        height,
        backgroundColor,
        layersJson: JSON.stringify(layers),
        prompt: aiPrompt || null,
        ownerEmail: user.email,
      });
      setProjectId(saved.id);
      setFeedback({ type: 'success', text: 'Design saved to your workspace.' });
      onSavedSuccess();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Save failed.',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates =
    templateFilter === 'All'
      ? DESIGN_TEMPLATES
      : DESIGN_TEMPLATES.filter((t) => t.category === templateFilter);

  // Compute responsive display size keeping exact aspect ratio inside the center stage
  const maxStageWidth = 540;
  const maxStageHeight = 520;
  const scaleRatio = Math.min(maxStageWidth / width, maxStageHeight / height);
  const displayWidth = Math.round(width * scaleRatio);
  const displayHeight = Math.round(height * scaleRatio);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Rail: AI Prompt, Templates, Layers */}
      <aside className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md overflow-hidden">
        <div className="p-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-1">
          {(
            [
              { id: 'prompt', label: 'AI Prompt' },
              { id: 'templates', label: 'Templates' },
              { id: 'layers', label: 'Layers' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLeftTab(tab.id)}
              className={`flex-1 py-2 px-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                leftTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-[620px] overflow-y-auto space-y-4">
          {leftTab === 'prompt' && (
            <form onSubmit={handleGenerateAiDesign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Format Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      'Social Media',
                      'YouTube Thumbnails',
                      'Logos',
                      'Posters',
                    ] as DesignCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAiCategory(cat)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-left transition-colors truncate ${
                        aiCategory === cat
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="design-ai-prompt"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Describe Your Graphic
                </label>
                <textarea
                  id="design-ai-prompt"
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Minimalist Tokyo coffee roastery launch poster in deep charcoal and warm amber gold"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={generatingAi || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                {generatingAi ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generatingAi ? 'Composing Layers...' : 'Generate Composition'}
              </button>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Quick Starter Prompts
                </p>
                {[
                  'Luxury ceramic speaker reveal for Instagram square',
                  'YouTube thumbnail for AI coding speedrun in obsidian & indigo',
                  'Nordic architectural design studio emblem wordmark',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setAiPrompt(sample)}
                    className="w-full text-left text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1.5 px-2.5 rounded-md bg-slate-100/70 dark:bg-slate-800/40 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </form>
          )}

          {leftTab === 'templates' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTemplateFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      templateFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {filteredTemplates.map((tpl) => {
                  const previewImg = tpl.layers.find((l) => l.imageUrl)?.imageUrl;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 p-2.5 transition-colors bg-slate-50/70 dark:bg-[#090C12]/60 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-md shrink-0 overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center"
                          style={{ backgroundColor: tpl.backgroundColor }}
                        >
                          {previewImg ? (
                            <img
                              src={previewImg}
                              alt={tpl.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">
                              {tpl.width}×{tpl.height}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {tpl.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
                            {tpl.category} · {tpl.width} × {tpl.height}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {leftTab === 'layers' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => addNewLayer('text')}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <TypeIcon className="w-3.5 h-3.5" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => addNewLayer('rect')}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <Square className="w-3.5 h-3.5" />
                  Shape
                </button>
                <button
                  type="button"
                  onClick={() => addNewLayer('circle')}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <Circle className="w-3.5 h-3.5" />
                  Circle
                </button>
              </div>

              <div className="space-y-1.5">
                {[...layers].reverse().map((layer, revIdx) => {
                  const actualIndex = layers.length - 1 - revIdx;
                  const active = layer.id === selectedLayerId;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {layer.name}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Bring layer forward"
                          onClick={() => moveLayer(actualIndex, 1)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          aria-label="Send layer backward"
                          onClick={() => moveLayer(actualIndex, -1)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          aria-label="Toggle visibility"
                          onClick={() =>
                            updateLayer(layer.id, { visible: !layer.visible })
                          }
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label="Duplicate layer"
                          onClick={() => duplicateLayer(layer)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete layer"
                          onClick={() => deleteLayer(layer.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Center Stage: Live Interactive Canvas & Export Toolbar */}
      <section className="lg:col-span-6 space-y-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Design project title"
              className="bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none border-b border-transparent focus:border-indigo-500 max-w-[220px] truncate"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {category} · {width} × {height} px
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveProject}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>

            <button
              type="button"
              onClick={() => handleExport('png')}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              {exporting === 'png' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              PNG
            </button>

            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              PDF
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 studio-canvas-grid bg-slate-100/70 dark:bg-[#07090E] min-h-[540px] flex items-center justify-center p-6 overflow-hidden">
          <div
            ref={canvasRef}
            onPointerMove={handlePointerMoveCanvas}
            onPointerUp={handlePointerUpCanvas}
            onPointerLeave={handlePointerUpCanvas}
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              backgroundColor,
            }}
            className="relative overflow-hidden shadow-2xl select-none touch-none border border-black/10 dark:border-white/10"
          >
            {layers.map((layer) => {
              if (!layer.visible) return null;
              const isSelected = layer.id === selectedLayerId;
              const fontScale = displayWidth / 1080;

              return (
                <div
                  key={layer.id}
                  onPointerDown={(e) => handlePointerDownLayer(e, layer)}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    width: `${layer.width}%`,
                    height: `${layer.height}%`,
                    opacity: layer.opacity,
                    transform: `rotate(${layer.rotation}deg)`,
                  }}
                  className={`absolute cursor-move ${
                    isSelected
                      ? 'outline-2 outline-indigo-500 outline-offset-2'
                      : 'hover:outline-1 hover:outline-indigo-400/50'
                  }`}
                >
                  {layer.type === 'rect' && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: layer.color,
                        borderRadius: `${(layer.borderRadius ?? 0) * (displayWidth / width)}px`,
                        border:
                          layer.strokeColor && layer.strokeWidth
                            ? `${layer.strokeWidth * (displayWidth / width)}px solid ${layer.strokeColor}`
                            : undefined,
                      }}
                    />
                  )}

                  {layer.type === 'circle' && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: layer.color,
                        border:
                          layer.strokeColor && layer.strokeWidth
                            ? `${layer.strokeWidth * (displayWidth / width)}px solid ${layer.strokeColor}`
                            : undefined,
                      }}
                    />
                  )}

                  {layer.type === 'image' && layer.imageUrl && (
                    <img
                      src={layer.imageUrl}
                      alt={layer.name}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}

                  {layer.type === 'svg' && layer.svgPath && (
                    <svg
                      viewBox={layer.svgViewBox || '0 0 100 100'}
                      className="w-full h-full pointer-events-none"
                    >
                      <path
                        d={layer.svgPath}
                        fill={layer.color || '#FFFFFF'}
                        fillRule="evenodd"
                      />
                    </svg>
                  )}

                  {layer.type === 'text' && (
                    <div
                      className="w-full h-full whitespace-pre-wrap break-words"
                      style={{
                        fontFamily: layer.fontFamily || 'Plus Jakarta Sans',
                        fontSize: `${Math.max(8, (layer.fontSize ?? 48) * fontScale)}px`,
                        fontWeight: layer.fontWeight || '600',
                        letterSpacing: `${((layer.letterSpacing ?? 0) / 100)}em`,
                        textAlign: layer.textAlign || 'left',
                        lineHeight: layer.lineHeight ?? 1.2,
                        color: layer.color || '#FFFFFF',
                      }}
                    >
                      {layer.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right Inspector: Typography, Colors, Layer Geometry */}
      <aside className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 backdrop-blur-md p-4 space-y-5 max-h-[670px] overflow-y-auto">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
            Canvas Background
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              aria-label="Canvas background color"
              className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
            />
            {SWATCHES.slice(0, 6).map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={`Set background ${hex}`}
                onClick={() => setBackgroundColor(hex)}
                style={{ backgroundColor: hex }}
                className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-700"
              />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {selectedLayer ? selectedLayer.name : 'Select a Layer'}
            </h3>
            {selectedLayer && (
              <button
                type="button"
                onClick={() => addNewLayer('text')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Text
              </button>
            )}
          </div>

          {!selectedLayer ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any element on the canvas or in the Layers tab to edit typography, color, and position.
            </p>
          ) : (
            <div className="space-y-4">
              {selectedLayer.type === 'text' && (
                <>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Text Content
                    </label>
                    <textarea
                      rows={3}
                      value={selectedLayer.text ?? ''}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, { text: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Font Family
                      </label>
                      <select
                        value={selectedLayer.fontFamily ?? 'Plus Jakarta Sans'}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            fontFamily: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Weight
                      </label>
                      <select
                        value={selectedLayer.fontWeight ?? '600'}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            fontWeight: e.target.value as DesignLayer['fontWeight'],
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="400">Regular 400</option>
                        <option value="500">Medium 500</option>
                        <option value="600">SemiBold 600</option>
                        <option value="700">Bold 700</option>
                        <option value="800">ExtraBold 800</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Size ({selectedLayer.fontSize ?? 48}px)
                      </label>
                      <input
                        type="range"
                        min={16}
                        max={140}
                        value={selectedLayer.fontSize ?? 48}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Alignment
                      </label>
                      <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() =>
                              updateLayer(selectedLayer.id, { textAlign: align })
                            }
                            className={`flex-1 py-1 text-[11px] font-medium capitalize ${
                              selectedLayer.textAlign === align
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedLayer.type !== 'image' && (
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    Layer Color
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <input
                      type="color"
                      value={selectedLayer.color ?? '#FFFFFF'}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, { color: e.target.value })
                      }
                      aria-label="Layer color"
                      className="w-7 h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                    />
                    {SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={`Set layer color ${hex}`}
                        onClick={() => updateLayer(selectedLayer.id, { color: hex })}
                        style={{ backgroundColor: hex }}
                        className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    Opacity ({Math.round((selectedLayer.opacity ?? 1) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round((selectedLayer.opacity ?? 1) * 100)}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        opacity: Number(e.target.value) / 100,
                      })
                    }
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    Rotation ({selectedLayer.rotation ?? 0}°)
                  </label>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={selectedLayer.rotation ?? 0}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        rotation: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    X Position (%)
                  </label>
                  <input
                    type="number"
                    value={selectedLayer.x}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { x: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    Y Position (%)
                  </label>
                  <input
                    type="number"
                    value={selectedLayer.y}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { y: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    Width (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={selectedLayer.width}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        width: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    Height (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={selectedLayer.height}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        height: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090C12] px-2 py-1 text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
