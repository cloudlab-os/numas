/**
 * 全部 chat 样式 — extensions/chat/webview/styles.ts
 * 色板见 theme.ts (--ai-*), 本文件只消费变量。
 */

export const styles = `
.chat {
  display: flex; flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  background: var(--ai-bg);
  color: var(--ai-fg);
  border: none;
  border-radius: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 13px;
  overflow: hidden;
  /* OpenSumi .kt_split_panel_body 默认 user-select:none，覆盖后消息可选中复制 */
  user-select: text;
  -webkit-user-select: text;
  /* 左缘轻阴影，与主编辑区分隔 */
  box-shadow: -4px 0 14px color-mix(in srgb, #000 10%, transparent);
}
body.design-dark .chat {
  box-shadow: -5px 0 16px color-mix(in srgb, #000 28%, transparent);
}

/* chat 内滚动条: 细、半透明、无轨道 */
.chat,
.chat * {
  scrollbar-width: thin;
  scrollbar-color: var(--ai-scrollbar) transparent;
}
.chat::-webkit-scrollbar,
.chat *::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.chat::-webkit-scrollbar-track,
.chat *::-webkit-scrollbar-track {
  background: transparent;
}
.chat::-webkit-scrollbar-thumb,
.chat *::-webkit-scrollbar-thumb {
  background: var(--ai-scrollbar);
  border-radius: 999px;
  border: none;
}
.chat::-webkit-scrollbar-thumb:hover,
.chat *::-webkit-scrollbar-thumb:hover {
  background: var(--ai-scrollbar-hover);
}
.chat::-webkit-scrollbar-corner,
.chat *::-webkit-scrollbar-corner {
  background: transparent;
}

/* Portal 弹出层 (挂到 body, 不在 .chat 内) 同样用细滚动条 */
.numas-portal-root,
.numas-portal-root * {
  scrollbar-width: thin;
  scrollbar-color: var(--ai-scrollbar) transparent;
}
.numas-portal-root::-webkit-scrollbar,
.numas-portal-root *::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.numas-portal-root::-webkit-scrollbar-track,
.numas-portal-root *::-webkit-scrollbar-track {
  background: transparent;
}
.numas-portal-root::-webkit-scrollbar-thumb,
.numas-portal-root *::-webkit-scrollbar-thumb {
  background: var(--ai-scrollbar);
  border-radius: 999px;
  border: none;
}
.numas-portal-root::-webkit-scrollbar-thumb:hover,
.numas-portal-root *::-webkit-scrollbar-thumb:hover {
  background: var(--ai-scrollbar-hover);
}
.numas-portal-root::-webkit-scrollbar-corner,
.numas-portal-root *::-webkit-scrollbar-corner {
  background: transparent;
}

/* Topbar — 高 36, 左右 20, 底部分割 */
.chat__topbar {
  height: 36px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--ai-space);
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow: none;
  border-bottom: 1px solid var(--ai-border-card);
  flex-shrink: 0;
}
.chat__brand { display: flex; align-items: center; gap: 8px; }
.chat__logo {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--ai-accent);
  color: var(--ai-accent-fg); font-weight: 700; font-size: 9px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: none;
  text-shadow: none;
  letter-spacing: -0.5px;
  overflow: hidden;
  white-space: nowrap;
}
.chat__logo-img {
  width: 22px; height: 22px; border-radius: 6px;
  object-fit: cover; display: block; flex-shrink: 0;
}
.chat__brand-name {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.2;
  color: var(--ai-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
  padding-bottom: 0;
}
body.design-dark .chat__brand-name,
body.vs-dark .chat__brand-name {
  color: var(--ai-fg);
}
.chat__top-actions { display: flex; align-items: center; gap: 6px; }
.chat__icon-btn {
  width: 26px; height: 26px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: var(--ai-radius-sm);
  color: var(--ai-fg-muted);
  cursor: pointer;
  transition: background .12s, box-shadow .12s;
}
.chat__icon-btn:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__icon-btn:active { box-shadow: var(--ai-press-shadow); }
.chat__login-btn {
  height: 26px; padding: 0 12px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--ai-accent); border: none; border-radius: 7px;
  color: var(--ai-accent-fg); font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: opacity .12s, background .12s;
}
.chat__login-btn:hover { opacity: .9; }
.chat__login-gate {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  padding: 24px;
}
.chat__login-title { font-size: 20px; font-weight: 700; color: var(--ai-fg); }
.chat__login-desc { font-size: 13px; color: var(--ai-fg-muted); }

/* Todos bar */
/* Todos dock (above composer, OpenCode style) */
.chat__todos-dock {
  margin: 8px var(--ai-space) 0;
  padding: 0;
  background: var(--ai-input-bg);
  border: none;
  border-radius: 10px;
  flex-shrink: 0;
  overflow: hidden;
}
.chat__todos-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}
.chat__todos-title {
  font-size: 12px; color: var(--ai-fg-muted);
}
.chat__todos-caret {
  font-size: 10px; color: var(--ai-fg-muted);
}
.chat__todos-list {
  list-style: none; margin: 0; padding: 0 12px 8px 32px;
}
.chat__todo-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 4px 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--ai-fg);
}
.chat__todo-item.is-completed {
  color: var(--ai-fg-muted);
  text-decoration: line-through;
  opacity: 0.7;
}
.chat__todo-item.is-in_progress {
  font-weight: 500;
  color: var(--ai-fg);
}
.chat__todo-check {
  flex-shrink: 0;
  margin-left: -22px;
  font-size: 12px;
  color: var(--ai-fg-muted);
  width: 14px;
  text-align: center;
}
.chat__todo-item.is-in_progress .chat__todo-check { color: var(--ai-warning); }
.chat__todo-item.is-completed .chat__todo-check { color: var(--ai-success); }

/* Messages area */
.chat__messages {
  flex: 1; overflow-y: auto; overflow-x: hidden; min-width: 0;
  padding: 12px var(--ai-space) 16px;
  display: flex; flex-direction: column; gap: 0; min-width: 0;
}
.chat__msg { margin: 0; display: flex; min-width: 0; max-width: 100%; }
.chat__msg.is-user { justify-content: flex-end; margin-bottom: 16px; }
.chat__msg.is-assistant { justify-content: flex-start; margin-bottom: 16px; }
.chat__msg.is-assistant:has(+ .chat__msg.is-assistant) { margin-bottom: 6px; }
/* assistant 消息体撑满消息列宽, 卡片宽度统一适配 */
.chat__msg.is-assistant > .chat__msg-body { flex: 1; min-width: 0; }
.chat__msg-user-col { display: flex; flex-direction: column; align-items: flex-end; max-width: min(100%, 280px); min-width: 0; }
.chat__msg-user-col.has-chips { max-width: min(100%, 520px); }
.chat__msg-body {
  max-width: 100%; min-width: 0;
  color: var(--ai-fg);
  font-size: 14px; line-height: 22px;
  overflow-wrap: anywhere;
}
.chat__msg-body > * { min-width: 0; max-width: 100%; }
/* 卡片/文本统一占满消息体宽度 */
.chat__msg-body > div,
.chat__msg-body > section,
.chat__msg-body > aside,
.chat__msg-body > .chat-md,
.chat__msg-body > .tool,
.chat__msg-body > .todo,
.chat__msg-body > .reason,
.chat__msg-body > .q {
  width: 100%; box-sizing: border-box;
}
.chat__msg-body pre, .chat__msg-body code {
  max-width: 100%;
  overflow-x: auto;
  word-break: break-all;
  white-space: pre-wrap;
  box-sizing: border-box;
}
.chat__msg-bubble.is-user {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  background: var(--ai-surface-muted);
  color: var(--ai-fg);
  border: 1px solid var(--ai-border-card);
  padding: 11px 16px;
  border-radius: 16px 16px 5px 16px;
  word-wrap: break-word; overflow-wrap: anywhere; white-space: normal;
  font-size: 14px; line-height: 22px;
  max-width: 100%;
}
.chat__msg-user-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  min-width: 0;
  max-width: 100%;
}
.chat__msg-user-text { white-space: pre-wrap; min-width: 0; }
.chat__msg-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 220px;
  height: 22px;
  padding: 0 6px 0 5px;
  background: var(--ai-bg, var(--ai-bg-elev));
  border: 1px solid var(--ai-border, rgba(0,0,0,0.12));
  border-radius: 6px;
  font-size: 12px;
  line-height: 1;
  color: var(--ai-fg);
  flex: 0 0 auto;
}
.chat__msg-chip-ic {
  flex-shrink: 0;
  width: 14px; height: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ai-fg-muted);
}
.chat__msg-chip-name {
  min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__msg-chip-range {
  flex-shrink: 0;
  color: var(--ai-fg-muted);
  font-size: 11px;
}
.chat__part-file--image {
  display: block; max-width: 240px; max-height: 240px;
  border-radius: 8px; margin-top: 6px;
  object-fit: contain;
}
.chat__part-file {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 6px; max-width: 100%;
}
.chat__part-file a {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 10px;
  background: var(--ai-hover);
  border: none;
  border-radius: 8px;
  color: var(--ai-fg);
  text-decoration: none;
  font-size: 12.5px;
  max-width: 100%;
}
.chat__part-file-icon { flex-shrink: 0; color: var(--ai-fg-muted); display: inline-flex; }
.chat__part-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 强制: 消息列内所有容器不要溢出 (thinking / tool / reason / q-card 卡片都靠这条) */
.chat__msg-body > div,
.chat__msg-body > pre,
.chat__msg-body > section,
.chat__msg-body > aside {
  min-width: 0; max-width: 100%; overflow-x: auto;
  box-sizing: border-box;
}
.chat__msg-meta {
  display: flex;
  align-items: center; gap: 6px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--ai-fg-muted);
}
.chat__msg-meta.is-user { justify-content: flex-end; }
.chat__msg-copy {
  width: 22px; height: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 5px;
  color: var(--ai-fg-muted); cursor: pointer; padding: 0;
  transition: color .15s ease, background .15s ease, transform .15s ease;
}
.chat__msg-copy:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__msg-copy.is-copied {
  color: var(--ai-success, #16a34a);
  transform: scale(1.06);
}
.chat__msg-copy.is-copied:hover {
  color: var(--ai-success, #16a34a);
  background: color-mix(in srgb, var(--ai-success, #16a34a) 12%, transparent);
}
.chat__msg-sep { opacity: 0.5; }
.chat__msg-model { font-weight: 500; }
.chat__msg-tokens { font-variant-numeric: tabular-nums; }
.chat__msg-tokens-io { opacity: 0.75; }

.chat__pending {
  display: inline-flex;
  align-items: baseline;
  min-height: 22px;
  padding: 2px 0;
  font-size: 13px;
  line-height: 22px;
  color: var(--ai-fg-muted);
  animation: chat-pending-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.chat__pending-ellipsis::after {
  content: '';
  animation: chat-pending-ellipsis 1.2s steps(4, end) infinite;
}
@keyframes chat-pending-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes chat-pending-ellipsis {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75%, 100% { content: '...'; }
}
@media (prefers-reduced-motion: reduce) {
  .chat__pending { animation: none; }
  .chat__pending-ellipsis::after { animation: none; content: '...'; }
}

.chat__empty-reply {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
  font-size: 13px;
  color: var(--ai-fg-muted);
}
.chat__empty-reply button {
  flex-shrink: 0;
  background: var(--ai-hover);
  border: none;
  color: var(--ai-fg);
  padding: 3px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}
.chat__empty-reply button:hover {
  background: var(--ai-accent-soft, var(--ai-hover));
}

/* Error */
.chat__error {
  margin: 0 var(--ai-space) 8px;
  padding: 8px 12px;
  background: var(--ai-danger-bg);
  border: 1px solid var(--ai-danger-border);
  border-radius: 8px;
  color: var(--ai-danger); font-size: 12px;
  display: flex; align-items: center; gap: 10px;
}
.chat__error button {
  margin-left: auto;
  background: var(--ai-hover); border: none; color: var(--ai-danger);
  padding: 3px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;
}

/* 信息/成功提示 (非错误) — 蓝色调, 与红色错误区分 */
.chat__notice {
  margin: 0 var(--ai-space) 8px;
  padding: 8px 12px;
  background: var(--ai-accent-soft);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  color: var(--ai-fg); font-size: 12px;
  display: flex; align-items: center; gap: 10px;
  white-space: pre-wrap; word-break: break-word;
}
.chat__notice-text { flex: 1; min-width: 0; }
.chat__notice button {
  flex-shrink: 0;
  background: transparent; border: none; color: var(--ai-fg-muted);
  cursor: pointer; font-size: 13px; line-height: 1; padding: 2px 4px;
}
.chat__notice button:hover { color: var(--ai-fg); }

/* Session status bar: 只承载非 busy/idle 状态 (retry 退避/限额) — 琥珀警示调 */
.chat__status {
  margin: 0 12px 8px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--ai-warning) 14%, var(--ai-bg-elev));
  border: 1px solid color-mix(in srgb, var(--ai-warning) 35%, transparent);
  border-radius: 8px;
  color: var(--ai-fg);
  font-size: 12px;
  display: flex; align-items: flex-start; gap: 8px;
  white-space: pre-wrap; word-break: break-word;
}
.chat__status-spin {
  flex-shrink: 0; margin-top: 2px;
  color: var(--ai-warning);
  animation: chat-status-rotate 1.4s linear infinite;
}
@keyframes chat-status-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.chat__status-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.chat__status-title { font-weight: 600; color: var(--ai-warning); line-height: 1.35; }
.chat__status-next { margin-left: 6px; font-weight: 400; opacity: 0.85; }
.chat__status-msg { line-height: 1.45; }
.chat__status-link {
  flex-shrink: 0;
  margin-top: 1px;
  background: var(--ai-hover);
  border: 1px solid var(--ai-border);
  color: var(--ai-fg);
  text-decoration: none;
  padding: 3px 10px; border-radius: 5px;
  font-size: 11px; line-height: 1.4;
  white-space: nowrap;
}
.chat__status-link:hover { background: var(--ai-active); color: var(--ai-accent); }

/* Composer */
.chat__composer {
  padding: 0 var(--ai-space) 12px;
  flex-shrink: 0;
  position: relative;
}
.chat__input-wrap {
  position: relative;
  background: var(--ai-bg-elev);
  border: 1px solid var(--ai-border-input);
  border-radius: var(--ai-radius-input);
  padding: 13px;
  box-shadow: 0 0 4px rgba(17,24,39,0.04);
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  display: flex; flex-direction: column;
  z-index: 0;
}
.chat__input-wrap:hover {
  border-color: var(--ai-border-input);
}
.chat__input-wrap:focus-within {
  border-color: var(--ai-accent);
  box-shadow: 0 0 0 3px var(--ai-accent-50);
  background: var(--ai-bg-elev);
}
.chat__input-wrap .chat__input {
  display: block;
  width: 100%;
  min-width: 0;
  resize: none;
  background: transparent; border: none; outline: none;
  color: var(--ai-fg);
  font-family: inherit; font-size: 14px; line-height: 22px;
  padding: 0; min-height: 44px;
  overflow-y: auto; max-height: 160px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.chat__input-wrap.has-chips .chat__input {
  min-height: 22px;
}
.chat__input.is-empty::before {
  content: attr(data-placeholder);
  color: var(--ai-fg-placeholder);
  pointer-events: none;
}

.chat__input-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  min-width: 0;
  padding-bottom: 10px;
}
.chat__input-wrap.has-chips .chat__input-body {
  padding-bottom: 4px;
}
.chat__input-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.chat__ctx-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 220px;
  height: 22px;
  margin: 0;
  padding: 0 4px 0 5px;
  box-sizing: border-box;
  background: var(--ai-surface-muted, var(--ai-bg-elev));
  border: 1px solid var(--ai-border, rgba(0,0,0,0.12));
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  color: var(--ai-fg);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  flex: 0 0 auto;
}
.chat__ctx-chip:hover { border-color: var(--ai-accent); }
.chat__ctx-chip-ic {
  flex-shrink: 0;
  width: 14px; height: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ai-fg-muted);
}
.chat__ctx-chip-thumb {
  width: 14px; height: 14px; object-fit: cover;
  border-radius: 2px; flex-shrink: 0;
}
.chat__ctx-chip-name {
  min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__ctx-chip-range {
  flex-shrink: 0;
  color: var(--ai-fg-muted);
  font-size: 11px;
}
.chat__ctx-chip-x {
  flex-shrink: 0;
  background: transparent; border: none; color: var(--ai-fg-muted);
  font-size: 12px; cursor: pointer; line-height: 1; padding: 0 1px;
}
.chat__ctx-chip-x:hover { color: var(--ai-danger); }
.chat__ctx-chip.is-uploading { opacity: 0.8; }

/* Attachment cards (preview modal still uses these) */
.chat__attach {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 0 2px 8px;
}
.chat__attach-card {
  position: relative;
  display: inline-flex; align-items: center; gap: 6px;
  max-width: 180px;
  padding: 4px 6px;
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 8px;
  font-size: 11px;
  color: var(--ai-fg);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 1px 0 var(--ai-metal-edge) inset;
  transition: border-color .15s, background .15s;
}
.chat__attach-card:hover { border-color: var(--ai-accent); }
.chat__attach-card--ctx {
  border: 1px dashed color-mix(in srgb, var(--ai-accent) 45%, transparent);
}
.chat__attach-name {
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__attach-thumb {
  width: 26px; height: 26px; object-fit: cover;
  border-radius: 5px; flex-shrink: 0;
}
.chat__attach-progress {
  position: absolute; left: 4px; right: 4px; bottom: 4px;
  height: 3px; background: color-mix(in srgb, var(--ai-fg) 12%, transparent);
  border-radius: 2px; overflow: hidden;
}
.chat__attach-progress-bar {
  display: block; height: 100%;
  background: linear-gradient(90deg, var(--ai-accent), color-mix(in srgb, var(--ai-accent) 60%, var(--ai-accent-fg)));
  transition: width 0.15s ease-out;
}
.chat__attach-ic {
  flex-shrink: 0; width: 26px; height: 26px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 5px;
  background: var(--ai-input-bg);
  color: var(--ai-fg-muted);
}
.chat__attach-ic--lg { width: 52px; height: 52px; border-radius: 12px; }
.chat__attach-x {
  flex-shrink: 0;
  background: transparent; border: none; color: var(--ai-fg-muted);
  font-size: 13px; cursor: pointer; line-height: 1; padding: 0 2px;
}
.chat__attach-x:hover { color: var(--ai-danger); }

/* 附件预览 */
.chat__preview {
  width: min(680px, 100%);
  max-height: min(calc(100vh - 72px), 720px);
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 16px;
  box-shadow: var(--ai-pop-shadow);
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: chat-pop .14s ease-out;
}
.chat__preview-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 0 var(--ai-divider);
}
.chat__preview-name {
  flex: 1; min-width: 0;
  font-size: 13px; font-weight: 600; color: var(--ai-fg);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__preview-body {
  flex: 1; overflow: auto;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  min-height: 200px;
}
.chat__preview-body img {
  max-width: 100%; max-height: calc(100vh - 220px);
  object-fit: contain;
  border-radius: 8px;
}
.chat__preview-file {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: var(--ai-fg-muted);
}
.chat__preview-path {
  font-size: 12.5px;
  word-break: break-all;
  text-align: center;
}

.chat__input-bar {
  display: flex; align-items: center; gap: 4px;
}
.chat__cwd-row {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 0 2px;
}
.chat__cwd-btn {
  display: inline-flex; align-items: center; gap: 5px;
  height: 28px; padding: 0 8px;
  background: transparent; border: none; border-radius: 8px;
  color: var(--ai-fg-muted);
  font-family: inherit; font-size: 13px;
  cursor: pointer; transition: background .12s, color .12s;
  max-width: 100%;
  min-width: 0;
}
.chat__cwd-btn > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 240px;
}
.chat__cwd-btn:hover {
  background: var(--ai-hover);
  color: var(--ai-fg);
}
.chat__select { position: relative; min-width: 0; flex: 0 1 auto; }
.chat__bar-spacer { flex: 1; }
.chat__bar-btn {
  display: inline-flex; align-items: center; gap: 5px;
  min-height: 26px; height: auto; padding: 4px 8px;
  background: transparent; border: none; border-radius: var(--ai-radius-sm);
  color: var(--ai-fg-muted);
  font-family: inherit; font-size: 13px; line-height: 1.45;
  cursor: pointer; transition: background .12s, color .12s;
  max-width: 100%;
  min-width: 0;
  flex: 0 1 auto;
}
.chat__bar-btn > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
  line-height: 1.45;
  padding-bottom: 1px; /* 避免英文下行字母被 overflow 裁切 */
}
.chat__bar-btn:hover {
  background: var(--ai-hover);
  color: var(--ai-fg);
}
.chat__bar-plus { width: 26px; min-width: 26px; padding: 0; justify-content: center; flex: 0 0 auto; }
.chat__spark { color: var(--ai-accent); }
.chat .chat__send {
  width: 30px; height: 30px; border-radius: var(--ai-radius-md);
  border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--ai-accent); color: var(--ai-accent-fg);
  box-shadow: none;
  transition: background .12s, color .12s, opacity .15s ease, transform .06s ease;
  flex-shrink: 0;
}
.chat .chat__send:hover:not(:disabled) {
  background: var(--ai-accent-hover);
}
.chat .chat__send:active:not(:disabled) { transform: translateY(1px); }
.chat .chat__send:disabled {
  opacity: 0.4; cursor: not-allowed;
  background: var(--ai-hover); color: var(--ai-fg-muted);
  box-shadow: none;
}
.chat .chat__send--stop {
  background: var(--ai-hover);
  color: var(--ai-fg-muted);
}
.chat .chat__send--stop:hover:not(:disabled) {
  background: var(--ai-active);
  color: var(--ai-fg);
}
.chat__stop-square {
  width: 10px; height: 10px;
  background: currentColor; border-radius: 2.5px;
}

/* 上传中 spinner (取代发送箭头, 表示正在上传) */
.chat__send--uploading {
  cursor: wait; opacity: 0.85;
}
.chat__upload-spinner {
  display: block; width: 14px; height: 14px;
  border: 2px solid var(--ai-accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: chat-spin 0.8s linear infinite;
}
@keyframes chat-spin {
  to { transform: rotate(360deg); }
}
/* 附件卡: 上传中脉动 */
.chat__attach-card.is-uploading {
  animation: chat-pulse 1s ease-in-out infinite;
}
@keyframes chat-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ai-accent) 40%, transparent); }
  50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--ai-accent) 12%, transparent); }
}

/* Model picker — 居中全局模态框 + 遮罩 */
.chat__modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: var(--vscode-overlay-background, rgba(0,0,0,0.45));
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: chat-fade .12s ease-out;
}
@keyframes chat-fade { from { opacity: 0; } to { opacity: 1; } }

.chat__modal {
  width: 560px; max-width: 100%;
  max-height: min(calc(100vh - 72px), 600px);
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 16px;
  box-shadow: var(--ai-pop-shadow);
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: chat-pop .14s ease-out;
}
@keyframes chat-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.chat__modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; padding: 20px 22px 12px;
}
.chat__modal-header--page {
  align-items: center; gap: 10px;
  padding: 18px 22px 8px;
}
.chat__modal-header-text { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.chat__modal-title {
  font-size: 17px; font-weight: 600; color: var(--ai-fg);
  display: inline-flex; align-items: center; gap: 8px;
}
.chat__modal-title-icon { color: var(--ai-accent); display: inline-flex; }
.chat__modal-count {
  font-size: 12px; font-weight: 400; color: var(--ai-fg-muted);
  margin-left: 2px;
}
.chat__modal-subtitle {
  font-size: 13px; color: var(--ai-fg-muted);
}
.chat__modal-back {
  width: 30px; height: 30px;
  background: transparent; border: none;
  color: var(--ai-fg-muted);
  cursor: pointer; padding: 0; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px;
}
.chat__modal-back:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__modal-btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 14px;
  background: var(--ai-hover);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px; font-weight: 500;
  cursor: pointer; flex-shrink: 0;
}
.chat__modal-btn-primary:hover { background: var(--ai-hover); }

/* Search */
.chat__modal-search {
  display: flex; align-items: center; gap: 10px;
  margin: 16px 16px 4px;
  padding: 9px 14px;
  background: var(--ai-input-bg);
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  color: var(--ai-fg-muted);
}
.chat__modal-search:focus-within {
  border-color: var(--ai-accent);
  background: var(--ai-accent-soft);
}
.chat__modal-search input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px;
}
.chat__modal-search input::placeholder { color: var(--ai-fg-muted); }

/* Body */
.chat__modal-body {
  flex: 1; overflow-y: auto;
  padding: 16px 12px 16px;
}
.chat__modal-body--apikey {
  padding: 8px 22px 22px;
}

.chat__modal-error {
  margin: 8px 6px;
  padding: 8px 12px;
  background: var(--ai-danger-bg);
  border: 1px solid var(--ai-danger-border);
  border-radius: 8px;
  color: var(--ai-danger); font-size: 13px;
}

/* select view: 分组模型列表 */
.chat__modal-group { padding: 2px 0; }
.chat__modal-group-title {
  padding: 12px 14px 6px;
  font-size: 11.5px; font-weight: 600; color: var(--ai-fg-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  user-select: none;
}
.chat__modal-item {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 8px 12px;
  background: transparent; border: none; border-radius: 8px;
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px;
  cursor: pointer; text-align: left;
  transition: background .14s ease, box-shadow .14s ease, color .14s ease;
}
.chat__modal-item:hover { background: var(--ai-hover); }
.chat__modal-item.is-active {
  background: var(--ai-accent-soft);
  color: var(--ai-fg);
}
.chat__modal-item.is-active .chat__modal-item-name {
  color: var(--ai-accent);
  font-weight: 600;
}
.chat__modal-item.is-highlighted {
  background: var(--ai-hover);
  outline: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ai-accent) 32%, transparent);
}
.chat__modal-item.is-highlighted.is-active {
  background: var(--ai-accent-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ai-accent) 48%, transparent);
}
/* 多行 layout (icon + title + desc + check) — 比紧凑行高 4px, 适合 agent/skill 等带描述 */
.chat__modal-item--row {
  padding: 9px 12px;
  align-items: flex-start;
  gap: 12px;
}
.chat__modal-item--row .chat__modal-item-icon {
  margin-top: 1px;
}
/* 单行 item (跟 ModelPicker 一致: icon + name + tag + check) */
.chat__modal-item-emoji {
  font-size: 16px; line-height: 1; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; flex-shrink: 0;
}
.chat__modal-item-name {
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-weight: 500;
  line-height: 1.45;
  padding-bottom: 1px; /* 英文下行字母不被裁切 */
}
.chat__modal-item-icon { font-size: 16px; line-height: 1; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 22px; }
.chat__modal-item-icon--lg { font-size: 18px; width: 28px; height: 28px; background: var(--ai-accent-soft); border-radius: 8px; }
.chat__modal-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.chat__modal-item-desc {
  font-size: 11.5px; color: var(--ai-fg-muted);
  line-height: 1.45; padding-bottom: 1px;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.chat__modal-item-check { color: var(--ai-accent); display: inline-flex; flex-shrink: 0; }

/* Header close (icon SVG) */
.chat__modal-x {
  width: 30px; height: 30px;
  background: transparent; border: none;
  color: var(--ai-fg-muted);
  cursor: pointer; padding: 0; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 7px;
  transition: all .12s;
}
.chat__modal-x:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__skill-item { align-items: flex-start; }
.chat__skill-body {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 3px;
}
.chat__skill-name { font-weight: 600; color: var(--ai-fg); }
.chat__skill-desc {
  font-size: 12px; font-weight: 400; color: var(--ai-fg-muted);
  line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.chat__skill-loc {
  font-size: 10.5px; color: var(--ai-fg-muted); opacity: .7;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__modal-tag {
  flex-shrink: 0;
  font-size: 10.5px; padding: 2px 7px; border-radius: 4px;
  background: var(--ai-success-bg);
  color: var(--ai-success);
}
.chat__modal-check { flex-shrink: 0; }
.chat__modal-empty {
  padding: 28px 16px; text-align: center;
  color: var(--ai-fg-muted); font-size: 13px;
}

.chat__modal-foot {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  box-shadow: 0 -1px 0 var(--ai-divider);
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px; font-weight: 500;
  cursor: pointer; text-align: left;
}
.chat__modal-foot:hover { background: var(--ai-input-bg); }

/* providers view: catalog 列表 */
.chat__modal-cat { padding: 2px 4px 12px; }
.chat__modal-cat-title {
  padding: 8px 12px;
  font-size: 13px; color: var(--ai-fg-muted);
  font-weight: 500;
}
.chat__modal-catrow {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 8px 14px;
  background: transparent; border: none; border-radius: 8px;
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px;
  cursor: pointer; text-align: left;
}
.chat__modal-catrow:hover { background: var(--ai-hover); }
.chat__modal-catrow.is-highlighted {
  background: var(--ai-hover);
  outline: 1px solid var(--ai-accent);
  outline-offset: -1px;
}
.chat__modal-catrow.is-connected { opacity: 0.65; }
.chat__modal-catrow.is-highlighted.is-connected { opacity: 1; }
.chat__modal-caticon {
  width: 24px; height: 24px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ai-fg-muted);
}
.chat__modal-catname { flex: 1; min-width: 0; font-size: 13px; }

/* apikey view */
.chat__modal-apikey-desc {
  margin: 4px 0 18px;
  font-size: 14px; line-height: 1.6;
  color: var(--ai-fg-muted);
}
.chat__modal-apikey-label {
  display: block;
  font-size: 14px; font-weight: 600;
  color: var(--ai-fg);
  margin-bottom: 8px;
}
.chat__modal-apikey-input {
  width: 100%;
  padding: 11px 14px;
  background: var(--ai-input-bg);
  border: 1px solid var(--ai-accent);
  border-radius: 10px;
  color: var(--ai-fg);
  font-family: inherit; font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.chat__modal-apikey-input:focus {
  border-color: var(--ai-accent);
  background: var(--ai-accent-soft);
}
.chat__modal-apikey-actions {
  display: flex; justify-content: flex-start;
  margin-top: 18px;
}
.chat__modal-btn-continue {
  height: 38px; padding: 0 26px;
  background: var(--ai-accent);
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  color: var(--ai-accent-fg);
  font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer;
  box-shadow: var(--ai-shadow);
}
.chat__modal-btn-continue:hover:not(:disabled) { filter: brightness(1.12); }
.chat__modal-btn-continue:disabled { opacity: 0.5; cursor: not-allowed; }


/* Sessions modal — 历史会话 */
.chat__sess-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.chat__sess-clear {
  background: transparent; border: 1px solid var(--ai-border); border-radius: 6px;
  color: var(--ai-danger); font-size: 12px; cursor: pointer; padding: 4px 10px;
}
.chat__sess-clear:hover { background: var(--ai-danger-bg); }
/* 搜索聚焦不换色 */
.chat__sess-modal .chat__modal-search:focus-within {
  border-color: var(--ai-border);
  background: var(--ai-input-bg);
}
.chat__sess-item {
  padding: 10px 12px;
  gap: 10px;
  border-radius: 10px;
}
.chat__sess-item .chat__modal-item-name {
  letter-spacing: -0.01em;
}
/* 选中 / 键盘高亮: 更清淡 */
.chat__sess-item.is-active {
  background: color-mix(in srgb, var(--ai-accent) 7%, transparent);
}
.chat__sess-item.is-active .chat__modal-item-name {
  color: var(--ai-accent);
  font-weight: 500;
}
.chat__sess-item.is-highlighted {
  background: var(--ai-hover);
  box-shadow: none;
}
.chat__sess-item.is-highlighted.is-active {
  background: color-mix(in srgb, var(--ai-accent) 9%, transparent);
  box-shadow: none;
}
.chat__sess-dir {
  flex-shrink: 0; max-width: 140px;
  font-size: 11px; color: var(--ai-fg-muted);
  line-height: 1.4; padding-bottom: 1px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__sess-item.is-active .chat__sess-dir {
  color: color-mix(in srgb, var(--ai-accent) 40%, var(--ai-fg-muted));
}
.chat__sess-del {
  flex-shrink: 0; width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 6px;
  color: var(--ai-fg-muted); cursor: pointer; padding: 0;
  opacity: 0;
  transition: opacity .12s ease, background .12s ease, color .12s ease;
}
.chat__modal-item:hover .chat__sess-del,
.chat__modal-item.is-highlighted .chat__sess-del { opacity: 1; }
.chat__sess-del:hover { background: var(--ai-danger-bg); color: var(--ai-danger); }

/* 历史会话分组标题: 不用强制大写, 避免观感生硬 */
.chat__sess-group .chat__modal-group-title {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 500;
  padding: 10px 12px 4px;
}


/* ========== 命令 / 提及 弹层 (输入框上方, 与 agent-pop 风格统一) ========== */
.chat__cmd-pop {
  position: absolute; bottom: calc(100% + 6px); left: 12px; right: 12px;
  max-height: 280px; overflow-y: auto;
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 0 var(--ai-metal-edge) inset, 0 12px 32px color-mix(in srgb, #000 40%, transparent);
  padding: 4px;
  z-index: 70;
}
.chat__cmd-list { display: flex; flex-direction: column; gap: 1px; }
.chat__cmd-item {
  display: flex; align-items: baseline; gap: 10px;
  width: 100%; padding: 6px 10px;
  background: transparent; border: none; border-radius: 6px;
  color: var(--ai-fg); font-family: inherit; text-align: left;
  cursor: pointer;
}
.chat__cmd-item--mention { align-items: center; }
.chat__cmd-item:hover { background: var(--ai-hover); }
.chat__cmd-item.active { background: var(--ai-active); }
.chat__cmd-cmd {
  flex: 0 1 auto; min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px; font-weight: 600;
  color: var(--ai-fg);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__cmd-name {
  flex: 1; min-width: 0;
  font-size: 12px; color: var(--ai-fg);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat__cmd-hint {
  flex-shrink: 0; max-width: 40%;
  font-size: 10.5px; color: var(--ai-fg-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  margin-left: auto;
  opacity: .8;
}
.chat__cmd-empty {
  padding: 18px 12px; text-align: center;
  color: var(--ai-fg-muted); font-size: 12px;
}

/* ========== Agent 选择下拉 (与 ModelPicker 风格统一) ========== */
.chat__agent-pop {
  position: absolute; bottom: calc(100% + 8px); left: 0;
  width: 320px; max-height: 380px; overflow-y: auto;
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 0 var(--ai-metal-edge) inset, 0 12px 32px color-mix(in srgb, #000 40%, transparent);
  padding: 6px;
  z-index: 60;
}
.chat__agent-pop-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px 8px;
}
.chat__agent-pop-title { font-size: 12px; font-weight: 600; color: var(--ai-fg); }
.chat__agent-pop-close {
  width: 22px; height: 22px;
  background: transparent; border: none;
  color: var(--ai-fg-muted); font-size: 13px; line-height: 1;
  cursor: pointer; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 5px;
}
.chat__agent-pop-close:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__agent-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 10px;
  background: transparent; border: none; border-radius: 8px;
  color: var(--ai-fg); font-family: inherit; text-align: left;
  cursor: pointer;
}
.chat__agent-item:hover { background: var(--ai-hover); }
.chat__agent-item.active { background: var(--ai-active); }
.chat__agent-item.active .chat__agent-name { color: var(--ai-fg); }
.chat__agent-icon {
  width: 28px; height: 28px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px;
  background: var(--ai-hover);
  border-radius: 7px;
}
.chat__agent-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.chat__agent-name { font-size: 12.5px; font-weight: 600; }
.chat__agent-desc { font-size: 11px; color: var(--ai-fg-muted); line-height: 1.4; }
.chat__agent-check { flex-shrink: 0; color: var(--ai-accent); display: inline-flex; }

/* ========== Tool call card (正式层: 白底双层阴影) ========== */
.tool {
  margin: 8px 0 0;
  background: var(--ai-bg-elev);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border: 1px solid var(--ai-border-card);
  border-radius: var(--ai-radius-lg);
  overflow: hidden;
  min-width: 0;
  box-shadow: var(--ai-shadow);
}
.tool__head {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 16px;
  background: transparent; border: none; cursor: pointer;
  color: var(--ai-fg); font-family: inherit; font-size: 14px;
  text-align: left;
  min-width: 0;
  transition: background .12s;
}
.tool__head:hover { background: var(--ai-hover); }
.tool.is-open > .tool__head { background: transparent; }
.tool__icon {
  width: 26px; height: 26px; border-radius: var(--ai-radius-sm);
  background: var(--ai-accent-50);
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--ai-accent);
}
.tool__icon svg { display: block; width: 14px; height: 14px; }
.tool.is-open > .tool__head .tool__icon { background: var(--ai-accent-50); }
.tool__name {
  font-weight: 600; font-size: 14px;
  color: var(--ai-fg);
  flex-shrink: 0;
}
.tool__summary {
  flex: 1; min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; color: var(--ai-fg-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 0 4px;
}
.chat .tool__caret {
  margin-left: auto;
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; flex-shrink: 0;
  color: var(--ai-fg-muted);
  transition: transform .16s ease, color .16s ease;
  transform: rotate(0deg);
}
.chat .tool.is-open > .tool__head .tool__caret {
  transform: rotate(90deg);
  color: var(--ai-fg);
}
.chat .tool__head:hover .tool__caret { color: var(--ai-fg); }
.tool__body { padding: 0 16px 16px; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.tool__section {
  margin-top: 0;
  min-width: 0;
  box-shadow: none;
  padding-left: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.tool__section pre {
  margin: 0; padding: 11px;
  background: var(--ai-surface-code);
  border: 1px solid var(--ai-border-think);
  border-radius: var(--ai-radius-md);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; line-height: 19px;
  color: var(--ai-fg);
  max-width: 100%; min-width: 0;
  overflow-x: auto; overflow-y: auto;
  white-space: pre-wrap; word-break: break-all;
  max-height: 260px;
}
.tool__section.is-error pre { color: var(--ai-danger); background: var(--ai-danger-bg); border-color: var(--ai-danger-border); }
.tool__section-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 0;
}
.tool__section-label {
  font-size: 11px; font-weight: 500;
  color: var(--ai-fg-placeholder);
  text-transform: none; letter-spacing: 0;
}
.tool__copy {
  font-size: 11px; padding: 2px 6px;
  background: transparent; border: none; border-radius: var(--ai-radius-sm);
  color: var(--ai-fg-muted); cursor: pointer;
  font-family: inherit;
  transition: background .12s, color .12s;
}
.tool__copy:hover { background: var(--ai-hover); color: var(--ai-fg); }
.tool__code {
  margin: 0; padding: 11px;
  background: var(--ai-surface-code);
  border: 1px solid var(--ai-border-think);
  border-radius: var(--ai-radius-md);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; line-height: 19px;
  color: var(--ai-fg);
  max-width: 100%; min-width: 0;
  overflow-x: auto; overflow-y: auto;
  white-space: pre-wrap; word-break: break-all;
  max-height: 260px;
}
.tool__status {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px;
  background: var(--ai-hover); color: var(--ai-fg-muted);
  flex-shrink: 0;
}
.tool__status.is-completed { color: var(--ai-success-fg); background: var(--ai-success-bg); }
.tool__status.is-error { color: var(--ai-danger); background: var(--ai-danger-bg); }
.tool__status.is-running { color: var(--ai-accent); background: var(--ai-accent-50); }
.tool__status-icon { font-size: 10px; }
.tool__attach-list {
  display: flex; flex-wrap: wrap; gap: 4px;
  padding: 4px 0;
}
.tool__attach {
  font-size: 11px; padding: 2px 6px;
  background: var(--ai-bg); border-radius: 4px;
  color: var(--ai-fg-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* ========== Question card ========== */
.q {
  margin: 8px 0 0;
  background: var(--ai-bg-elev);
  border: 1px solid var(--ai-border-card);
  border-radius: var(--ai-radius-lg);
  overflow: hidden;
  min-width: 0;
  box-shadow: var(--ai-shadow);
  pointer-events: auto;
}
.q__head {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 16px;
  background: transparent; border: none; cursor: pointer;
  user-select: none; font-family: inherit;
  font-size: 14px; font-weight: 600; text-align: left;
  color: var(--ai-fg);
}
.q__head:hover { background: var(--ai-hover); }
.q__icon {
  width: 26px; height: 26px; border-radius: var(--ai-radius-sm);
  background: var(--ai-accent-50);
  color: var(--ai-accent);
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.q__icon svg { display: block; }
.chat .q__caret {
  margin-left: auto;
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; flex-shrink: 0;
  color: var(--ai-fg-muted);
  transition: transform .16s ease, color .16s ease;
  transform: rotate(0deg);
}
.chat .q__caret.is-open { transform: rotate(90deg); color: var(--ai-fg); }
.q__head-title { flex: 1; min-width: 0; font-weight: 600; }
.q__tabs { display: flex; gap: 4px; flex-shrink: 0; }
.q__tab {
  min-width: 24px; padding: 2px 7px;
  background: transparent; border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-sm);
  color: var(--ai-fg-muted); font-size: 11px; font-weight: 500;
  font-family: inherit; cursor: pointer; text-align: center;
}
.q__tab:hover { background: var(--ai-hover); color: var(--ai-fg); }
.q__tab.is-active {
  background: var(--ai-accent-50); color: var(--ai-accent);
  border-color: var(--ai-accent-200);
}
.q__summary {
  display: flex; flex-direction: column; gap: 4px;
  margin-top: 2px;
  padding: 9px 12px;
  background: var(--ai-surface-code);
  border: 1px solid var(--ai-border-think);
  border-radius: var(--ai-radius-md);
  font-size: 13px; line-height: 20px;
}
.q__summary-label {
  font-size: 11px; font-weight: 500;
  color: var(--ai-fg-placeholder);
}
.q__summary-text { color: var(--ai-fg-secondary); }
.q.is-cancelled .q__summary-text { color: var(--ai-fg-muted); font-style: italic; }
.q__item { padding: 0 16px 14px; }
.q__header {
  font-size: 11px; font-weight: 500; color: var(--ai-fg-placeholder);
  margin-bottom: 4px;
}
.q__q {
  font-size: 14px; line-height: 22px; font-weight: 500;
  color: var(--ai-fg); margin-bottom: 10px;
}
.q__opts { display: flex; flex-direction: column; gap: 6px; pointer-events: auto; }
.q__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 0 0;
}
.q__opt {
  display: flex; align-items: flex-start; gap: 10px;
  width: 100%; padding: 9px 12px;
  background: var(--ai-bg-elev);
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  color: var(--ai-fg); font-family: inherit; font-size: 13px;
  cursor: pointer; text-align: left;
  pointer-events: auto;
  transition: border-color .12s, background .12s;
}
.q__opt:hover { background: var(--ai-hover); border-color: var(--ai-border-input); }
.q__opt.is-active {
  background: var(--ai-accent-50);
  border-color: var(--ai-accent);
}
.q__opt:disabled { opacity: 0.55; cursor: not-allowed; }
.q__opt.is-readonly:disabled,
.q.is-done .q__opt:disabled,
.q.is-cancelled .q__opt:disabled {
  opacity: 1; cursor: default;
}
.q__mark {
  width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;
  border: 1.5px solid var(--ai-fg-muted);
  border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ai-accent-fg);
  background: transparent;
  box-sizing: border-box;
}
.q__mark.is-radio { border-radius: 50%; }
.q__mark.is-on {
  border-color: var(--ai-accent);
  background: var(--ai-accent);
}
.q__mark.is-radio.is-on { background: transparent; }
.q__mark-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: transparent;
}
.q__mark.is-radio.is-on .q__mark-dot { background: var(--ai-accent); }
.q__opt-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.q__opt-label { font-size: 13px; line-height: 20px; }
.q__opt-desc { font-size: 11.5px; color: var(--ai-fg-muted); line-height: 1.4; }
.q__custom {
  width: 100%; resize: none;
  background: var(--ai-surface-code);
  border: 1px solid var(--ai-border-think);
  border-radius: var(--ai-radius-sm);
  outline: none;
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px; line-height: 20px;
  padding: 6px 8px; margin-top: 4px;
}
.q__custom:focus { border-color: var(--ai-accent); box-shadow: 0 0 0 3px var(--ai-accent-50); }
.q__custom::placeholder { color: var(--ai-fg-placeholder); }
.q__custom-opt { cursor: text; }
.q__foot-start { display: flex; gap: 8px; margin-right: auto; }
.q__foot-end { display: flex; gap: 8px; }
.q__nav {
  padding: 5px 12px; border-radius: var(--ai-radius-sm); cursor: pointer;
  background: transparent;
  color: var(--ai-fg-muted);
  border: 1px solid var(--ai-border);
  font-size: 12px; font-weight: 500; font-family: inherit;
}
.q__nav:hover { background: var(--ai-hover); color: var(--ai-fg); }
/* 取消: 与上一步等同级次要按钮, 不用危险红 */
.q__cancel { color: var(--ai-fg-secondary); }
.q__cancel:hover { background: var(--ai-hover); color: var(--ai-fg); }
.q__submit {
  padding: 5px 14px; min-height: 30px;
  border-radius: var(--ai-radius-sm); cursor: pointer;
  background: var(--ai-accent); color: var(--ai-accent-fg);
  border: none;
  font-size: 12px; font-weight: 600; font-family: inherit;
}
.q__submit:hover { background: var(--ai-accent-hover); }
.q__submit:disabled { opacity: 0.5; cursor: default; }
.q--waiting {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  color: var(--ai-fg-muted);
  font-size: 12.5px;
}

/* ========== Question modal (dock above composer) ========== */
.chat__qmodal {
  margin-bottom: 8px;
  background: var(--ai-input-bg);
  border: none;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.chat__qmodal-head {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  box-shadow: 0 1px 0 var(--ai-divider);
  cursor: pointer; user-select: none;
  background: transparent; border: none; width: 100%; font-family: inherit; text-align: left;
}
.chat__qmodal-head:hover { background: var(--ai-hover); }
.chat__qmodal-caret {
  font-size: 10px; color: var(--ai-fg-muted); flex-shrink: 0;
}
.chat__qmodal-count { font-size: 12px; font-weight: 500; }
.chat__qmodal-tabs { display: flex; gap: 4px; flex: 1; }
.chat__qmodal-tab {
  padding: 3px 10px;
  background: transparent; border: none; border-radius: 5px;
  color: var(--ai-fg-muted); font-size: 11.5px;
  cursor: pointer;
}
.chat__qmodal-tab:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__qmodal-tab.is-active {
  background: var(--ai-active); color: var(--ai-fg);
}
.chat__qmodal-min {
  width: 24px; height: 24px;
  background: transparent; border: none; border-radius: 5px;
  color: var(--ai-fg-muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.chat__qmodal-min:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__qmodal-body { padding: 10px 12px; }
.chat__qmodal-q { font-size: 13px; line-height: 1.5; }
.chat__qmodal-hint { font-size: 11.5px; color: var(--ai-fg-muted); margin: 4px 0 8px; }
.chat__qmodal-opts { display: flex; flex-direction: column; gap: 4px; }
.chat__qmodal-opt {
  display: flex; align-items: flex-start; gap: 8px;
  width: 100%; padding: 8px 10px;
  background: transparent; border: 1px solid transparent; border-radius: 6px;
  color: var(--ai-fg); font-family: inherit; font-size: 13px;
  cursor: pointer; text-align: left;
}
.chat__qmodal-opt:hover { background: var(--ai-input-bg); }
.chat__qmodal-opt.is-active { background: var(--ai-active); }
.chat__qmodal-opt.is-custom { cursor: text; }
.chat__qmodal-radio {
  width: 15px; height: 15px; border-radius: 50%;
  border: 1.5px solid var(--descriptionForeground);
  flex-shrink: 0; margin-top: 1px;
  display: inline-flex; align-items: center; justify-content: center;
}
.chat__qmodal-opt.is-active .chat__qmodal-radio { border-color: var(--ai-accent); }
.chat__qmodal-radio-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: transparent;
}
.chat__qmodal-opt.is-active .chat__qmodal-radio-dot { background: var(--ai-accent); }
.chat__qmodal-opt-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.chat__qmodal-opt-label { font-size: 13px; }
.chat__qmodal-opt-desc { font-size: 11.5px; color: var(--ai-fg-muted); line-height: 1.4; }
.chat__qmodal-opt textarea {
  width: 100%; resize: none;
  background: transparent; border: none; outline: none;
  color: var(--ai-fg);
  font-family: inherit; font-size: 13px;
  padding: 2px 0;
}
.chat__qmodal-opt textarea::placeholder { color: var(--ai-fg-muted); }
.chat__qmodal-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  padding: 4px 12px 10px;
  border-top: none;
}
.chat__qmodal-foot-start { display: flex; gap: 8px; }
.chat__qmodal-foot-end { display: flex; gap: 8px; margin-left: auto; }
.chat__qmodal-btn {
  padding: 4px 10px; border-radius: 5px; cursor: pointer;
  background: transparent; border: none;
  color: var(--ai-fg-muted);
  font-size: 12px; font-weight: 500;
}
.chat__qmodal-btn:hover { background: var(--ai-hover); color: var(--ai-fg); }
.chat__qmodal-btn--primary {
  background: var(--ai-hover);
}
.chat__qmodal-btn--primary:hover { background: var(--ai-hover); }
.chat__qmodal-btn:disabled { opacity: 0.5; cursor: default; }

/* ========== Todo card ========== */
.todo {
  margin: 8px 0 0;
  background: var(--ai-bg-elev);
  border: 1px solid var(--ai-border-card);
  border-radius: var(--ai-radius-lg);
  overflow: hidden;
  min-width: 0;
  box-shadow: var(--ai-shadow);
}
.todo__head {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 16px;
  background: transparent; border: none; cursor: pointer;
  color: var(--ai-fg); font-size: 14px; font-weight: 600;
  font-family: inherit; text-align: left; min-width: 0;
}
.todo__head:hover { background: var(--ai-hover); }
.todo.is-open > .todo__head { background: transparent; }
.todo__icon {
  width: 26px; height: 26px; border-radius: var(--ai-radius-sm);
  background: var(--ai-accent-50);
  color: var(--ai-accent);
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.todo__icon svg { display: block; }
.todo__title {
  font-weight: 600; font-size: 14px;
  color: var(--ai-fg); flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.todo__pill {
  flex-shrink: 0;
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 500;
  background: var(--ai-hover); color: var(--ai-fg-muted);
}
.todo__pill.is-progress {
  background: var(--ai-accent-50); color: var(--ai-accent);
}
.todo__pill.is-done {
  background: var(--ai-success-bg); color: var(--ai-success-fg);
}
.chat .todo__caret {
  margin-left: 2px;
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; flex-shrink: 0;
  color: var(--ai-fg-muted);
  transition: transform .16s ease, color .16s ease;
  transform: rotate(0deg);
}
.chat .todo__caret.is-open { transform: rotate(90deg); color: var(--ai-fg); }
.todo__body { padding: 0 16px 14px; }
.todo__progress {
  height: 3px; border-radius: 999px;
  background: var(--ai-border-think);
  overflow: hidden; margin: 0 0 10px;
}
.todo__progress-bar {
  height: 100%; border-radius: 999px;
  background: var(--ai-accent);
  transition: width .2s ease;
}
.todo.is-done .todo__progress-bar { background: var(--ai-success); }
.todo__list {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.todo__item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 8px 10px;
  background: var(--ai-surface-code);
  border: 1px solid var(--ai-border-think);
  border-radius: var(--ai-radius-md);
  font-size: 13px; line-height: 20px;
  color: var(--ai-fg);
}
.todo__item.is-in_progress {
  background: var(--ai-accent-50);
  border-color: var(--ai-accent-200);
}
.todo__item.is-completed,
.todo__item.is-cancelled {
  color: var(--ai-fg-muted);
}
.todo__item.is-completed .todo__content { text-decoration: line-through; }
.todo__item.is-cancelled .todo__content { text-decoration: line-through; }
.todo__check {
  width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px;
  border: 1.5px solid var(--ai-fg-muted);
  border-radius: 5px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600;
  color: var(--ai-fg-muted);
  box-sizing: border-box;
}
.todo__check.is-pending { border-radius: 50%; }
.todo__check.is-progress {
  border-color: var(--ai-accent);
  background: var(--ai-bg-elev);
}
.todo__check-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ai-accent);
  animation: todoPulse 1.2s ease-in-out infinite;
}
.todo__check.is-completed {
  border-color: var(--ai-success);
  background: var(--ai-success);
  color: #fff;
}
.todo__check.is-cancelled {
  border-color: var(--ai-danger);
  background: var(--ai-danger-bg);
  color: var(--ai-danger);
}
.todo__content { flex: 1; min-width: 0; word-break: break-word; }
.todo__pri {
  flex-shrink: 0;
  font-size: 10px; font-weight: 600;
  padding: 1px 6px; border-radius: 999px;
  background: var(--ai-hover); color: var(--ai-fg-muted);
}
.todo__pri.is-high { color: var(--ai-danger); background: var(--ai-danger-bg); }
.todo__pri.is-low { color: var(--ai-fg-muted); }
.todo--empty {
  margin: 8px 0 0;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: var(--ai-bg-elev);
  border: 1px solid var(--ai-border-card);
  border-radius: var(--ai-radius-lg);
  box-shadow: var(--ai-shadow);
  color: var(--ai-fg-muted); font-size: 13px;
}
.todo__empty-text { flex: 1; }
@keyframes todoPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.85); }
}

/* ========== Reasoning (轻量层: 浅底无阴影) ========== */
.reason {
  margin: 0 0 8px;
  background: var(--ai-surface-think);
  border: 1px solid var(--ai-border-think);
  border-radius: var(--ai-radius-lg);
  overflow: hidden;
  min-width: 0;
  box-shadow: none;
}
.reason__head {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 16px;
  background: transparent; border: none; cursor: pointer;
  color: var(--ai-fg); font-family: inherit;
  font-size: 13px; font-weight: 600; text-align: left;
}
.reason__head:hover { background: transparent; color: var(--ai-fg); }
.reason__icon {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ai-accent);
  display: inline-block; flex-shrink: 0;
  color: transparent;
}
.chat .reason__caret {
  margin-left: auto;
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  color: var(--ai-fg-muted);
  transition: transform .16s ease, color .16s ease;
  transform: rotate(0deg);
}
.chat .reason.is-open > .reason__head .reason__caret {
  transform: rotate(90deg);
  color: var(--ai-fg);
}
.chat .reason__head:hover .reason__caret { color: var(--ai-fg); }
.reason__body {
  padding: 0 16px 16px;
}
.reason__body pre {
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 22px;
  color: var(--ai-fg-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

/* Gate (logged out) */
.chat__gate {
  margin: auto; text-align: left;
  max-width: 340px; padding: 32px 20px;
  display: flex; flex-direction: column; gap: 14px;
  color: var(--ai-fg);
}
.chat__gate-logo {
  width: 64px; height: 64px; border-radius: 18px;
  background: var(--ai-accent);
  color: var(--ai-accent-fg);
  display: flex; align-items: center; justify-content: center;
  font-size: 30px; font-weight: 700;
  box-shadow: none;
  text-shadow: none;
}
.chat__gate-logo-img {
  width: 64px; height: 64px; border-radius: 50%;
  object-fit: cover; display: block;
}
.chat__gate-title { margin: 0; font-size: 19px; font-weight: 600; line-height: 1.4; color: var(--ai-fg); }
.chat__gate-brand {
  background: linear-gradient(135deg, var(--ai-accent), var(--ai-accent));
  -webkit-background-clip: text; background-clip: text; color: var(--ai-accent);
}
.chat__gate-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.chat__gate-features li { display: flex; align-items: flex-start; gap: 10px; font-size: 12.5px; color: var(--ai-fg); line-height: 1.5; }
.chat__gate-features svg { color: var(--ai-fg); flex-shrink: 0; margin-top: 2px; }
.chat__gate-user {
  margin-top: 6px;
  font-size: 11.5px; color: var(--ai-fg-muted);
  padding-top: 12px; box-shadow: 0 -1px 0 var(--ai-divider);
}

/* Welcome */
.chat__welcome {
  margin: auto;
  text-align: center;
  max-width: 420px; padding: 32px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.chat__welcome-brand {
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
.chat__welcome-logo {
  width: 48px; height: 48px; border-radius: 12px;
  background: var(--ai-accent);
  color: var(--ai-accent-fg); font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: none;
  text-shadow: none;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.chat__welcome-logo-img {
  width: 40px; height: 40px; border-radius: 50%;
  object-fit: cover; display: block; flex-shrink: 0;
}
.chat__welcome-title {
  margin: 0; font-size: 28px; font-weight: 700; color: var(--ai-fg);
  letter-spacing: 1px; line-height: 1.2;
}
.chat__welcome-sub {
  margin: 0; font-size: 15px; color: var(--ai-fg-muted); line-height: 1.5;
}
.chat__welcome-features {
  list-style: none; margin: 8px 0 0; padding: 0;
  display: flex; flex-direction: column; align-items: flex-start; gap: 14px;
  width: fit-content; max-width: 100%;
}
.chat__welcome-feature {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 14px; color: var(--ai-fg); line-height: 1.5;
  text-align: left;
}
.chat__welcome-check {
  width: 18px; height: 18px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ai-accent); flex-shrink: 0; margin-top: 1px;
}
.chat__welcome-agents {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;
  margin-bottom: 12px;
}
.chat__agent-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
  padding: 12px;
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 10px;
  color: var(--ai-fg); font-family: inherit;
  cursor: pointer; text-align: left;
  box-shadow: none;
  transition: background .12s;
}
.chat__agent-card:hover { background: var(--ai-hover); }
.chat__agent-card.is-active {
  background: var(--ai-active);
  border-color: var(--ai-accent);
}
.chat__agent-card-icon { font-size: 16px; }
.chat__agent-card-name { font-size: 13px; font-weight: 600; }
.chat__agent-card-desc { font-size: 10.5px; color: var(--ai-fg-muted); line-height: 1.4; }

.chat__welcome-suggest {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;
}
.chat__suggest {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px;
  background: var(--ai-glass-bg);
  -webkit-backdrop-filter: var(--ai-glass-blur);
  backdrop-filter: var(--ai-glass-blur);
  border: none;
  border-radius: 10px;
  color: var(--ai-fg); font-family: inherit;
  cursor: pointer; text-align: left;
  box-shadow: none;
}
.chat__suggest:hover { background: var(--ai-hover); }
.chat__suggest-icon { font-size: 16px; flex-shrink: 0; }
.chat__suggest-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.chat__suggest-title { font-size: 12px; font-weight: 500; }
.chat__suggest-desc { font-size: 10.5px; color: var(--ai-fg-muted); line-height: 1.4; }

`;
