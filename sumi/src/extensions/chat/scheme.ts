/**
 * chat 全局配置读取 — extensions/chat/scheme.ts
 *
 * 品牌/建议文案单一来源: config/brand.ts (直接 import, 编译期可静态追踪).
 * 不依赖 window.__APP_CONFIG__.chatConfig 中间层, 避免绕路.
 *
 * chatConfig 结构: { brand, emptyState, suggestions }
 * 没有全局配置时返回 null, UI 留空处理 (不兜底默认品牌).
 */

import { APP_CHAT_CONFIG } from '@/config/brand';

export interface ChatBrand {
  name: string;
  title: string;
  subtitle: string;
  greeting: string;
  /** 文字 logo; 有 logoUrl 时优先用图片 */
  logo?: string;
  /** 品牌图片 URL; 有则优先于 logo 文字 */
  logoUrl?: string;
}

export interface ChatEmptyState {
  name: string;
  title: string;
  subtitle: string;
  greeting: string;
  logo: string;
  logoUrl?: string;
  features: string[];
}

export interface ChatSuggestion {
  icon: string;
  title: string;
  desc: string;
  prompt: string;
}

export interface ChatConfig {
  brand: ChatBrand;
  emptyState?: ChatEmptyState;
  suggestions: ChatSuggestion[];
}

export function getChatConfig(): ChatConfig | null {
  return APP_CHAT_CONFIG as unknown as ChatConfig;
}

export function getBrand(): ChatBrand | null {
  return APP_CHAT_CONFIG.brand as unknown as ChatBrand;
}

/** chat 空状态文案; 未配置时回退 brand */
export function getEmptyState(): ChatEmptyState | null {
  const cfg = getChatConfig();
  if (!cfg) return null;
  if (cfg.emptyState) return cfg.emptyState;
  if (!cfg.brand) return null;
  return {
    name: cfg.brand.name,
    title: cfg.brand.title,
    subtitle: cfg.brand.subtitle,
    greeting: cfg.brand.greeting,
    logo: cfg.brand.logo || cfg.brand.name,
    logoUrl: cfg.brand.logoUrl,
    features: [],
  };
}

export function getFeatures(): string[] {
  return getEmptyState()?.features || [];
}

export function getSuggestions(): ChatSuggestion[] {
  return APP_CHAT_CONFIG.suggestions as unknown as ChatSuggestion[];
}

export function formatBrand(template: string, brand?: ChatBrand | ChatEmptyState | null): string {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, k) => (brand as any)?.[k] ?? `{${k}}`);
}
