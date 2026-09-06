import React, { useEffect, useRef, useState } from 'react';
import { PartRenderer } from '../parts/PartRenderer';
import { getQuestionStore, resolveStoredQuestionRequestID, isQuestionCancelled, extractText, hasVisibleAssistantContent, type Row } from '../helpers';
import { parseUserMessageDisplay, type UserDisplayChip } from '../../commands/chatApi';

export type TurnStats = {
  input: number;
  output: number;
  reasoning: number;
  total: number;
  cost: number;
  duration: string;
  modelID: string;
};

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/** 发送后、模型尚未吐出可见内容时的即时占位 */
export function PendingReply() {
  return (
    <div className="chat__msg is-assistant" aria-live="polite" aria-label="思考中">
      <div className="chat__msg-body">
        <PendingHint />
      </div>
    </div>
  );
}

function PendingHint() {
  return (
    <div className="chat__pending">
      思考中<span className="chat__pending-ellipsis" />
    </div>
  );
}

const CopiedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function ChipIcon({ chip }: { chip: UserDisplayChip }) {
  if (chip.kind === 'file') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (chip.source === 'terminal') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MsgCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const onCopy = () => {
    if (!text) return;
    try {
      void navigator.clipboard?.writeText(text);
    } catch { /* ignore */ }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      className={`chat__msg-copy${copied ? ' is-copied' : ''}`}
      onClick={onCopy}
      title={copied ? '已复制' : '复制'}
      aria-label={copied ? '已复制' : '复制'}
    >
      {copied ? <CopiedIcon /> : <CopyIcon />}
    </button>
  );
}

export const MessageRow: React.FC<{
  row: Row;
  streaming: boolean;
  done?: boolean;
  sessionID: string;
  onReplyQuestion: (sid: string, rid: string, answers: string[][]) => Promise<void>;
  /** question 卡片「取消」: abort 当前会话对话 */
  onAbortSession?: (sid: string) => void;
  /** 本轮（一次用户问）assistant 答完后的末条：展示耗时 / token */
  showStats?: boolean;
  turnStats?: TurnStats | null;
  /** 本条是消息列表末条 (历史提问不可再提交) */
  latest?: boolean;
  /** 本轮结束且无可见内容: empty=模型空输出, stopped=用户停止 */
  emptyKind?: 'empty' | 'stopped';
  onRetryEmpty?: () => void;
}> = ({ row, streaming, done, sessionID, onReplyQuestion, onAbortSession, showStats, turnStats, latest, emptyKind, onRetryEmpty }) => {
  if (row.role === 'user') {
    const text = extractText(row.parts);
    const { body, chips } = parseUserMessageDisplay(text);
    const fileParts = (row.parts || []).filter((p: any) => p?.type === 'file');
    const copyText = [
      ...chips.map((c) => (c.range ? `${c.name}:${c.range}` : c.name)),
      body,
    ].filter(Boolean).join(' ');
    return (
      <div className="chat__msg is-user">
        <div className={`chat__msg-user-col${chips.length ? ' has-chips' : ''}`}>
          <div className={`chat__msg-bubble is-user${chips.length ? ' has-chips' : ''}`}>
            {(chips.length || body) ? (
              <div className="chat__msg-user-line">
                {chips.map((c, i) => (
                  <span key={`${c.kind}:${c.name}:${c.range || ''}:${i}`} className="chat__msg-chip" title={c.title || c.name}>
                    <span className="chat__msg-chip-ic" aria-hidden>
                      <ChipIcon chip={c} />
                    </span>
                    <span className="chat__msg-chip-name">{c.name}</span>
                    {c.range ? <span className="chat__msg-chip-range">{c.range}</span> : null}
                  </span>
                ))}
                {body ? <span className="chat__msg-user-text">{body}</span> : null}
              </div>
            ) : null}
            {fileParts.map((p: any, i: number) => {
              const mime = String(p.mime || '');
              const url = String(p.url || '');
              if (!url) return null;
              return mime.startsWith('image/')
                ? <img key={i} className="chat__part-file chat__part-file--image" src={url} alt={p.filename || 'image'} />
                : <div key={i} className="chat__part-file">
                    <a href={url} target="_blank" rel="noreferrer" download={p.filename}>
                      <span className="chat__part-file-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </span>
                      <span className="chat__part-file-name">{p.filename || url}</span>
                    </a>
                  </div>;
            })}
          </div>
          <div className="chat__msg-meta is-user">
            <MsgCopyButton text={copyText || text} />
          </div>
        </div>
      </div>
    );
  }

  const usage = turnStats || { input: 0, output: 0, reasoning: 0, total: 0, cost: 0, duration: '', modelID: '' };
  const duration = showStats ? usage.duration : '';
  const modelID = showStats ? usage.modelID : '';
  const showMeta = !!showStats;
  const textParts = row.parts?.filter((p: any) => p?.type === 'text') || [];
  const fullText = textParts.map((p: any) => p.text).join('\n');
  const showPending = streaming && !emptyKind && !hasVisibleAssistantContent(row.parts);

  return (
    <div className="chat__msg is-assistant">
      <div className="chat__msg-body">
        {showPending && <PendingHint />}
        {(row.parts || []).map((part: any, i: number) => {
          const isQuestionTool = part?.type === 'tool' && /question/i.test(String(part?.tool || ''));
          const preferredRequestID = isQuestionTool
            ? resolveStoredQuestionRequestID(sessionID, part?.callID)
            : '';
          const questionMeta = preferredRequestID ? getQuestionStore().get(sessionID) : null;
          const partRid = typeof part?.state?.metadata?.requestID === 'string'
            ? part.state.metadata.requestID
            : (typeof part?.state?.metadata?.requestId === 'string' ? part.state.metadata.requestId : '');
          const questionCancelled = isQuestionTool && (
            isQuestionCancelled(preferredRequestID)
            || isQuestionCancelled(partRid)
          );
          return (
            <PartRenderer
              key={part.id || i}
              part={part}
              streaming={streaming}
              done={done}
              latest={latest}
              sessionID={sessionID}
              onReply={onReplyQuestion}
              onAbortSession={onAbortSession}
              preferredQuestionRequestID={preferredRequestID || undefined}
              preferredQuestionQuestions={questionMeta?.questions}
              questionCancelled={questionCancelled}
            />
          );
        })}
        {emptyKind && (
          <div className="chat__empty-reply">
            <span>{emptyKind === 'stopped' ? '已停止生成' : '没有收到回复'}</span>
            {onRetryEmpty && (
              <button type="button" onClick={onRetryEmpty}>重试</button>
            )}
          </div>
        )}
        {showMeta && (
          <div className="chat__msg-meta is-assistant has-usage">
            {fullText.trim() ? <MsgCopyButton text={fullText} /> : null}
            {modelID && <span className="chat__msg-model">{modelID}</span>}
            {duration && <>
              <span className="chat__msg-sep">·</span>
              <span className="chat__msg-duration">{duration}</span>
            </>}
          </div>
        )}
      </div>
    </div>
  );
};
