import React, { useState, useMemo, useEffect, useRef } from 'react';

export interface QuestionOption {
  label: string;
  description: string;
}
export interface QuestionInfo {
  question: string;
  header?: string;
  options: QuestionOption[];
  multiple?: boolean;
  custom?: boolean;
}

function parseMaybeJson(v: any): any {
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return null; }
  }
  return v;
}

function normalizeQuestions(qs: any): QuestionInfo[] | null {
  if (!Array.isArray(qs) || qs.length === 0) return null;
  const out: QuestionInfo[] = [];
  for (const q of qs) {
    if (!q || typeof q.question !== 'string') return null;
    const opts = Array.isArray(q.options) ? q.options : [];
    out.push({
      question: q.question,
      header: q.header,
      multiple: q.multiple === true || q.type === 'multiple',
      custom: q.custom !== false,
      options: opts.map((o: any) => ({
        label: typeof o === 'string' ? o : (o?.label ?? String(o)),
        description: typeof o === 'object' && o ? (o.description ?? '') : '',
      })),
    });
  }
  return out;
}

export function extractQuestions(part: any, fallback?: any[]): QuestionInfo[] | null {
  const candidates = [
    part?.state?.output,
    part?.state?.input,
    part?.state?.raw,
    part?.state?.metadata,
    fallback,
  ];
  for (const cand of candidates) {
    const v = parseMaybeJson(cand);
    if (!v) continue;
    const qs = (v as any).questions ?? (Array.isArray(v) ? v : null);
    const normalized = normalizeQuestions(qs);
    if (normalized) return normalized;
  }
  return null;
}

export function extractRequestId(part: any): string {
  const candidates = [
    part?.state?.metadata?.requestID,
    part?.state?.metadata?.requestId,
  ];
  for (const c of candidates) {
    // 只接受 que_ 前缀; callID / part.id 不是 question requestID, 传上去会 400/404
    if (typeof c === 'string' && c.startsWith('que')) return c;
  }
  return '';
}

function hasAnswers(part: any): boolean {
  const answers = part?.state?.metadata?.answers;
  if (!Array.isArray(answers) || answers.length === 0) return false;
  return answers.some((a: any) => (Array.isArray(a) ? a.length > 0 : !!a));
}

function OptMark({ multiple, picked }: { multiple: boolean; picked: boolean }) {
  return (
    <span className={`q__mark${multiple ? '' : ' is-radio'}${picked ? ' is-on' : ''}`} aria-hidden="true">
      {multiple
        ? picked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
        : <span className="q__mark-dot" />}
    </span>
  );
}

