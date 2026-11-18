import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DESIGN_TEMPLATES } from '../data/templates';
import { DesignCategory, DesignTemplate } from '../types/studio';

interface TemplatesShowcaseProps {
  onSelectTemplate: (template: DesignTemplate) => void;
}

const CATEGORIES: Array<'All' | DesignCategory> = [
  'All',
  'Social Media',
  'YouTube Thumbnails',
  'Logos',
  'Posters',
];

export default function TemplatesShowcase({
  onSelectTemplate,
}: TemplatesShowcaseProps) {
  const [filter, setFilter] = useState<'All' | DesignCategory>('All');

  const items =
    filter === 'All'
      ? DESIGN_TEMPLATES
      : DESIGN_TEMPLATES.filter((t) => t.category === filter);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Professional Studio Templates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select any ready-made layout to customize typography, layers, and color tokens before exporting in PNG or PDF.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 w-fit overflow-x-auto max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                filter === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((tpl) => {
          const heroImg = tpl.layers.find((l) => l.imageUrl)?.imageUrl;
          const headline = tpl.layers.find((l) => l.type === 'text' && (l.fontSize ?? 0) >= 50)?.text;
          const svgLayer = tpl.layers.find((l) => l.type === 'svg');

          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTemplate(tpl);
                }
              }}
              className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0F141D] overflow-hidden hover:border-indigo-500/60 transition-colors flex flex-col"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden flex items-center justify-center p-5"
                style={{ backgroundColor: tpl.backgroundColor }}
              >
                {heroImg ? (
                  <>
                    <img
                      src={heroImg}
                      alt={tpl.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </>
                ) : svgLayer?.svgPath ? (
                  <svg
                    viewBox={svgLayer.svgViewBox || '0 0 100 100'}
                    className="w-16 h-16 opacity-90"
                  >
                    <path
                      d={svgLayer.svgPath}
                      fill={svgLayer.color || '#FFFFFF'}
                      fillRule="evenodd"
                    />
                  </svg>
                ) : null}

                {headline && (
                  <p className="relative z-10 text-sm font-bold text-white line-clamp-2 text-center mt-auto drop-shadow">
                    {headline}
                  </p>
                )}
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 truncate">
                    {tpl.category} · {tpl.width} × {tpl.height}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
