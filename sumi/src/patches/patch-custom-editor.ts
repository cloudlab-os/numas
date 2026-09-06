/**
 * customEditor 根治 patch (v1) — web/src/dev/patch-custom-editor.ts
 *
 * 根因: opensumi/createCustomEditorComponent 的 React 组件在 dev mode 下
 *       mount→unmount→mount 双调用,导致 useEffect 异步 .then() 跑回来时
 *       React ref 已被设 null,挂载跳过,webview 永远不挂。
 *
 * 根治: webview 生命周期完全交给 main thread 接管,React 组件只 fire event。
 *       main thread patch onCustomEditorShouldDisplayEvent,自己 create webview
 *       + 挂到 workbench-editor 根下的 stable container (React 树外),
 *       监听编辑器事件自动调整位置 + 卸载。
 *
 * 刷新空白: 旧逻辑用 MutationObserver 在 tab DOM 尚未出现时就把 pending webview 卸掉,
 * 或读不到 current class 时把已挂上的 iframe display:none. 刷新恢复必须等 tab、禁止误杀.
 */

import { MainThreadCustomEditor } from '@opensumi/ide-extension/lib/browser/vscode/api/main.thread.custom-editor';
import {
  CustomEditorOptionChangeEvent,
  CustomEditorShouldHideEvent,
  CustomEditorType,
} from '@opensumi/ide-extension/lib/common/vscode/custom-editor';
// events 在 @opensumi/ide-editor/lib/browser/types
import { EditorGroupChangeEvent, EditorActiveResourceStateChangedEvent } from '@opensumi/ide-editor/lib/browser/types';
import { CancellationTokenSource } from '@opensumi/ide-core-common';

const TAG = '[ce-patch]';
/** DisplayEvent 早于 $registerCustomEditor 时的等待上限 (onStartupFinished 类第三方 vsix) */
const REGISTER_WAIT_MS = 15000;
/** 刷新恢复时 tab DOM 可能晚于 DisplayEvent；pending 重试窗口 */
const RESTORE_RETRY_MS = 20000;
const RESTORE_RETRY_INTERVAL_MS = 300;
/** tab 从 DOM 消失后再卸 webview，避免恢复过程中 React 重绘误杀 */
const UNMOUNT_DEBOUNCE_MS = 400;

/**
 * 自定义编辑器 iframe 用内联 pointer-events:auto 盖住编辑区。
 * OpenSumi sash 拖拽时往 iframe 上加 none-pointer-event，但类选择器赢不过内联 auto，
 * mouseup 被 iframe 吃掉，松手后仍像在拖。捕获阶段立刻穿透 iframe，保证 document 能收到 mouseup。
 */
function installSashIframePointerGuard() {
  const onDown = (e: MouseEvent) => {
    const el = e.target;
    if (!(el instanceof Element) || !el.closest('[class*="resize-handle"]')) return;
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
    document.documentElement.classList.add('numas-sash-dragging');
    for (const iframe of Array.from(document.querySelectorAll('iframe'))) {
      iframe.classList.add('none-pointer-event');
    }
  };
  const onUp = () => {
    if (!document.documentElement.classList.contains('numas-sash-dragging')) return;
    document.documentElement.classList.remove('numas-sash-dragging');
    for (const iframe of Array.from(document.querySelectorAll('iframe'))) {
      iframe.classList.remove('none-pointer-event');
    }
  };
  window.addEventListener('mousedown', onDown, true);
  // 必须等 mouseup 派发完再恢复 iframe 命中。pointerup 先于 mouseup，若提前恢复，mouseup 会打进 iframe，OpenSumi 松不开。
  window.addEventListener('mouseup', onUp);
  window.addEventListener('blur', onUp);
}

/**
 * 等 MainThreadCustomEditor.customEditors 出现指定 viewType。
 * 覆盖: 只有 onStartupFinished、没有 onCustomEditor 的第三方拓展。
 */