export const QuestionCard: React.FC<{
  part: any;
  sessionID: string;
  onReply: (sid: string, rid: string, answers: string[][]) => Promise<void>;
  /** 底部「取消」: abort 整个对话 (提问随之取消).
   *  仅当此卡片是当前正在进行的提问 (最后一条消息) 且会话 busy 时显示. */
  onAbort?: (sid: string) => void;
  /** 会话 busy 且本消息为最后一条进行中消息 (Chat 层由 busy && role assistant && id===最后一条 计算) */
  streaming?: boolean;
  /** 本条是消息列表末条: 历史提问不可再提交; 仅当前这条待答可提交 */
  latest?: boolean;
  preferredRequestID?: string;
  preferredQuestions?: any[];
  /** 用户已点「取消」abort */
  cancelled?: boolean;
}> = ({ part, sessionID, onReply, onAbort, streaming, latest, preferredRequestID, preferredQuestions, cancelled }) => {
  const questions = useMemo(
    () => extractQuestions(part, preferredQuestions),
    [part, preferredQuestions],
  );
  const localRid = useMemo(() => extractRequestId(part), [part]);
  const requestId = preferredRequestID || localRid;
  const status: string = part?.state?.status || 'pending';
  const answered = hasAnswers(part);
  const statusDone = status === 'completed' || status === 'error';
  const errText = String(part?.state?.error || '');
  const dismissed = status === 'error' && /dismissed/i.test(errText);
  const aborted = !!(
    cancelled
    || part?.state?.metadata?.interrupted === true
    || (status === 'error' && /abort|interrupted|reject|cancelled|canceled/i.test(errText))
  );
  // 待答: 无答案、未取消/忽略、工具未完结 — 不靠 store 里陈旧 que_* 把历史卡撑成可提交
  const pending = !answered && !dismissed && !aborted && !statusDone;
  // 仅当前末条提问可提交; 历史对话里的提问只读
  const canAnswer = pending && latest === true;

  const [selected, setSelected] = useState<Record<number, Set<string>>>({});
  const [custom, setCustom] = useState<Record<number, string>>({});
  const [customActive, setCustomActive] = useState<Record<number, boolean>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // 当前待答展开; 历史/已答默认折叠, 点标题可展开
  const [open, setOpen] = useState(canAnswer);
  const prevCanAnswerRef = useRef(canAnswer);
  useEffect(() => {
    if (!canAnswer && prevCanAnswerRef.current) setOpen(false);
    prevCanAnswerRef.current = canAnswer;
  }, [canAnswer]);

  if (!questions) return null;
  const qi = Math.min(activeIdx, questions.length - 1);
  const q = questions[qi];
  const locked = !canAnswer || submitting;
  // 已取消 / 已忽略 / 请回答 / 未回答 / 已回答
  const title = answered
    ? '已回答'
    : aborted
      ? '已取消'
      : dismissed
        ? '已忽略'
        : canAnswer
          ? '请回答'
          : '未回答';

  const isCustomOn = (index: number) => !!customActive[index];

  const toggle = (index: number, label: string, multiple: boolean, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (locked) return;
    setSelected((prev) => {
      const cur = new Set(prev[index] || []);
      if (multiple) {
        if (cur.has(label)) cur.delete(label);
        else cur.add(label);
      } else {
        if (cur.has(label) && cur.size === 1) cur.clear();
        else { cur.clear(); cur.add(label); }
      }
      return { ...prev, [index]: cur };
    });
    if (!multiple) setCustomActive((prev) => ({ ...prev, [index]: false }));
  };

  const onCustomFocus = (index: number, multiple: boolean) => {
    if (locked) return;
    setCustomActive((prev) => ({ ...prev, [index]: true }));
    // 单选: 聚焦自定义输入时清除已选选项
    if (!multiple) {
      setSelected((prev) => ({ ...prev, [index]: new Set() }));
    }
  };

  const onCustomChange = (index: number, v: string, multiple: boolean) => {
    if (locked) return;
    setCustom((prev) => ({ ...prev, [index]: v }));
    setCustomActive((prev) => ({ ...prev, [index]: v.trim().length > 0 }));
    if (!multiple && v.trim()) {
      setSelected((prev) => ({ ...prev, [index]: new Set() }));
    }
  };

  const submit = async () => {
    if (locked) return;
    setSubmitting(true);
    try {
      const answers = questions.map((_, index) => {
        const sel = Array.from(selected[index] || []);
        if (isCustomOn(index) && custom[index]?.trim()) {
          sel.push(`__custom__:${custom[index].trim()}`);
        }
        return sel;
      });
      await onReply(sessionID, requestId, answers);
    } finally {
      setSubmitting(false);
    }
  };

  const answerLabels = (index: number): string[] => {
    const metaAnswers = part?.state?.metadata?.answers;
    if (answered && Array.isArray(metaAnswers) && Array.isArray(metaAnswers[index])) {
      return metaAnswers[index]
        .map((a: string) => String(a).replace(/^__custom__:/, '').trim())
        .filter(Boolean);
    }
    if (canAnswer) {
      const sel = Array.from(selected[index] || []);
      const c = (custom[index] || '').trim();
      return c && isCustomOn(index) ? [...sel, c] : sel;
    }
    return [];
  };

  const picks = answerLabels(qi);
  const optionLabelSet = new Set(q.options.map((o) => o.label));
  const customPicks = picks.filter((p) => !optionLabelSet.has(p));
  const isOptPicked = (label: string) => picks.includes(label);

  return (
    <div className={`q${answered ? ' is-done' : ''}${pending ? ' is-pending' : ''}${(dismissed || aborted) ? ' is-cancelled' : ''}`}>
      <div className="q__head" onClick={() => setOpen((v) => !v)}>
        <span className="q__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        <span className="q__head-title">
          {title}
          {questions.length > 1 ? ` · ${qi + 1}/${questions.length}` : ''}
        </span>
        {questions.length > 1 && (
          <div className="q__tabs" onClick={(e) => e.stopPropagation()}>
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`q__tab${i === qi ? ' is-active' : ''}`}
                onClick={() => setActiveIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        <span className={`q__caret${open ? ' is-open' : ''}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
      {open && (
        <div className="q__item">
          {q.header && <div className="q__header">{q.header}</div>}
          <div className="q__q">{q.question}</div>
          <div className="q__opts" role={q.multiple ? 'group' : 'radiogroup'}>
            {q.options.map((opt, oi) => {
              const picked = isOptPicked(opt.label);
              return (
                <button
                  key={oi}
                  type="button"
                  className={`q__opt${picked ? ' is-active' : ''}${!canAnswer ? ' is-readonly' : ''}`}
                  role={q.multiple ? 'checkbox' : 'radio'}
                  aria-checked={picked}
                  onClick={(e) => toggle(qi, opt.label, !!q.multiple, e)}
                  disabled={locked}
                >
                  <OptMark multiple={!!q.multiple} picked={picked} />
                  <span className="q__opt-body">
                    <span className="q__opt-label">{opt.label}</span>
                    {opt.description && <span className="q__opt-desc">{opt.description}</span>}
                  </span>
                </button>
              );
            })}
            {canAnswer && q.custom !== false && (
              <div className={`q__opt q__custom-opt${isCustomOn(qi) ? ' is-active' : ''}`}>
                <OptMark multiple={!!q.multiple} picked={isCustomOn(qi)} />
                <span className="q__opt-body">
                  <span className="q__opt-label">输入自己的答案</span>
                  <textarea
                    className="q__custom"
                    rows={1}
                    placeholder="输入你的答案…"
                    value={custom[qi] || ''}
                    onFocus={() => onCustomFocus(qi, !!q.multiple)}
                    onChange={(e) => onCustomChange(qi, e.target.value, !!q.multiple)}
                    disabled={locked}
                    onClick={(e) => e.stopPropagation()}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = el.scrollHeight + 'px';
                    }}
                  />
                </span>
              </div>
            )}
            {!canAnswer && customPicks.map((text, i) => (
              <div key={`custom-${i}`} className="q__opt is-active is-readonly">
                <OptMark multiple={!!q.multiple} picked />
                <span className="q__opt-body">
                  <span className="q__opt-label">{text}</span>
                  <span className="q__opt-desc">自定义回答</span>
                </span>
              </div>
            ))}
          </div>
          {canAnswer && (
            <div className="q__foot">
              <div className="q__foot-start">
                {qi === 0 ? (
                  streaming && (
                    <button type="button" className="q__nav q__cancel" onClick={() => onAbort?.(sessionID)} disabled={submitting}>
                      取消
                    </button>
                  )
                ) : (
                  <button type="button" className="q__nav" onClick={() => setActiveIdx(qi - 1)}>
                    上一个
                  </button>
                )}
              </div>
              <div className="q__foot-end">
                {qi < questions.length - 1 ? (
                  <button type="button" className="q__nav" onClick={() => setActiveIdx(qi + 1)}>
                    下一个
                  </button>
                ) : (
                  <button type="button" className="q__submit" onClick={submit} disabled={submitting}>
                    {submitting ? '提交中…' : '提交'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
