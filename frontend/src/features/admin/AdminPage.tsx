import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { TopicForm } from './TopicForm';
import { ProblemForm } from './ProblemForm';
import { UserMenu } from '../../components/UserMenu';
import { TopicIcon } from '../../components/TopicIcon';
import type { Topic, Problem } from '../../types';
import type { AdminStats } from '../../api/admin';

type Tab = 'topics' | 'problems';

const diffPillCls: Record<'easy' | 'medium' | 'hard', string> = {
  easy:   'text-easy border border-easy/50',
  medium: 'text-medium border border-medium/50',
  hard:   'text-hard border border-hard/50',
};

export function AdminPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('topics');

  const [topicModal, setTopicModal] = useState<{ open: boolean; topic?: Topic }>({ open: false });
  const [problemModal, setProblemModal] = useState<{ open: boolean; problem?: Problem }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'topic' | 'problem'; id: string; name: string } | null>(null);

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  });

  const { data: topics = [], isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['admin', 'topics'],
    queryFn: adminApi.listTopics,
    enabled: tab === 'topics',
  });

  const { data: problems = [], isLoading: problemsLoading } = useQuery<Problem[]>({
    queryKey: ['admin', 'problems'],
    queryFn: () => adminApi.listProblems(),
    enabled: tab === 'problems',
  });

  const deleteTopic = useMutation({
    mutationFn: (id: string) => adminApi.deleteTopic(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'topics'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setDeleteConfirm(null);
    },
  });

  const deleteProblem = useMutation({
    mutationFn: (id: string) => adminApi.deleteProblem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'problems'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setDeleteConfirm(null);
    },
  });

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—' },
    { label: 'Total Problems', value: stats?.totalProblems ?? '—' },
    { label: 'Completions', value: stats?.totalCompletions ?? '—' },
  ];

  return (
    <div className="bg-app min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-app/85 backdrop-blur-xl border-b border-dim">
        <div className="flex items-center gap-3">
          <div className="font-syne font-extrabold text-xl tracking-tight text-prose">
            Code<span className="text-accent">Path</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono-dm uppercase tracking-widest bg-accent text-white">
            Admin
          </span>
        </div>
        <UserMenu />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-syne font-extrabold text-3xl tracking-tight mb-2 text-prose">Admin Panel</h1>
        <p className="text-sm mb-8 text-muted">Manage topics and problems</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value }) => (
            <div key={label} className="rounded-xl p-5 bg-surface border border-dim">
              <div className="text-xs font-mono-dm uppercase tracking-widest mb-1 text-muted">{label}</div>
              <div className="font-syne font-extrabold text-3xl text-accent">{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit bg-surface">
          {(['topics', 'problems'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-accent text-white' : 'text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Topics tab */}
        {tab === 'topics' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-syne font-bold text-lg text-prose">Topics ({topics.length})</h2>
              <button
                onClick={() => setTopicModal({ open: true })}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 bg-accent text-white"
              >
                + New Topic
              </button>
            </div>

            {topicsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse bg-surface" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((topic) => (
                  <div
                    key={topic._id}
                    className="flex items-center justify-between px-5 py-4 rounded-xl bg-surface border border-dim"
                  >
                    <div className="flex items-center gap-3">
                      <TopicIcon title={topic.title} slug={topic.slug} size="sm" />
                      <div>
                        <div className="font-medium text-prose">{topic.title}</div>
                        <div className="text-xs text-muted">
                          /{topic.slug} · {topic.problemCount} problems · order {topic.order}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTopicModal({ open: true, topic })}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors text-muted border border-dim hover:text-accent hover:border-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'topic', id: topic._id, name: topic.title })}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors text-hard border border-hard/50 hover:bg-hard hover:text-white hover:border-hard"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Problems tab */}
        {tab === 'problems' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-syne font-bold text-lg text-prose">Problems ({problems.length})</h2>
              <button
                onClick={() => setProblemModal({ open: true })}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 bg-accent text-white"
              >
                + New Problem
              </button>
            </div>

            {problemsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse bg-surface" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {problems.map((problem) => (
                  <div
                    key={problem._id}
                    className="flex items-center justify-between px-5 py-3 rounded-xl bg-surface border border-dim"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <DifficultyPill difficulty={problem.difficulty} />
                      <div className="min-w-0">
                        <div className="font-medium truncate text-prose">{problem.title}</div>
                        <div className="text-xs text-muted">
                          {problem.topicSlug} · #{problem.order}
                          {problem.subtopic ? ` · ${problem.subtopic}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => setProblemModal({ open: true, problem })}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors text-muted border border-dim hover:text-accent hover:border-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'problem', id: problem._id, name: problem.title })}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors text-hard border border-hard/50 hover:bg-hard hover:text-white hover:border-hard"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topic modal */}
      {topicModal.open && (
        <TopicForm
          topic={topicModal.topic}
          onClose={() => setTopicModal({ open: false })}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['admin', 'topics'] });
            qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
            setTopicModal({ open: false });
          }}
        />
      )}

      {/* Problem modal */}
      {problemModal.open && (
        <ProblemForm
          problem={problemModal.problem}
          topics={topics}
          onClose={() => setProblemModal({ open: false })}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['admin', 'problems'] });
            qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
            setProblemModal({ open: false });
          }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-surface-2 border border-dim">
            <h3 className="font-syne font-bold text-lg mb-2 text-prose capitalize">
              Delete {deleteConfirm.type}?
            </h3>
            <p className="text-sm mb-6 text-muted">
              "{deleteConfirm.name}" will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-dim text-muted hover:text-prose transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'topic') deleteTopic.mutate(deleteConfirm.id);
                  else deleteProblem.mutate(deleteConfirm.id);
                }}
                disabled={deleteTopic.isPending || deleteProblem.isPending}
                className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 bg-hard text-white"
              >
                {deleteTopic.isPending || deleteProblem.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultyPill({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-mono-dm uppercase tracking-wider shrink-0 ${diffPillCls[difficulty]}`}
    >
      {difficulty[0]}
    </span>
  );
}
