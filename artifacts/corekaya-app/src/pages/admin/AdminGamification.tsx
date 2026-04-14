import React, { useState, useEffect } from 'react';

interface Badge {
  id: number;
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  xpReward: number;
  unlockConditionType: string;
  unlockConditionValue: number;
  earnedCount?: number;
}

interface UsersProgressEntry {
  sessionId: string;
  totalXp: number;
  level: number;
  levelName: string;
  streak: number;
  completedWorkouts: number;
}

const headers = () => ({
  'Content-Type': 'application/json',
  'x-session-id': 'admin',
  'x-admin-password': 'corekaya2025',
});

export function AdminGamification() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [usersProgress, setUsersProgress] = useState<UsersProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'badges' | 'users'>('badges');
  const [editBadge, setEditBadge] = useState<Badge | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyBadge: Omit<Badge, 'id'> = {
    slug: '', name: '', description: '', iconEmoji: '🏅',
    xpReward: 50, unlockConditionType: 'workout_count', unlockConditionValue: 1,
  };
  const [form, setForm] = useState<Omit<Badge, 'id'>>(emptyBadge);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [b, u] = await Promise.all([
        fetch('/api/admin/badges', { headers: headers() }).then(r => r.json()),
        fetch('/api/admin/users-progress', { headers: headers() }).then(r => r.json()),
      ]);
      setBadges(b.badges ?? []);
      setUsersProgress(u.users ?? []);
    } catch (e) {
      setError('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (badge: Badge) => {
    setEditBadge(badge);
    setForm({ slug: badge.slug, name: badge.name, description: badge.description, iconEmoji: badge.iconEmoji, xpReward: badge.xpReward, unlockConditionType: badge.unlockConditionType, unlockConditionValue: badge.unlockConditionValue });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditBadge(null);
    setForm(emptyBadge);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this badge?')) return;
    await fetch(`/api/admin/badges/${id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editBadge) {
        await fetch(`/api/admin/badges/${editBadge.id}`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/admin/badges', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      load();
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gamification</h1>
          <p className="text-sm text-gray-500 mt-1">Manage badges, XP rewards, and user progress</p>
        </div>
        {tab === 'badges' && (
          <button onClick={handleNew} className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-dark transition-colors">
            + New Badge
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('badges')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'badges' ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Badges</button>
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'users' ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>User Progress</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : tab === 'badges' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Badge</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">XP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earned by</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {badges.map(badge => (
                <tr key={badge.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.iconEmoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{badge.name}</p>
                        <p className="text-xs text-gray-400">{badge.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{badge.unlockConditionType}</span>
                    <span className="ml-2 text-gray-900 font-medium">≥ {badge.unlockConditionValue}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange">+{badge.xpReward}</td>
                  <td className="px-4 py-3 text-gray-500">{badge.earnedCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(badge)} className="text-xs text-navy hover:underline">Edit</button>
                      <button onClick={() => handleDelete(badge.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Session</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">XP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Streak</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workouts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersProgress.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.sessionId}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{u.level}</span>
                    <span className="text-gray-400 ml-1 text-xs">· {u.levelName}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange">{u.totalXp}</td>
                  <td className="px-4 py-3 text-gray-700">🔥 {u.streak}</td>
                  <td className="px-4 py-3 text-gray-700">{u.completedWorkouts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Badge Form Sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{editBadge ? 'Edit Badge' : 'New Badge'}</h3>
            <div className="space-y-3">
              {(['iconEmoji', 'name', 'slug', 'description'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 tracking-wider">{field}</label>
                  <input
                    value={form[field] as string}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-navy"
                    placeholder={field}
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 tracking-wider">XP Reward</label>
                  <input type="number" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 tracking-wider">Condition</label>
                  <input value={form.unlockConditionType} onChange={e => setForm(f => ({ ...f, unlockConditionType: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 tracking-wider">Value</label>
                  <input type="number" value={form.unlockConditionValue} onChange={e => setForm(f => ({ ...f, unlockConditionValue: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-navy" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-navy text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Badge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
