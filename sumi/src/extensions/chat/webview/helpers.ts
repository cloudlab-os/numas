/**
 * 常量 + helpers — extensions/chat/webview/helpers.ts
 * UI 不变, 仅搬迁位置 (类型/常量/纯函数, 无 hooks).
 */

import { extractAssistantTodos } from './parts/TodoCard';

/** 字节 → base64（浏览器端, 分块避免栈溢出） */
export function bytesToBase64(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export interface Row {
  id: string;
  role: 'user' | 'assistant';
  parts: any[];
  error?: any;
  /** 消息时间戳 (created/completed), 用于 meta 展示耗时 */
  time?: { created?: number; completed?: number };
  /** assistant 消息级 token / 费用 (来自 message.info) */
  tokens?: {
    total?: number;
    input?: number;
    output?: number;
    reasoning?: number;
    cache?: { read?: number; write?: number };
  };
  cost?: number;
  modelID?: string;
}

/** 汇总一次 token 用量 (优先 total, 否则 input+output+reasoning+cache) */
export function tokenTotal(t: any): number {
  if (!t || typeof t !== 'object') return 0;
  if (typeof t.total === 'number' && Number.isFinite(t.total) && t.total > 0) return t.total;
  return (
    (Number(t.input) || 0)
    + (Number(t.output) || 0)
    + (Number(t.reasoning) || 0)
    + (Number(t.cache?.read) || 0)
    + (Number(t.cache?.write) || 0)
  );
}

export function formatTokenCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

export function formatTokenTip(t: any): string {
  if (!t || typeof t !== 'object') return '';
  const parts: string[] = [];
  if (t.input) parts.push(`输入 ${formatTokenCount(t.input)}`);
  if (t.output) parts.push(`输出 ${formatTokenCount(t.output)}`);
  if (t.reasoning) parts.push(`推理 ${formatTokenCount(t.reasoning)}`);
  const cache = (Number(t.cache?.read) || 0) + (Number(t.cache?.write) || 0);
  if (cache) parts.push(`缓存 ${formatTokenCount(cache)}`);
  return parts.join(' · ');
}

export const HIDDEN_AGENTS = new Set(['compaction', 'title', 'summary']);

export const AGENT_ICONS: Record<string, string> = {
  build: '🔨',
  plan: '🗺',
  general: '✨',
  explore: '🔭',
};

export const AGENT_DESC: Record<string, string> = {
  build: '执行任务 · 文件操作 · 命令执行',
  plan: '规划方案 · 任务拆解 (只读工具)',
  general: '通用问答 · 多步任务并行执行',
  explore: '信息检索 · 上下文探索',
};

export const CLIENT_COMMANDS: Array<{ cmd: string; desc: string; hint?: string }> = [
  { cmd: 'models',    desc: '选择模型', hint: '打开模型选择' },
  { cmd: 'connect',   desc: '选择服务商', hint: '搜索服务商 · 输入 API Key 连接' },
  { cmd: 'compact',   desc: '压缩上下文', hint: 'AI summary, 释放 tokens' },
  { cmd: 'new',       desc: '创建新会话', hint: '新建一个空白会话' },
  { cmd: 'sessions',  desc: '历史会话', hint: '打开历史会话列表' },
  { cmd: 'skills',    desc: '选择技能', hint: '打开技能选择弹层' },
  { cmd: 'agents',    desc: '选择角色', hint: '切换 agent 角色' },
];

export function findCurrentTodos(parts: any[]): Array<{ content: string; status: string; priority?: string }> {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p?.type === 'tool' && String(p.tool || '').toLowerCase() === 'todowrite') {
      const todos = extractAssistantTodos(p?.state?.output)
        .concat(extractAssistantTodos(p?.state?.input));
      if (todos.length) return todos;
    }
  }
  return [];
}

export function extractText(parts: any[] | undefined): string {
  if (!Array.isArray(parts)) return '';
  return parts
    .filter((p: any) => p?.type === 'text' && !p?.synthetic && !p?.ignored)
    .map((p: any) => p.text || '')
    .join('');
}

/** 与 PartRenderer 可见输出对齐: 有正文 / 思考 / 文件 / 工具卡才算有内容 */
export function hasVisibleAssistantContent(parts: any[] | undefined): boolean {
  if (!Array.isArray(parts)) return false;
  return parts.some((p: any) => {
    if (!p || p.synthetic || p.ignored) return false;
    if (p.type === 'text' || p.type === 'reasoning') return !!String(p.text || '').trim();
    if (p.type === 'file') return !!p.url;
    return p.type === 'tool';
  });
}

export function assistantTurnHasVisibleContent(rows: Row[], endIdx: number): boolean {
  for (let i = endIdx; i >= 0; i--) {
    const row = rows[i];
    if (!row || row.role !== 'assistant') break;
    if (hasVisibleAssistantContent(row.parts)) return true;
  }
  return false;
}

function assistantTurnEndAfter(rows: Row[], startIdx: number): number {
  if (startIdx >= rows.length || rows[startIdx]?.role !== 'assistant') return -1;
  let end = startIdx;
  while (end + 1 < rows.length && rows[end + 1].role === 'assistant') end++;
  return end;
}

export function isHiddenEmptyHistoricalAssistant(rows: Row[], idx: number): boolean {
  if (rows[idx]?.role !== 'assistant') return false;
  const end = assistantTurnEndAfter(rows, idx);
  if (end < 0 || assistantTurnHasVisibleContent(rows, end)) return false;
  return end !== rows.length - 1;
}

export function formatDuration(start?: number, end?: number): string {
  if (!start || !end) return '';
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 100) / 10;
  return `${sec}秒`;
}

