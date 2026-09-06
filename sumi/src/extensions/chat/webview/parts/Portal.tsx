/**
 * Portal — React Portal helper, 把 children 渲染到 document.body
 * 用于让 chat modal escape 出 right slot 容器, position:fixed 真正屏幕居中
 * (right slot 容器有 overflow/transform 等 containing block 会限制 fixed).
 *
 * 主题色: 继承 body 上的 --ai-* (theme.ts), 不再维护第二份 inline 色板.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (typeof document === 'undefined' || !mounted) return null;
  return createPortal(
    <div className="numas-portal-root">
      {children}
    </div>,
    document.body,
  );
};
