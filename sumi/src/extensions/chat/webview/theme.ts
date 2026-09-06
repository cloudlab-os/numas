/**
 * Chat 主题色板 — 对齐 AI Chat 设计规范 v2
 * 亮色硬编码规范色值；暗色用规范 §9.3。派生量挂 body，随原语解析。
 */

export const themeStyles = `
:root {
  --ai-accent: #2675EE;
  --ai-accent-hover: #1D5ED8;
  --ai-accent-fg: #ffffff;
  --ai-accent-50: #EFF6FF;
  --ai-accent-100: #E0EDFF;
  --ai-accent-200: #BFDBFE;
  --ai-radius: 14px;
  --ai-radius-sm: 7px;
  --ai-radius-md: 9px;
  --ai-radius-lg: 14px;
  --ai-radius-input: 16px;
  --ai-space: 20px;
  --ai-glass-blur: blur(18px) saturate(160%);
  --ai-press-shadow: none;

  --ai-bg: #FFFFFF;
  --ai-bg-elev: #FFFFFF;
  --ai-surface-think: #F8FAFC;
  --ai-surface-muted: #F4F7FA;
  --ai-surface-code: #F7F9FC;
  --ai-fg: #111827;
  --ai-fg-secondary: #44505F;
  --ai-fg-muted: #6B7280;
  --ai-fg-placeholder: #9AA4B2;
  --ai-border-card: #E8ECF2;
  --ai-border-think: #E9EDF3;
  --ai-border-input: #DCE4F0;
  --ai-border: #E4E9F0;
  --ai-danger: #EF4444;
  --ai-danger-bg: #FEF2F2;
  --ai-success: #059669;
  --ai-success-fg: #047857;
  --ai-success-bg: #ECFDF5;
  --ai-warning: #ca8a04;
  --ai-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 3px 12px rgba(0,0,0,0.06);
  --ai-pop-shadow: 0 16px 40px color-mix(in srgb, #000 12%, transparent), 0 0 0 1px var(--ai-border) inset;
  --ai-neon: color-mix(in srgb, var(--ai-accent) 55%, #1D5ED8);
}

body.design-light,
body.vs-light,
body.vs {
  --ai-accent: #2675EE;
  --ai-accent-hover: #1D5ED8;
  --ai-accent-50: #EFF6FF;
  --ai-accent-100: #E0EDFF;
  --ai-accent-200: #BFDBFE;
  --ai-bg: #FFFFFF;
  --ai-bg-elev: #FFFFFF;
  --ai-surface-think: #F8FAFC;
  --ai-surface-muted: #F4F7FA;
  --ai-surface-code: #F7F9FC;
  --ai-fg: #111827;
  --ai-fg-secondary: #44505F;
  --ai-fg-muted: #6B7280;
  --ai-fg-placeholder: #9AA4B2;
  --ai-border-card: #E8ECF2;
  --ai-border-think: #E9EDF3;
  --ai-border-input: #DCE4F0;
  --ai-border: #E4E9F0;
  --ai-danger: #EF4444;
  --ai-danger-bg: #FEF2F2;
  --ai-success: #059669;
  --ai-success-fg: #047857;
  --ai-success-bg: #ECFDF5;
  --ai-shadow: 0 1px 3px rgba(17,24,39,0.04), 0 3px 12px rgba(17,24,39,0.06);
}

body.design-dark,
body.vs-dark {
  --ai-accent: #4C8DFF;
  --ai-accent-hover: #2675EE;
  --ai-accent-50: color-mix(in srgb, var(--ai-accent) 16%, transparent);
  --ai-accent-100: color-mix(in srgb, var(--ai-accent) 22%, transparent);
  --ai-accent-200: color-mix(in srgb, var(--ai-accent) 38%, transparent);
  --ai-bg: #0F1419;
  --ai-bg-elev: #1A2029;
  --ai-surface-think: #151B23;
  --ai-surface-muted: color-mix(in srgb, #fff 6%, #0F1419);
  --ai-surface-code: color-mix(in srgb, #fff 5%, #151B23);
  --ai-fg: #E8EDF4;
  --ai-fg-secondary: #B7C0CC;
  --ai-fg-muted: #8A95A2;
  --ai-fg-placeholder: #6B7280;
  --ai-border-card: color-mix(in srgb, #fff 10%, transparent);
  --ai-border-think: color-mix(in srgb, #fff 8%, transparent);
  --ai-border-input: color-mix(in srgb, #fff 14%, transparent);
  --ai-border: color-mix(in srgb, #fff 10%, transparent);
  --ai-danger: #F87171;
  --ai-danger-bg: color-mix(in srgb, #EF4444 18%, transparent);
  --ai-success: #34D399;
  --ai-success-fg: #6EE7B7;
  --ai-success-bg: color-mix(in srgb, #059669 22%, transparent);
  --ai-warning: #facc15;
  --ai-shadow: 0 1px 3px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.32);
  --ai-pop-shadow: 0 24px 60px color-mix(in srgb, #000 55%, transparent), 0 0 0 1px var(--ai-border) inset;
}

body {
  --ai-bg-input: var(--ai-bg-elev);
  --ai-input-bg: var(--ai-bg-elev);
  --ai-divider: var(--ai-border-think);
  --ai-hover: var(--ai-surface-muted);
  --ai-active: var(--ai-accent-50);
  --ai-accent-soft: var(--ai-accent-50);
  --ai-danger-border: color-mix(in srgb, var(--ai-danger) 28%, transparent);
  --ai-metal-hi: color-mix(in srgb, var(--ai-fg) 14%, #ffffff);
  --ai-metal-mid: color-mix(in srgb, var(--ai-fg) 6%, var(--ai-bg-elev));
  --ai-metal-lo: color-mix(in srgb, var(--ai-fg) 4%, #000000);
  --ai-metal: linear-gradient(180deg, var(--ai-metal-hi) 0%, var(--ai-metal-mid) 45%, var(--ai-metal-lo) 100%);
  --ai-metal-edge: color-mix(in srgb, var(--ai-fg) 12%, transparent);
  --ai-metal-accent-hi: color-mix(in srgb, var(--ai-accent) 55%, #ffffff);
  --ai-metal-accent: linear-gradient(180deg, var(--ai-metal-accent-hi) 0%, var(--ai-accent) 55%, color-mix(in srgb, var(--ai-accent) 75%, #000000) 100%);
  --ai-glass-bg: var(--ai-bg-elev);
  --ai-glass-edge: var(--ai-border-card);
  --ai-chrome: radial-gradient(circle at 32% 24%, var(--ai-metal-hi) 0%, var(--ai-metal-mid) 40%, var(--ai-metal-lo) 92%);
  --ai-scrollbar: color-mix(in srgb, var(--ai-fg) 18%, transparent);
  --ai-scrollbar-hover: color-mix(in srgb, var(--ai-fg) 32%, transparent);
}
`;