function waitForCustomEditor(
  instance: any,
  viewType: string,
  cancellationToken: any,
  timeoutMs = REGISTER_WAIT_MS,
): Promise<any> {
  const hit = instance.customEditors?.get(viewType);
  if (hit) return Promise.resolve(hit);

  return new Promise((resolve) => {
    let settled = false;
    let sub: { dispose?: () => void } | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (editor: any) => {
      if (settled) return;
      settled = true;
      try {
        sub?.dispose?.();
      } catch {
        /* */
      }
      if (poll) clearInterval(poll);
      if (timer) clearTimeout(timer);
      resolve(editor);
    };

    const tryGet = () => {
      if (cancellationToken?.isCancellationRequested) {
        finish(null);
        return;
      }
      const editor = instance.customEditors?.get(viewType);
      if (editor) finish(editor);
    };

    sub = instance.eventBus?.on?.(CustomEditorOptionChangeEvent, (ev: any) => {
      if (ev?.payload?.viewType === viewType) tryGet();
    });
    poll = setInterval(tryGet, 50);
    timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn(TAG, 'waitForCustomEditor timeout', { viewType, timeoutMs });
      finish(null);
    }, timeoutMs);
    tryGet();
  });
}

interface PendingMount {
  webview: any;
  viewType: string;
  uri: any;
  openTypeId: string;
  webviewOptions: any;
  extensionInfo: any;
  cancellationToken: any;
  editorType?: number;
  mounted: boolean;
  mounting?: boolean;
  /** 曾经在 DOM 里见过对应 tab；未见过就不要当「已关闭」卸掉（刷新恢复） */
  tabSeen?: boolean;
  unmountTimer?: ReturnType<typeof setTimeout>;
  stableContainer?: HTMLElement;
  resizeObserver?: ResizeObserver;
  onWindowResize?: () => void;
  syncPosition?: () => void;
  hideDisposable?: { dispose: () => void };
  docRef?: any;  // IEditorDocumentModelService 创建的 doc ref, 卸载时 dispose
}

interface InstanceState {
  pendingMounts: Map<string, PendingMount>;
  mountedMap: Map<string, PendingMount>;
  handlersRegistered: boolean;
  retryTimer?: ReturnType<typeof setInterval>;
  retryUntil?: number;
  syncVisible?: () => void;
}

const stateMap = new WeakMap<any, InstanceState>();

function getState(instance: any): InstanceState {
  let s = stateMap.get(instance);
  if (!s) {
    s = { pendingMounts: new Map(), mountedMap: new Map(), handlersRegistered: false };
    stateMap.set(instance, s);
  }
  return s;
}

function normalizeUriStr(s: string): string {
  if (!s) return '';
  let decoded = s;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    /* already decoded or malformed */
  }
  return decoded.replace(/\\/g, '/').replace(/\/+$/, '');
}

function urisMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  return normalizeUriStr(a) === normalizeUriStr(b);
}

function isCurrentEditorTab(el: Element): boolean {
  return Array.from(el.classList).some(
    (c) => c.includes('kt_editor_tab_current') && !c.includes('prev') && !c.includes('next'),
  );
}

function findTabEl(uriStr: string): HTMLElement | null {
  const root = document.getElementById('workbench-editor');
  if (!root) return null;
  const tabs = root.querySelectorAll('[data-uri]');
  for (let i = 0; i < tabs.length; i++) {
    const el = tabs[i] as HTMLElement;
    if (urisMatch(el.getAttribute('data-uri') || '', uriStr)) return el;
  }
  return null;
}

function findActiveTabUri(): string {
  const root = document.getElementById('workbench-editor');
  if (!root) return '';
  const tabs = root.querySelectorAll('[data-uri]');
  for (let i = 0; i < tabs.length; i++) {
    const el = tabs[i];
    if (isCurrentEditorTab(el)) return el.getAttribute('data-uri') || '';
  }
  return '';
}

