import React, { useState, useEffect } from 'react';

export const ReasoningView: React.FC<{ part: any; streaming?: boolean; done?: boolean }> = ({ part, done }) => {
  const text = String(part?.text || '').trim();
  // 默认展开; 用户可手动折叠; 对话完成后自动折叠
  const [open, setOpen] = useState(true);
  useEffect(() => { if (done) setOpen(false); }, [done]);

  if (!text) return null;

  return (
    <div className={`reason${open ? ' is-open' : ''}`}>
      <button type="button" className="reason__head" onClick={() => setOpen(v => !v)}>
        <span className="reason__icon" aria-hidden="true" />
        <span>思考过程</span>
        <span className="reason__caret" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="reason__body">
          <pre>{text}</pre>
        </div>
      )}
    </div>
  );
};
