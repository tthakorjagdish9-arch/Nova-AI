import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminPatchLocalUser,
  listAllLocalUsers,
  listLocalDesigns,
  listLocalReels,
  listLocalSupportTickets,
  updateLocalSupportTicketStatus,
} from '../lib/localStudioApi';
import { DbUserProfile, SupportTicketItem } from '../types/studio';

export default function AdminPanel() {
  const { dbUser, refreshProfile } = useAuth();

  const [users, setUsers] = useState<DbUserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [designCount, setDesignCount] = useState(0);
  const [reelCount, setReelCount] = useState(0);

  const loadAdminData = useCallback(() => {
    setUsers(listAllLocalUsers());
    setTickets(listLocalSupportTickets());
    setDesignCount(listLocalDesigns().length);
    setReelCount(listLocalReels().length);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleGrantCredits = async (target: DbUserProfile, delta: number) => {
    const updated = adminPatchLocalUser(target.id, {
      credits: target.credits + delta,
    });
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
      if (dbUser?.id === target.id) {
        await refreshProfile();
      }
    }
  };

  const handleToggleRole = async (target: DbUserProfile, nextRole: string) => {
    const updated = adminPatchLocalUser(target.id, { role: nextRole });
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
      if (dbUser?.id === target.id) {
        await refreshProfile();
      }
    }
  };

  const handleTicketStatus = (ticket: SupportTicketItem, status: string) => {
    const updated = updateLocalSupportTicketStatus(ticket.id, status);
    if (updated) {
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? updated : t)));
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Creators', value: users.length },
          { label: 'Saved Designs', value: designCount },
          { label: 'Video Reels', value: reelCount },
          { label: 'Support Tickets', value: tickets.length },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* User & Welcome Credits Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Users &amp; Credits Management
          </h3>
          <button
            type="button"
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-5 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium text-right">Credits</th>
                <th className="py-3 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <td className="py-3 px-5">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {u.displayName || 'Nova Creator'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {u.email}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleToggleRole(u, e.target.value)}
                      className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090C12] px-2 py-1 text-xs"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {u.credits}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleGrantCredits(u, 25)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 mr-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      25
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGrantCredits(u, 50)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      50
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Tickets Queue */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F141D]/85 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Support Ticket Queue ({tickets.length})
          </h3>
        </div>

        {tickets.length === 0 ? (
          <div className="p-6 text-xs text-slate-500 dark:text-slate-400">
            No support tickets submitted yet. Submit one in Help &amp; Support to manage it here.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-500 tabular-nums">
                      #{t.id}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {t.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.email} · {t.category} · {t.priority}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {t.message}
                  </p>
                </div>

                <select
                  value={t.status}
                  onChange={(e) => handleTicketStatus(t, e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090C12] px-3 py-1.5 text-xs font-medium shrink-0"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