function findPaperTabContainer(uriStr: string): {
  group: HTMLElement;
  editorBody: HTMLElement;
} | null {
  const tab = findTabEl(uriStr);
  if (!tab) return null;
  const group = tab.closest('[class*="kt_editor_group"]') as HTMLElement | null;
  if (!group) return null;
  const editorBody = group.querySelector('[class*="kt_editor_components"]') as HTMLElement | null;
  if (!editorBody) return null;
  return { group, editorBody };
}

function restoreSettled(state: InstanceState): boolean {
  const unmounted = Array.from(state.pendingMounts.values()).some((info) => !info.mounted);
  if (unmounted) return false;
  const active = findActiveTabUri();
  if (!active) return false;
  const all = [...Array.from(state.mountedMap.values()), ...Array.from(state.pendingMounts.values())];
  const current = all.find((info) => urisMatch(active, info.uri.toString()));
  if (!current) return false;
  return !!(current.mounted && current.stableContainer && current.stableContainer.style.display !== 'none');
}

function cancelScheduledUnmount(info: PendingMount): void {
  if (info.unmountTimer) {
    clearTimeout(info.unmountTimer);
    info.unmountTimer = undefined;
  }
}

export function installCustomEditorPatch(): void {
  if ((window as any).__CE_PATCH_DISABLED__) return;
  if ((window as any).__CE_PATCH_INSTALLED__) return;
  (window as any).__CE_PATCH_INSTALLED__ = true;
  // eslint-disable-next-line no-console
  console.log(TAG, 'installing — webview 生命周期移交 main thread');
  installSashIframePointerGuard();

  // patch onCustomEditorShouldDisplayEvent
  MainThreadCustomEditor.prototype.onCustomEditorShouldDisplayEvent = async function patchedDisplay(
    this: any,
    e: any,
  ) {
    const { viewType, uri, openTypeId, webviewPanelId, cancellationToken } = e.payload;
    const mapKeys = this.customEditors ? Array.from(this.customEditors.keys()) : [];
    // eslint-disable-next-line no-console
    console.log(TAG, '[dbg] DisplayEvent', {
      viewType,
      mapKeys,
      editorExists: !!this.customEditors?.get(viewType),
    });
    let editor = this.customEditors.get(viewType);
    if (!editor) {
      // eslint-disable-next-line no-console
      console.log(TAG, 'provider not registered yet, waiting', { viewType });
      editor = await waitForCustomEditor(this, viewType, cancellationToken);
      if (!editor) {
        // eslint-disable-next-line no-console
        console.warn(TAG, 'provider still missing after wait, abort', { viewType });
        return;
      }
      // eslint-disable-next-line no-console
      console.log(TAG, 'provider registered after wait', { viewType });
    }
    const state = getState(this);
    const key = `${viewType}::${uri.toString()}`;

    // 已有 pending / 已挂载: 不新建 webview, 但刷新恢复时要再试一次挂载
    if (state.pendingMounts.has(key) || state.mountedMap.has(key)) {
      // eslint-disable-next-line no-console
      console.log(TAG, 'retry existing', { key, mounted: state.mountedMap.has(key) });
      await (this as any).__paperTryMount(key);
      return;
    }

    // 拿 webview (React useEffect 可能已经 create 了, 优先复用)
    let webview = webviewPanelId ? this.webviewService.getWebview(webviewPanelId) : null;
    // eslint-disable-next-line no-console
    console.log(TAG, '[dbg] getWebview', { webviewPanelId, got: !!webview });
    if (!webview) {
      try {
        webview = this.webviewService.createWebview(editor.options.webviewOptions || {});
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(TAG, 'createWebview failed', err);
        return;
      }
      // eslint-disable-next-line no-console
      console.log(TAG, '[dbg] createWebview in patch', { created: !!webview });
    }
    if (!webview) return;

    // eslint-disable-next-line no-console
    console.log(TAG, 'patched onCustomEditorShouldDisplayEvent', { key, webviewId: webview.id });

    // 缓存
    state.pendingMounts.set(key, {
      webview,
      viewType,
      uri,
      openTypeId,
      webviewOptions: editor.options.webviewOptions || {},
      extensionInfo: editor.extensionInfo,
      cancellationToken,
      editorType: editor.type,
      mounted: false,
    });
    (this as any).__paperEnsureRestoreRetry();

    // 注册编辑器事件监听
    if (!state.handlersRegistered) {
      state.handlersRegistered = true;
      // 切到 paper 时挂载, 切走时卸载
      // 同时扫 mountedMap (已挂) + pendingMounts (隐藏/待挂),
      // 否则 paper 切走再切回就找不到 info 了 (sync 看不到 → 永不恢复)
      // 检测激活 tab 走 DOM (workbenchEditorService.currentResource.uri 对 customEditor
      // 返回 undefined, 不可用)
       const sync = () => {
         const activeUri = findActiveTabUri();
         const all = new Map<string, PendingMount>([
           ...state.mountedMap.entries(),
           ...state.pendingMounts.entries(),
         ]);
         for (const [key, info] of Array.from(all.entries())) {
           const infoUri = info.uri.toString();
           const tab = findTabEl(infoUri);
           if (tab) {
             info.tabSeen = true;
             cancelScheduledUnmount(info);
           }
           if (tab && activeUri && urisMatch(activeUri, infoUri)) {
             (this as any).__paperTryMount(key);
           } else if (tab && !activeUri) {
             // 刷新恢复瞬间还没有 current class：只把还没挂上的挂上，不要把已显示的藏掉
             if (!info.mounted) (this as any).__paperTryMount(key);
           } else if (tab && activeUri) {
             (this as any).__paperHide(key);
           } else if (!tab && (info.tabSeen || info.mounted)) {
             (this as any).__paperScheduleUnmount(key);
           }
           // !tab && !tabSeen: 刷新后 DisplayEvent 早于 tab DOM，继续等
         }
       };
       state.syncVisible = sync;
       this.addDispose(this.eventBus.on(EditorGroupChangeEvent, sync));
       this.addDispose(this.eventBus.on(EditorActiveResourceStateChangedEvent, sync));

       // 兜底: 刷新恢复时 tab 晚到；真正关闭 tab 时再卸 webview
       let moTimer: ReturnType<typeof setTimeout> | undefined;
       const observer = new MutationObserver(() => {
         if (moTimer) clearTimeout(moTimer);
         moTimer = setTimeout(() => sync(), 50);
       });
       observer.observe(document.body, { childList: true, subtree: true });
     }

    // 立即尝试挂载
    await (this as any).__paperTryMountAllPending();
  };

  // 尝试挂载所有尚未挂上的 pending（已挂过再藏起来的不要在这里 reshow）
  (MainThreadCustomEditor.prototype as any).__paperTryMountAllPending = async function (this: any) {
    const state = getState(this);
    for (const [key, info] of Array.from(state.pendingMounts.entries())) {
      if (info.mounted) continue;
      await this.__paperTryMount(key);
    }
  };

  (MainThreadCustomEditor.prototype as any).__paperEnsureRestoreRetry = function (this: any) {
    const state = getState(this);
    state.retryUntil = Date.now() + RESTORE_RETRY_MS;
    if (state.retryTimer) return;
    state.retryTimer = setInterval(() => {
      if (Date.now() > (state.retryUntil || 0)) {
        if (state.retryTimer) clearInterval(state.retryTimer);
        state.retryTimer = undefined;
        return;
      }
      if (state.syncVisible) {
        state.syncVisible();
      } else {
        (this as any).__paperTryMountAllPending();
      }
      if (restoreSettled(state)) {
        if (state.retryTimer) clearInterval(state.retryTimer);
        state.retryTimer = undefined;
      }
    }, RESTORE_RETRY_INTERVAL_MS);
  };

  (MainThreadCustomEditor.prototype as any).__paperScheduleUnmount = function (this: any, key: string) {
    const state = getState(this);
    const info = state.mountedMap.get(key) || state.pendingMounts.get(key);
    if (!info || info.unmountTimer) return;
    info.unmountTimer = setTimeout(() => {
      info.unmountTimer = undefined;
      if (!findTabEl(info.uri.toString())) {
        (this as any).__paperUnmount(key);
      }
    }, UNMOUNT_DEBOUNCE_MS);
  };

  // 挂载单个
  (MainThreadCustomEditor.prototype as any).__paperTryMount = async function (this: any, key: string) {
    const state = getState(this);
    const info = state.pendingMounts.get(key) || state.mountedMap.get(key);
    if (!info) return;
    cancelScheduledUnmount(info);
    if (info.mounted) {
      // 已挂载过, 切回时只需恢复显示
      if (info.stableContainer) {
        info.stableContainer.style.display = 'block';
      }
      // 重新计算位置
      if (info.syncPosition) info.syncPosition();
      // 重新挂载 ResizeObserver
      const target = findPaperTabContainer(info.uri.toString());
      if (target && info.resizeObserver) {
        try {
          info.resizeObserver.observe(target.editorBody);
          info.resizeObserver.observe(target.group);
        } catch { /* */ }
      }
      if (target && info.onWindowResize) {
        window.addEventListener('resize', info.onWindowResize);
      }
      // eslint-disable-next-line no-console
      console.log(TAG, '__paperTryMount: reshow', { key });
      state.pendingMounts.delete(key);
      state.mountedMap.set(key, info);
      return;
    }

    const workbenchEditor = document.getElementById('workbench-editor');
    if (!workbenchEditor) {
      // eslint-disable-next-line no-console
      console.log(TAG, 'no workbench-editor, defer', { key });
      return;
    }

    // 找当前激活的 paper tab 容器
    const target = findPaperTabContainer(info.uri.toString());
    if (!target) {
      // eslint-disable-next-line no-console
      console.log(TAG, 'paper tab not found, defer', { key });
      return;
    }
    info.tabSeen = true;
    const activeUri = findActiveTabUri();
    if (activeUri && !urisMatch(activeUri, info.uri.toString())) {
      // eslint-disable-next-line no-console
      console.log(TAG, 'not current tab, defer mount', { key });
      return;
    }
    if (info.mounting) return;
    info.mounting = true;

    // 挂到 workbench-editor 根下的 stable container (React 树外)
    const stableKey = `__paper_mount_${key}`;
    let stableContainer = workbenchEditor.querySelector<HTMLElement>(
      `:scope > div[data-paper-mount-key="${stableKey.replace(/"/g, '\\"')}"]`,
    );
    if (!stableContainer) {
      stableContainer = document.createElement('div');
      stableContainer.setAttribute('data-paper-mount-key', stableKey);
      // 容器盖住整个 workbench-editor（含 tab 栏）；必须 none，否则挡住 tab 切换/关闭。
      // iframe 再开 auto，只在 editorBody 区域接收点击。
      stableContainer.style.cssText = 'position:absolute;pointer-events:none;z-index:2;';
      workbenchEditor.appendChild(stableContainer);
    }

    // iframe 必须相对 #workbench-editor 定位（和 OpenSumi WebviewMounter 同一坐标系）。
    // 容器贴齐 workbench-editor 原点；只把 iframe 对到 tab 栏下方的 editorBody。
    // 若容器也偏移 36px，WebviewMounter 再给 iframe 写一次 top:36px，就会叠成 72px。
    const syncPosition = () => {
      const fresh = findPaperTabContainer(info.uri.toString()) ?? target;
      const bodyRect = fresh.editorBody.getBoundingClientRect();
      const workRect = workbenchEditor.getBoundingClientRect();
      if (!stableContainer) return;
      stableContainer.style.pointerEvents = 'none';
      stableContainer.style.top = '0px';
      stableContainer.style.left = '0px';
      stableContainer.style.width = `${workRect.width}px`;
      stableContainer.style.height = `${workRect.height}px`;

      // 子节点默认仍可命中；全尺寸 wrapper 会继续挡 tab，非 iframe 一律穿透
      Array.from(stableContainer.children).forEach((child) => {
        const el = child as HTMLElement;
        if (el.tagName === 'IFRAME') return;
        el.style.pointerEvents = 'none';
      });

      const iframe = (info.webview.getDomNode?.() ?? stableContainer.querySelector('iframe')) as HTMLElement | null;
      if (iframe) {
        iframe.style.position = 'absolute';
        iframe.style.top = `${Math.max(0, bodyRect.top - workRect.top)}px`;
        iframe.style.left = `${Math.max(0, bodyRect.left - workRect.left)}px`;
        iframe.style.width = `${bodyRect.width}px`;
        iframe.style.height = `${bodyRect.height}px`;
        iframe.style.zIndex = '2';
        // 拖拽 sash 时 OpenSumi 会给 iframe 加 none-pointer-event；不要用内联 auto 盖掉，否则 mouseup 进 iframe，分隔条松不开。
        if (
          !iframe.classList.contains('none-pointer-event') &&
          !document.documentElement.classList.contains('numas-sash-dragging')
        ) {
          iframe.style.pointerEvents = 'auto';
        }
      }
    };
    syncPosition();

    // 监听 editor body + group（header 显隐变化时 body 高度会变）
    const resizeObserver = new ResizeObserver(syncPosition);
    resizeObserver.observe(target.editorBody);
    resizeObserver.observe(target.group);
    const onWindowResize = () => syncPosition();
    window.addEventListener('resize', onWindowResize);

    info.stableContainer = stableContainer;
    info.resizeObserver = resizeObserver;
    info.onWindowResize = onWindowResize;
    info.syncPosition = syncPosition;
    info.mounted = true;

    // 注册 hide event 监听, 关闭 tab 时完全卸载
    const hideDisposable = this.eventBus.on(CustomEditorShouldHideEvent, (e: any) => {
      if (urisMatch(info.uri.toString(), e.payload.uri.toString())) {
        (this as any).__paperUnmount(key);
      }
    });
    info.hideDisposable = hideDisposable;

    // ★ 直接调 webview.appendTo(stableContainer) 挂载
    // eslint-disable-next-line no-console
    console.log(TAG, '__paperTryMount: before appendTo', {
      key,
      webviewId: info.webview.id,
      hasIframe: !!info.webview.iframe,
      iframeParent: info.webview.iframe?.parentElement?.tagName,
      stableContainerChildCount: stableContainer.children.length,
    });
    try {
      info.webview.appendTo(stableContainer);
      syncPosition();
      // WebviewMounter.doMount 用 rAF 写 iframe.top；再跟一帧，避免叠两次 36px。
      requestAnimationFrame(() => syncPosition());
      // eslint-disable-next-line no-console
      console.log(TAG, '__paperTryMount: after appendTo', {
        key,
        webviewId: info.webview.id,
        iframeParent: info.webview.iframe?.parentElement?.tagName,
        iframeParentDataKey: info.webview.iframe?.parentElement?.getAttribute?.('data-paper-mount-key'),
        stableContainerChildCount: stableContainer.children.length,
      });
    } catch (err) {
      info.mounting = false;
      // eslint-disable-next-line no-console
      console.error(TAG, 'appendTo failed', err);
      (this as any).__paperUnmount(key);
      return;
    }

    // pipe + fire resolve
    try {
      // paper (CustomTextEditor) resolve 需要先有 docRef；docx 等二进制 CustomEditor 不要走文本模型
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docModelService: any = (this as any).editorDocumentModelService;
      let docRef: any = null;
      const skipTextModel =
        info.editorType === CustomEditorType.ReadonlyEditor ||
        info.editorType === CustomEditorType.FullEditor;
      if (!skipTextModel && docModelService && info.uri) {
        try {
          docRef = await docModelService.createModelReference(info.uri);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(TAG, 'createModelReference failed (try without docRef)', e);
        }
      }
      if (docRef) {
        info.docRef = docRef;
      }

      this.webview.pipeBrowserHostedWebviewPanel(
        info.webview,
        { uri: info.uri, openTypeId: info.openTypeId },
        info.viewType,
        info.webviewOptions,
        info.extensionInfo,
      );
      let token = info.cancellationToken;
      if (!token || token.isCancellationRequested) {
        token = new CancellationTokenSource().token;
        info.cancellationToken = token;
      }
      this.proxy.$resolveCustomTextEditor(
        info.viewType,
        info.uri.codeUri,
        info.webview.id,
        token,
      );
      // eslint-disable-next-line no-console
      console.log(TAG, 'webview mounted + resolve fired', { key, webviewId: info.webview.id, hasDocRef: !!docRef });
    } catch (err) {
      info.mounting = false;
      // eslint-disable-next-line no-console
      console.error(TAG, 'pipe/resolve failed', err);
      (this as any).__paperUnmount(key);
      return;
    }

    info.mounting = false;
    state.mountedMap.set(key, info);
    state.pendingMounts.delete(key);
  };

  // 隐藏 (切走 tab 时) — 保留 webview/stableContainer, 切回时只需重新显示
  (MainThreadCustomEditor.prototype as any).__paperHide = function (this: any, key: string) {
    const state = getState(this);
    const info = state.mountedMap.get(key) || state.pendingMounts.get(key);
    if (!info) return;
    // eslint-disable-next-line no-console
    console.log(TAG, '__paperHide', { key });

    if (info.resizeObserver) {
      try { info.resizeObserver.disconnect(); } catch { /* */ }
    }
    if (info.onWindowResize) {
      try { window.removeEventListener('resize', info.onWindowResize); } catch (_) { /* */ }
    }
    if (info.stableContainer) {
      info.stableContainer.style.display = 'none';
    }
    // 从 mountedMap 移出, 但 info.webview 保持活着
    state.mountedMap.delete(key);
    // 关键: re-add 到 pendingMounts, 否则 sync 扫不到 → 切回时 __paperTryMount 永不触发
    state.pendingMounts.set(key, info);
  };

  // 彻底卸载 (关闭 tab 时) — 完全清理
  (MainThreadCustomEditor.prototype as any).__paperUnmount = function (this: any, key: string) {
    const state = getState(this);
    const info = state.mountedMap.get(key) || state.pendingMounts.get(key);
    if (!info) return;
    cancelScheduledUnmount(info);
    // eslint-disable-next-line no-console
    console.log(TAG, '__paperUnmount', { key });

    (this as any).__paperHide(key);

    if (info.hideDisposable) {
      try { info.hideDisposable.dispose(); } catch { /* */ }
    }
    if (info.docRef) {
      try { info.docRef.dispose(); } catch { /* */ }
    }
    if (info.webview) {
      try { info.webview.remove(); } catch { /* */ }
      try { info.webview.dispose(); } catch { /* */ }
    }
    if (info.stableContainer && info.stableContainer.parentNode) {
      const toRemove = info.stableContainer;
      setTimeout(() => {
        if (toRemove.parentNode) toRemove.parentNode.removeChild(toRemove);
      }, 100);
    }
    state.mountedMap.delete(key);
    state.pendingMounts.delete(key);
  };

  // eslint-disable-next-line no-console
  console.log(TAG, 'installed, 刷新页面看效果');
}
