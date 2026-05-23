import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { Topic, Problem } from '../../types';

interface Props {
  problem?: Problem;
  topics: Topic[];
  onClose: () => void;
  onSaved: () => void;
}

const emptyResources = { youtubeUrl: '', leetcodeUrl: '', codeforcesUrl: '', articleUrl: '' };

const AVG_TIME_OPTIONS = ['10-20 min', '20-30 min', '30-40 min', '40-60 min', '50-70 min'];

const ALL_COMPANIES = [
  'Accenture', 'Accolite', 'Adobe', 'Airbnb', 'Amazon', 'Amdocs', 'Apple', 'Arcesium',
  'Atlassian', 'Bank of Newyork', 'Blinkit', 'Bloomberg', 'Brocade', 'Cisco', 'Citadel',
  'Citrix', 'DE Shaw', 'Deloitte', 'Directi', 'Doordash', 'Dunzo', 'Ebay', 'Facebook',
  'FactSet', 'Fiverr', 'Flipkart', 'GoDaddy', 'Goldman Sachs', 'Google', 'GreyOrange',
  'HCL', 'Hike', 'IBM', 'Infosys', 'InMobi', 'Intel', 'Intuit', 'Josh Technology',
  'JP Morgan', 'Juniper', 'Linkedin', 'MakeMyTrip', 'MAQ Software', 'Media.Net', 'Meta',
  'Microsoft', 'Miro', 'Mobicip', 'Moonfrog Labs', 'Morgan Stanley', 'Myntra', 'Nagarro',
  'Nearbuy', 'Netflix', 'Networks', 'Nike', 'Nvidia', 'OATS', 'Ola', 'Optum', 'Oracle',
  'OYO', 'PayPal', 'Paytm', 'Payu', 'Philips', 'Phone Pe', 'Pinterest', 'Pubmatic',
  'Qualcomm', 'Quikr', 'Rubrik', 'Salesforce', 'Samsung', 'SAP Labs', 'Sharechat',
  'Siemens', 'Snapdeal', 'Societe Generale', 'Sprinklr', 'Stripe', 'Swiggy', 'Synopsys',
  'TCS', 'Tejas Network', 'Times Internet', 'Tower Research Capital', 'Uber', 'Unisys',
  'Visa', 'VMWare', 'Walmart', 'Wipro', 'Yahoo', 'Yandex', 'Zoho',
];

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
    companyTags: problem?.companyTags ?? [] as string[],
    avgTime: problem?.avgTime ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [companyDropOpen, setCompanyDropOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close company dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyDropOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function setResource(key: keyof typeof emptyResources, value: string) {
    setForm((f) => ({ ...f, resources: { ...f.resources, [key]: value } }));
  }

  function toggleCompany(company: string) {
    setForm((f) => ({
      ...f,
      companyTags: f.companyTags.includes(company)
        ? f.companyTags.filter((c) => c !== company)
        : [...f.companyTags, company],
    }));
  }

  const filteredCompanies = companySearch.trim()
    ? ALL_COMPANIES.filter((c) => c.toLowerCase().includes(companySearch.toLowerCase()))
    : ALL_COMPANIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 my-4 bg-surface-2 border border-dim"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-syne font-bold text-xl mb-5 text-prose">
          {isEdit ? 'Edit Problem' : 'New Problem'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <Field label="Topic">
              <select
                value={form.topicId}
                onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                required
                className="w-full bg-transparent outline-none text-sm py-2 px-3 appearance-none text-prose"
              >
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
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
              className="w-full bg-transparent outline-none text-sm py-2 px-3 text-prose"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Difficulty">
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full bg-transparent outline-none text-sm py-2 px-3 appearance-none text-prose"
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
                className="w-full bg-transparent outline-none text-sm py-2 px-3 text-prose"
              />
            </Field>
            <Field label="Subtopic">
              <input
                value={form.subtopic}
                onChange={(e) => setForm({ ...form, subtopic: e.target.value })}
                placeholder="e.g. Two Pointers"
                className="w-full bg-transparent outline-none text-sm py-2 px-3 text-prose"
              />
            </Field>
          </div>

          {/* Avg Time */}
          <Field label="Avg time">
            <select
              value={form.avgTime}
              onChange={(e) => setForm({ ...form, avgTime: e.target.value })}
              className="w-full bg-transparent outline-none text-sm py-2 px-3 appearance-none text-prose"
            >
              <option value="">— none —</option>
              {AVG_TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          {/* Company tags */}
          <div ref={companyRef} className="space-y-2">
            <span className="block text-xs font-mono-dm uppercase tracking-wider text-muted">
              Companies
            </span>

            {/* Selected chips */}
            {form.companyTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.companyTags.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-accent/50 text-accent bg-accent/10"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => toggleCompany(c)}
                      className="text-accent hover:text-hard transition-colors leading-none"
                      aria-label={`Remove ${c}`}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input + dropdown */}
            <div className="relative">
              <div className="flex items-center rounded-lg border border-dim bg-surface">
                <input
                  type="text"
                  placeholder="Search companies…"
                  value={companySearch}
                  onChange={(e) => { setCompanySearch(e.target.value); setCompanyDropOpen(true); }}
                  onFocus={() => setCompanyDropOpen(true)}
                  className="flex-1 bg-transparent outline-none text-sm py-2 px-3 text-prose"
                />
                {companySearch && (
                  <button
                    type="button"
                    onClick={() => setCompanySearch('')}
                    className="px-2 text-muted hover:text-prose"
                    aria-label="Clear search"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>

              {companyDropOpen && filteredCompanies.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-44 overflow-y-auto rounded-lg border border-dim shadow-lg bg-surface-2">
                  {filteredCompanies.map((c) => {
                    const selected = form.companyTags.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { toggleCompany(c); setCompanySearch(''); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface flex items-center gap-2 ${
                          selected ? 'text-accent font-medium' : 'text-prose'
                        }`}
                      >
                        <span className="w-4 flex justify-center shrink-0">
                          {selected && <Check size={14} strokeWidth={2.5} />}
                        </span>
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <span className="block text-xs font-mono-dm uppercase tracking-wider text-muted">
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
                  className="flex items-center rounded-lg overflow-hidden border border-dim bg-surface"
                >
                  <span className="px-3 text-xs shrink-0 text-muted">{label}</span>
                  <input
                    type="url"
                    value={form.resources[key]}
                    onChange={(e) => setResource(key, e.target.value)}
                    placeholder="https://…"
                    className="flex-1 bg-transparent outline-none text-sm py-2 pr-3 text-prose"
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
              className="w-full bg-transparent outline-none text-sm py-2 px-3 text-prose"
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
      <span className="block text-xs font-mono-dm uppercase tracking-wider mb-1.5 text-muted">
        {label}
      </span>
      <div className="rounded-lg border border-dim bg-surface">
        {children}
      </div>
    </label>
  );
}
