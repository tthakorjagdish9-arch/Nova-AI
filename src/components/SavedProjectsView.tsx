import React, { useEffect, useState } from 'react';
import { Film, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  deleteLocalDesign,
  deleteLocalReel,
  listLocalDesigns,
  listLocalReels,
} from '../lib/localStudioApi';
import { SavedDesignProject, SavedReelProject } from '../types/studio';

interface SavedProjectsViewProps {
  refreshTrigger: number;
  onOpenDesign: (project: SavedDesignProject) => void;
  onOpenReel: (reel: SavedReelProject) => void;
  onSwitchToDesign: () => void;
  onSwitchToReel: () => void;
}

export default function SavedProjectsView({
  refreshTrigger,
  onOpenDesign,
  onOpenReel,
  onSwitchToDesign,
  onSwitchToReel,
}: SavedProjectsViewProps) {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<SavedDesignProject[]>([]);
  const [reels, setReels] = useState<SavedReelProject[]>([]);

  useEffect(() => {
    setDesigns(listLocalDesigns(user?.email));
    setReels(listLocalReels(user?.email));
  }, [user?.email, refreshTrigger]);

  const handleDeleteDesign = (id: number) => {
    deleteLocalDesign(id);
    setDesigns((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDeleteReel = (id: number) => {
    deleteLocalReel(id);
    setReels((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Saved Workspace Projects
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Signed in as {user?.email}
        </p>
      </div>

      {/* Saved Graphic Designs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Graphic Designs ({designs.length})
          </h3>
          <button
            type="button"
            onClick={onSwitchToDesign}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            New Graphic Design
          </button>
        </div>

        {designs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F141D]/70 p-6 text-sm text-slate-500 dark:text-slate-400">
            No saved graphic designs yet. Open Design Studio and click Save to store your layout here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design) => (
              <div
                key={design.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: design.backgroundColor }}
                  >
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpenDesign(design)}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-500 truncate block text-left"
                    >
                      {design.title}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
                      {design.category} · {design.width} × {design.height}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDesign(design.id)}
                  aria-label="Delete saved design"
                  className="p-2 text-slate-400 hover:text-rose-500 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Video Reels */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Video Reels ({reels.length})
          </h3>
          <button
            type="button"
            onClick={onSwitchToReel}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            New Video Reel
          </button>
        </div>

        {reels.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F141D]/70 p-6 text-sm text-slate-500 dark:text-slate-400">
            No saved reel projects yet. Build a 9:16 storyboard in Reel Studio and click Save Reel Project.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141D] p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center">
                    <Film className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpenReel(reel)}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-500 truncate block text-left"
                    >
                      {reel.title}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {reel.voiceAccent} Voice · {reel.voiceName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReel(reel.id)}
                  aria-label="Delete saved reel"
                  className="p-2 text-slate-400 hover:text-rose-500 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
