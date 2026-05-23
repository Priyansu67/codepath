import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import type { Topic } from '../../types';

interface Props {
  topic?: Topic;
  onClose: () => void;
  onSaved: () => void;
}

export function TopicForm({ topic, onClose, onSaved }: Props) {
  const isEdit = Boolean(topic);
  const [form, setForm] = useState({
    title:       topic?.title       ?? '',
    description: topic?.description ?? '',
    order:       topic?.order       ?? 1,
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit && topic) await adminApi.updateTopic(topic._id, form);
      else                  await adminApi.createTopic(form);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl p-6 bg-surface-2 border border-dim">
        <h3 className="font-syne font-bold text-xl mb-5 text-prose">
          {isEdit ? 'Edit Topic' : 'New Topic'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Arrays & Hashing"
              className="w-full bg-transparent outline-none text-sm py-2 px-3 text-prose"
            />
          </Field>

          <Field label="Display order">
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              required
              min={1}
              className="w-full bg-transparent outline-none text-sm py-2 px-3 text-prose"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Short description of the topic"
              className="w-full bg-transparent outline-none text-sm py-2 px-3 resize-none text-prose"
            />
          </Field>

          {error && <p className="text-sm text-hard">{error}</p>}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-dim text-muted hover:text-prose transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm rounded-lg font-medium disabled:opacity-50 bg-accent text-white hover:opacity-80 transition-opacity"
            >
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create topic'}
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
      <span className="block text-xs font-mono-dm uppercase tracking-wider mb-1.5 text-muted">{label}</span>
      <div className="rounded-lg border border-dim bg-surface">{children}</div>
    </label>
  );
}
