import React, { useState, useMemo, useEffect, useRef } from 'react';

function safeStringify(v: any): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

/**
 * V2 ToolStateCompleted.output 是 string, V1 ToolStateCompleted.content[] 是
 * ToolContent 数组, V1 也有 result (Unknown). 三者兼容: 优先 output, 再 content
 * 文本, 最后 result.
 */
function contentToText(content: any): string {
  if (!Array.isArray(content) || content.length === 0) return '';
  return content
    .map((c: any) => {
      if (!c) return '';
      if (typeof c === 'string') return c;
      if (c.type === 'text' && typeof c.text === 'string') return c.text;
      if (c.type === 'file') {
        const name = c.name || c.uri || '';
        return `[file] ${name} (${c.mime || ''})`;
      }
      return safeStringify(c);
    })
    .filter(Boolean)
    .join('\n');
}

function pickOutStr(state: any): string {
  if (!state) return '';
  const direct = state.output;
  if (direct != null && direct !== '') return safeStringify(direct);
  const fromContent = contentToText(state.content);
  if (fromContent) return fromContent;
  if (state.result != null) return safeStringify(state.result);
  return '';
}

function pickErrStr(state: any): string {
  const e = state?.error;
  if (!e) return '';
  if (typeof e === 'string') return e;
  if (e?.message) return String(e.message);
  return safeStringify(e);
}

function IconSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const TOOL_ICON: Record<string, React.ReactNode> = {
  bash: <IconSvg><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></IconSvg>,
  read: <IconSvg><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></IconSvg>,
  write: <IconSvg><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></IconSvg>,
  edit: <IconSvg><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></IconSvg>,
  glob: <IconSvg><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></IconSvg>,
  grep: <IconSvg><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></IconSvg>,
  list: <IconSvg><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M8 5V3h8v2" /></IconSvg>,
  webfetch: <IconSvg><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></IconSvg>,
  task: <IconSvg><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="16" y1="16" x2="16.01" y2="16" /></IconSvg>,
  subagent: <IconSvg><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="16" y1="16" x2="16.01" y2="16" /></IconSvg>,
  todowrite: <IconSvg><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="m3 6 1 1 2-2" /><path d="m3 12 1 1 2-2" /><path d="m3 18 1 1 2-2" /></IconSvg>,
  question: <IconSvg><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconSvg>,
};

const TOOL_ICON_DEFAULT = (
  <IconSvg>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </IconSvg>
);

const STATUS_LABEL: Record<string, string> = {
  pending: '等待',
  running: '执行中',
  completed: '成功',
  error: '失败',
};

const STATUS_ICON: Record<string, string> = {
  pending: '○',
  running: '◐',
  completed: '✓',
  error: '✕',
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="tool__copy"
      title="复制"
      onClick={(e) => {
        e.stopPropagation();
        try {
          navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch { /* ignore */ }
      }}
    >
      {copied ? '已复制' : label || '复制'}
    </button>
  );
}

/** OpenCode 风格工具调用卡片: 标题=工具名+状态, body=完整 input (可复制) + output + error */
export const ToolView: React.FC<{ part: any; done?: boolean }> = ({ part, done }) => {
  const tool: string = part?.tool || 'tool';
  const status: string = part?.state?.status || 'pending';
  const state = part?.state;
  const input = state?.input;
  const attachments = state?.attachments;
  const [open, setOpen] = useState(!done);
  // 只在 done 翻转 (running→completed) 时折叠一次, 避免覆盖用户手动展开
  const prevDoneRef = useRef(done);
  useEffect(() => {
    if (done && !prevDoneRef.current) setOpen(false);
    prevDoneRef.current = done;
  }, [done]);

  const inStr = useMemo(() => safeStringify(input), [input]);
  const outStr = useMemo(() => pickOutStr(state), [state]);
  const errStr = useMemo(() => pickErrStr(state), [state]);

  const icon = TOOL_ICON[tool] || TOOL_ICON_DEFAULT;
  const displayName = tool === 'bash' ? 'Shell' : tool;
  const statusText = STATUS_LABEL[status] || status;
  const statusIcon = STATUS_ICON[status] || '·';

  return (
    <div className={`tool is-${status}${open ? ' is-open' : ''}`}>
      <button type="button" className="tool__head" onClick={() => setOpen((v) => !v)}>
        <span className={`tool__icon is-${status}`}>{icon}</span>
        <span className="tool__name">{displayName}</span>
        <span className={`tool__status is-${status}`}>
          <span className="tool__status-icon">{statusIcon}</span>
          <span className="tool__status-text">{statusText}</span>
        </span>
        <span className="tool__caret" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="tool__body">
          <div className="tool__section">
            <div className="tool__section-head">
              <span className="tool__section-label">输入</span>
              {inStr && <CopyButton text={inStr} />}
            </div>
            <pre className="tool__code">{inStr}</pre>
          </div>
          {outStr && (
            <div className="tool__section">
              <div className="tool__section-head">
                <span className="tool__section-label">输出</span>
                <CopyButton text={outStr} />
              </div>
              <pre className="tool__code">{outStr.slice(0, 4000)}</pre>
            </div>
          )}
          {errStr && (
            <div className="tool__section is-error">
              <div className="tool__section-head">
                <span className="tool__section-label">错误</span>
                <CopyButton text={errStr} />
              </div>
              <pre className="tool__code">{errStr}</pre>
            </div>
          )}
          {Array.isArray(attachments) && attachments.length > 0 && (
            <div className="tool__section">
              <div className="tool__section-head">
                <span className="tool__section-label">附件</span>
              </div>
              <div className="tool__attach-list">
                {attachments.map((a: any, i: number) => (
                  <span key={i} className="tool__attach">{a?.filename || a?.name || `attach-${i}`}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
