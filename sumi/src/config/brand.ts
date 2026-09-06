/**
 * 项目级 Chat 配置 — core/config/brand.ts
 *
 * 单一来源. 全应用 (chat/welcome/error 等所有 UI 文案) 都从这里取.
 * 换产品改这一个文件, 所有引用方无需动.
 *
 * 结构:
 *   brand        — 全局品牌 (主区欢迎页 / 顶栏兜底等), 保持原内容不改
 *   emptyState   — chat 空状态专用 (云燕)
 *   suggestions  — 欢迎页建议卡片
 */

import brandLogo from '../assets/logo.png';

export const APP_CHAT_CONFIG = {
  brand: {
    name: '云燕',
    title: '云燕',
    subtitle: '让 AI 应用开发，从晦涩到上手',
    greeting: '云燕',
    logoUrl: brandLogo as string,
  },
  /** chat 空状态 (WelcomeScreen) — 与主区欢迎页解耦 */
  emptyState: {
    name: '云燕',
    title: '云燕',
    subtitle: '让 AI 应用开发，从晦涩到上手',
    greeting: '云燕',
    logo: '云燕',
    logoUrl: brandLogo as string,
    features: [
      '擅长 AI 应用搭建、验证与成果输出',
      '智能实验任务拆解，分步落地实现',
      '多 AI 能力协同调用，输出 AI 应用',
    ],
  },
  suggestions: [
    // { icon: '🚀', title: '帮我完成一个任务', desc: '告诉我目标，拆解并执行', prompt: '帮我完成一个任务' },
  ],
} as const;

export type AppChatConfig = typeof APP_CHAT_CONFIG;
