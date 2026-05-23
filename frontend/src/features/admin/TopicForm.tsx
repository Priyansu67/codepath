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
    title: topic?.title ?? '',
    description: topic?.description ?? '',
    icon: topic?.icon ?? '📚',
    order: topic?.order ?? 1,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit && topic) {
        await adminApi.updateTopic(topic._id, form);
      } else {
        await adminApi.createTopic(form);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      >
        <h3 className="font-syne font-bold text-xl mb-5">
          {isEdit ? 'Edit Topic' : 'New Topic'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Arrays & Hashing"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Icon (emoji)">
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="📚"
                maxLength={4}
              />
            </Field>
            <Field label="Display order">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                required
                min={1}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Short description of the topic"
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
      <span className="block text-xs font-mono-dm uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div
        className="[&>input]:w-full [&>input]:bg-transparent [&>input]:outline-none [&>input]:text-sm [&>input]:py-2 [&>input]:px-3
                   [&>textarea]:w-full [&>textarea]:bg-transparent [&>textarea]:outline-none [&>textarea]:text-sm [&>textarea]:py-2 [&>textarea]:px-3 [&>textarea]:resize-none
                   rounded-lg"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {children}
      </div>
    </label>
  );
}
