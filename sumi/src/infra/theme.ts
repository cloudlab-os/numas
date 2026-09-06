/** OpenSumi 主题 id，与 defaultPreferences / 顶栏切换保持一致。 */
export const THEME_LIGHT = 'opensumi-design-light-theme';
export const THEME_DARK = 'opensumi-design-dark-theme';
export const THEME_KEY = 'general.theme';

const CACHE_KEY = 'numas.uiTheme';

export function cacheUiTheme(isDark: boolean): void {
  try {
    localStorage.setItem(CACHE_KEY, isDark ? 'dark' : 'light');
  } catch { /* quota / privacy mode */ }
}

/**
 * Splash 在 AppRenderer 挂载前渲染，body 上还没有 vs-dark。
 * 优先读上次缓存，再扫 localStorage 里是否留下暗色主题 id，默认亮色（与 preferences 一致）。
 */
export function isPersistedDarkTheme(): boolean {
  if (typeof document !== 'undefined') {
    if (document.body.classList.contains('vs-dark') || document.body.classList.contains('design-dark')) {
      return true;
    }
  }
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached === 'dark') return true;
    if (cached === 'light') return false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (localStorage.getItem(key)?.includes(THEME_DARK)) return true;
    }
  } catch { /* */ }
  return false;
}
