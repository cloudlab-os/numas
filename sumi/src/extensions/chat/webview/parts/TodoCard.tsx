import React, { useMemo, useState, useEffect } from 'react';

export interface TodoItem {
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: string;
}

export function extractAssistantTodos(value: any): TodoItem[] {
  if (!value) return [];
  let arr: any = null;
  if (Array.isArray(value)) arr = value;
  else if (Array.isArray(value?.todos)) arr = value.todos;
  else if (Array.isArray(value?.data)) arr = value.data;
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const items: TodoItem[] = [];
  for (const e of arr) {
    if (!e || typeof e !== 'object') continue;
    const content = (e as any).content;
    const status = (e as any).status;
    const priority = (e as any).priority;
    if (typeof content !== 'string' || content.trim().length === 0) continue;
    const normalizedStatus: TodoItem['status'] =
      status === 'completed' || status === 'in_progress' || status === 'pending' || status === 'cancelled'
        ? status
        : 'pending';
    items.push({
      content: content.trim(),
      status: normalizedStatus,
      priority: typeof priority === 'string' ? priority.trim().toLowerCase() : undefined,
    });
  }
  return items;
}

export function findTodosInPart(part: any): TodoItem[] {
  const candidates = [
    part?.state?.output,
    part?.state?.input,
    part?.state?.metadata?.todos,
    part?.state?.metadata,
    part?.state?.raw,
  ];
  for (const c of candidates) {
    const list = extractAssistantTodos(c);
    if (list.length > 0) return list;
  }
  if (typeof part?.state?.output === 'string') {
    try {
      const parsed = JSON.parse(part.state.output);
      const list = extractAssistantTodos(parsed);
      if (list.length > 0) return list;
    } catch { /* noop */ }
  }
  return [];
}

function TodoCheck({ status, index }: { status: TodoItem['status']; index: number }) {
  if (status === 'completed') {
    return (
      <span className="todo__check is-completed" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="todo__check is-cancelled" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (status === 'in_progress') {
    return <span className="todo__check is-progress" aria-hidden="true"><span className="todo__check-dot" /></span>;
  }
  return <span className="todo__check is-pending" aria-hidden="true">{index + 1}</span>;
}

const PRI_LABEL: Record<string, string> = { high: '高', low: '低', medium: '中' };

export const TodoCard: React.FC<{ part: any; done?: boolean }> = ({ part, done }) => {
  const todos = useMemo(() => {
    const priority: Record<string, number> = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 };
    const raw = findTodosInPart(part);
    return [...raw].sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));
  }, [part]);
  const starting = todos.length > 0 && todos.every((t) => t.status === 'pending');
  const allDone = todos.length > 0 && todos.every((t) => t.status === 'completed' || t.status === 'cancelled');
  const allCancelled = todos.length > 0 && todos.every((t) => t.status === 'cancelled');
  const title = allCancelled ? '已取消计划' : allDone ? '完成计划' : starting ? '创建计划' : '更新计划';
  const stats = useMemo(() => {
    let total = todos.length, completed = 0, inProgress = 0, cancelled = 0;
    for (const t of todos) {
      if (t.status === 'completed') completed += 1;
      else if (t.status === 'cancelled') cancelled += 1;
      else if (t.status === 'in_progress') inProgress += 1;
    }
    return { total, completed, inProgress, cancelled, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [todos]);
  const [open, setOpen] = useState(true);
  useEffect(() => { if (done) setOpen(false); }, [done]);

  if (todos.length === 0) {
    return (
      <div className="todo todo--empty">
        <span className="todo__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" />
            <path d="m3 6 1 1 2-2" /><path d="m3 12 1 1 2-2" /><path d="m3 18 1 1 2-2" />
          </svg>
        </span>
        <span className="todo__empty-text">正在规划任务…</span>
      </div>
    );
  }

  return (
    <div className={`todo${open ? ' is-open' : ''}${allDone ? ' is-done' : ''}`}>
      <button type="button" className="todo__head" onClick={() => setOpen((v) => !v)}>
        <span className="todo__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" />
            <path d="m3 6 1 1 2-2" /><path d="m3 12 1 1 2-2" /><path d="m3 18 1 1 2-2" />
          </svg>
        </span>
        <span className="todo__title">{title}</span>
        <span className={`todo__pill${allDone ? ' is-done' : ''}${stats.inProgress > 0 ? ' is-progress' : ''}`}>
          {stats.completed}/{stats.total}
          {stats.inProgress > 0 ? ` · ${stats.inProgress} 进行中` : ''}
        </span>
        <span className={`todo__caret${open ? ' is-open' : ''}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="todo__body">
          <div className="todo__progress" aria-hidden="true">
            <div className="todo__progress-bar" style={{ width: `${stats.pct}%` }} />
          </div>
          <ol className="todo__list">
            {todos.map((t, i) => (
              <li key={i} className={`todo__item is-${t.status}`}>
                <TodoCheck status={t.status} index={i} />
                <span className="todo__content">{t.content}</span>
                {t.priority && t.priority !== 'medium' && (
                  <span className={`todo__pri is-${t.priority}`}>{PRI_LABEL[t.priority] || t.priority}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
