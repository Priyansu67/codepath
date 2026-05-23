import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import type { Topic, Problem } from '../../types';

interface Props {
  problem?: Problem;
  topics: Topic[];
  onClose: () => void;
  onSaved: () => void;
}

const emptyResources = { youtubeUrl: '', leetcodeUrl: '', codeforcesUrl: '', articleUrl: '' };

export function ProblemForm({ problem, topics, onClose, onSaved }: Props) {
  const isEdit = Boolean(problem);
  const [form, setForm] = useState({
    topicId: problem?.topicId ?? (topics[0]?._id ?? ''),
    title: problem?.title ?? '',
    difficulty: problem?.difficulty ?? ('easy' as 'easy' | 'medium' | 'hard'),
    order: problem?.order ?? 1,
    subtopic: problem?.subtopic ?? '',
    resources: problem?.resources ?? emptyResources,
    tags: problem?.tags?.join(', ') ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function setResource(key: keyof typeof emptyResources, value: string) {
    setForm((f) => ({ ...f, resources: { ...f.resources, [key]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit && problem) {
        const { topicId: _t, ...rest } = payload;
        await adminApi.updateProblem(problem._id, rest);
      } else {
        await adminApi.createProblem(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 my-4"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-syne font-bold text-xl mb-5">
          {isEdit ? 'Edit Problem' : 'New Problem'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <Field label="Topic">
              <select
                value={form.topicId}
                onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                required
              >
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.icon} {t.title}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Problem title">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Two Sum"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Difficulty">
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Order #">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                required
                min={1}
              />
            </Field>
            <Field label="Subtopic">
              <input
                value={form.subtopic}
                onChange={(e) => setForm({ ...form, subtopic: e.target.value })}
                placeholder="e.g. Two Pointers"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-mono-dm uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Resources (optional)
            </span>
            <div className="space-y-2">
              {(
                [
                  { key: 'youtubeUrl', label: 'YouTube URL' },
                  { key: 'leetcodeUrl', label: 'LeetCode URL' },
                  { key: 'articleUrl', label: 'Article URL' },
                  { key: 'codeforcesUrl', label: 'Codeforces URL' },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <span className="px-3 text-xs shrink-0" style={{ color: 'var(--muted)' }}>
                    {label}
                  </span>
                  <input
                    type="url"
                    value={form.resources[key]}
                    onChange={(e) => setResource(key, e.target.value)}
                    placeholder="https://…"
                    className="flex-1 bg-transparent outline-none text-sm py-2 pr-3"
                  />
                </div>
              ))}
            </div>
          </div>

          <Field label="Tags (comma-separated)">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="array, hash-map, two-pointer"
            />
          </Field>

          {error && (
            <p className="text-sm" style={{ color: 'var(--hard)' }}>{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono-dm uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div
        className="[&>input]:w-full [&>input]:bg-transparent [&>input]:outline-none [&>input]:text-sm [&>input]:py-2 [&>input]:px-3
                   [&>select]:w-full [&>select]:bg-transparent [&>select]:outline-none [&>select]:text-sm [&>select]:py-2 [&>select]:px-3 [&>select]:appearance-none
                   rounded-lg"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {children}
      </div>
    </label>
  );
}