/** 从消息 parts + 消息级 tokens 汇总消耗 */
export function collectUsage(row: { parts?: any[]; tokens?: any; cost?: number }) {
  let input = 0;
  let output = 0;
  let reasoning = 0;
  let total = 0;
  let cost = 0;
  for (const p of row.parts || []) {
    if (p?.type !== 'step-finish') continue;
    const t = p.tokens;
    if (t) {
      input += Number(t.input) || 0;
      output += Number(t.output) || 0;
      reasoning += Number(t.reasoning) || 0;
      total += tokenTotal(t);
    }
    cost += Number(p.cost) || 0;
  }
  if (total <= 0 && row.tokens) {
    input = Number(row.tokens.input) || 0;
    output = Number(row.tokens.output) || 0;
    reasoning = Number(row.tokens.reasoning) || 0;
    total = tokenTotal(row.tokens);
  }
  if (cost <= 0 && typeof row.cost === 'number') cost = row.cost;
  return { input, output, reasoning, total, cost };
}

/** 该行是否为本轮（一次用户问后连续 assistant）的末条 — 用于挂一个 meta */
export function isAssistantTurnEnd(rows: Row[], idx: number): boolean {
  const row = rows[idx];
  if (!row || row.role !== 'assistant') return false;
  const next = rows[idx + 1];
  return !next || next.role !== 'assistant';
}

/** 汇总连续 assistant 回合（含 endIdx）的耗时 / token / 费用 */
export function collectTurnStats(rows: Row[], endIdx: number) {
  let input = 0;
  let output = 0;
  let reasoning = 0;
  let total = 0;
  let cost = 0;
  let start: number | undefined;
  let end: number | undefined;
  let modelID = '';
  for (let i = endIdx; i >= 0; i--) {
    const row = rows[i];
    if (!row || row.role !== 'assistant') break;
    const u = collectUsage(row);
    input += u.input;
    output += u.output;
    reasoning += u.reasoning;
    total += u.total;
    cost += u.cost;
    const stepFinishes = (row.parts || []).filter((p: any) => p?.type === 'step-finish');
    const stepFinish = stepFinishes[stepFinishes.length - 1];
    const s = stepFinish?.time?.start ?? row.time?.created;
    const e = stepFinish?.time?.end ?? row.time?.completed;
    if (typeof s === 'number' && (start == null || s < start)) start = s;
    if (typeof e === 'number' && (end == null || e > end)) end = e;
    if (!modelID) {
      modelID = stepFinish?.modelID
        || row.modelID
        || row.parts?.find((p: any) => p?.type === 'text' && p?.modelID)?.modelID
        || '';
    }
  }
  return {
    input,
    output,
    reasoning,
    total,
    cost,
    duration: formatDuration(start, end),
    modelID,
  };
}

const questionStore = new Map<string, { requestID: string; questions: any[]; callID?: string }>();
/** 用户点「取消」abort 过的 que_*: 卡片显示「已取消」, 不可再答 */
const cancelledQuestionIDs = new Set<string>();
const questionSubscribers = new Set<() => void>();
const QUESTION_STORAGE = 'chat.question.v1';

// 从 sessionStorage 恢复 (question.asked 事件是实时的, 重载后会丢, 需要持久化 que_xxx)
function hydrateQuestionStore(): void {
  try {
    const raw = sessionStorage.getItem(QUESTION_STORAGE);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, { requestID: string; questions: any[]; callID?: string }>;
    for (const [k, v] of Object.entries(obj)) {
      if (v?.requestID) questionStore.set(k, v);
    }
  } catch { /* ignore */ }
}
hydrateQuestionStore();

export function notifyQuestionChange() { questionSubscribers.forEach((fn) => fn()); }

/** 记录某会话的待答问题 (que_xxx), 持久化到 sessionStorage 供重载后继续作答 */
export function setQuestion(
  sessionID: string,
  data: { requestID: string; questions: any[]; callID?: string },
): void {
  questionStore.set(sessionID, data);
  try {
    sessionStorage.setItem(QUESTION_STORAGE, JSON.stringify(Object.fromEntries(questionStore)));
  } catch { /* ignore */ }
  notifyQuestionChange();
}

export function getQuestionStore(): Map<string, { requestID: string; questions: any[]; callID?: string }> {
  return questionStore;
}

/** 按 session + callID 解析 pending question requestID.
 *  store 记了 callID 时必须匹配, 避免历史提问卡套用当前 que_* 变成可提交. */
export function resolveStoredQuestionRequestID(sessionID: string, callID?: string): string {
  const hit = questionStore.get(sessionID);
  if (!hit?.requestID?.startsWith('que')) return '';
  if (hit.callID) {
    if (!callID || hit.callID !== callID) return '';
  }
  return hit.requestID;
}

/** 清除某会话的待答问题 (回答/忽略后调用, 避免切回重复弹窗) */
export function clearQuestion(sessionID: string): void {
  questionStore.delete(sessionID);
  try {
    sessionStorage.setItem(QUESTION_STORAGE, JSON.stringify(Object.fromEntries(questionStore)));
  } catch { /* ignore */ }
  notifyQuestionChange();
}

/** 标记提问已取消 (abort), 并清 pending store */
export function markQuestionCancelled(sessionID: string, requestID?: string): void {
  const rid = requestID || questionStore.get(sessionID)?.requestID;
  if (rid?.startsWith('que')) cancelledQuestionIDs.add(rid);
  clearQuestion(sessionID);
}

export function isQuestionCancelled(requestID?: string): boolean {
  return !!requestID && cancelledQuestionIDs.has(requestID);
}

export function subscribeQuestionChange(fn: () => void): () => void {
  questionSubscribers.add(fn);
  return () => { questionSubscribers.delete(fn); };
}
