# opencode 配置持久化设计

> 梳理 opencode(numAS fork)运行时所有「落盘目录 / 配置文件 / 状态数据」的位置、用途与源码定义,
> 以及 numas 容器(`HOME=/home`)下的实际映射与持久化建议.
>
> 参考: 官方配置文档 https://opencode.ai/docs/config/ ; 路径单一事实源为 fork 源码
> `opencode/packages/core/src/global.ts`.

---

## 1. 一句话结论

- opencode 的全局落盘路径**只有一个定义点**:`opencode/packages/core/src/global.ts` 的 `Global.Path`,
  基于 XDG 基目录(`xdg-basedir`)拼 `opencode/` 子目录, 全仓经 `Global.Path.*` 消费, 无散落硬编码.
- 分四类 XDG 目录 + 一个临时目录:

  | 常量 | 默认路径(macOS/Linux) | 存什么 |
  |---|---|---|
  | `Path.data` | `~/.local/share/opencode` | **数据**: SQLite 库、auth 凭证、storage、日志、快照、worktree |
  | `Path.config` | `~/.config/opencode` | **配置**: opencode.json、agents/commands/plugins/skills/themes |
  | `Path.cache` | `~/.cache/opencode` | **缓存**: LSP/rg 二进制(`bin/`)、models.json、远程 skills |
  | `Path.state` | `~/.local/state/opencode` | **易失状态**: daemon 注册、model.json、plugin-meta、文件锁 |
  | `Path.tmp` | `$TMPDIR/opencode` | 临时文件 |

- **项目级**配置在项目根的 `opencode.json` 与 `.opencode/` 目录(agents/commands/plugins/...).
- numas 容器里因 `ENV HOME=/home`, 上述全局目录实际落在 `/home/.local/share/opencode` 等;
  程序本体在 `/home/.numas/`(2026-09 路径统一, 历史 `/root/.numas/` 见 Dockerfile 注释),
  codeblitz(sumi) 的 storage 在 `/home/.codeblitz`.

> 易错点: ① 工具二进制 `bin/` 在 **cache** 下不在 data 下; ② 文件锁 `locks/`、daemon 状态在 **state**
> 下不在 data 下; ③ `~/.opencode/bin/opencode` 是 curl 安装脚本的 binary 位置, 与 XDG 体系无关.

---

## 2. 全局路径常量(单一事实源)

**定义文件: `opencode/packages/core/src/global.ts`**

| 常量 | 源码 | 路径 | 启动时 mkdir |
|---|---|---|---|
| `app` | `global.ts:10` | `"opencode"` (XDG 子目录名) | — |
| `Path.data` | `global.ts:11` `path.join(xdgData, app)` | `~/.local/share/opencode` | ✅ |
| `Path.cache` | `global.ts:12` | `~/.cache/opencode` | (cache 根不建, 但 `bin` 建) |
| `Path.config` | `global.ts:13` | `~/.config/opencode` | ✅ |
| `Path.state` | `global.ts:14` (`xdgState`) | `~/.local/state/opencode` | ✅ |
| `Path.tmp` | `global.ts:15` `path.join(os.tmpdir(), app)` | `$TMPDIR/opencode` | ✅ |
| `Path.bin` | `global.ts:22` `path.join(cache, "bin")` | `~/.cache/opencode/bin` | ✅ |
| `Path.log` | `global.ts:23` `path.join(data, "log")` | `~/.local/share/opencode/log` | ✅ |
| `Path.repos` | `global.ts:24` `path.join(data, "repos")` | `~/.local/share/opencode/repos` | ✅ |
| `Path.home` | `global.ts:18-20` | `process.env.OPENCODE_TEST_HOME ?? os.homedir()` | — |

启动即递归创建(`global.ts:35-43`): `data / config / state / tmp / log / bin / repos`.
`Global.make()`(`global.ts:59-72`)生成 DI 服务, **config 目录可被 `OPENCODE_CONFIG_DIR` 覆盖**(`global.ts:64`).

**XDG 基目录来源**(`xdg-basedir`):
- `xdgData = $XDG_DATA_HOME || ~/.local/share`
- `xdgConfig = $XDG_CONFIG_HOME || ~/.config`
- `xdgState = $XDG_STATE_HOME || ~/.local/state`
- `xdgCache = $XDG_CACHE_HOME || ~/.cache`

**卸载命令认的 4 个根**(`packages/opencode/src/cli/cmd/uninstall.ts:92-95`):
Data=`Path.data`、Cache=`Path.cache`、Config=`Path.config`、State=`Path.state`.

---

## 3. 数据目录 `Path.data` = `~/.local/share/opencode`

| 落盘项 | 源码位置 | 用途 | 范围 |
|---|---|---|---|
| `opencode.db` (SQLite) | `core/src/database/database.ts:53` | **主库**(V2): session/message/part/todo、project、account、credential、permission、event_sequence、session_share、workspace 等表 | 全局 |
| `opencode-<channel>.db` | `database.ts:54` | 非 stable 渠道(如 dev/分支构建)按渠道名分库, 避免污染正式库; `OPENCODE_DISABLE_CHANNEL_DB=1` 强制回 `opencode.db` | 全局 |
| `auth.json` | `opencode/src/auth/index.ts:10` | **所有 provider 凭证**(OAuth token、API key、wellknown token), 权限 `0o600`; 也可由 `OPENCODE_AUTH_CONTENT` 内联替代 | 全局 |
| `mcp-auth.json` | `opencode/src/mcp/auth.ts:37` | MCP server OAuth token / PKCE verifier, `0o600` | 全局 |
| `storage/` | `opencode/src/storage/storage.ts:224` | V1 遗留 + 部分新写的 key→JSON 文件存储(`<key>.json`), 含 `migration` 版本标记、`project/`、`session/<projectID>/`、`message/`、`part/`、`session_diff/` | 全局 |
| `log/opencode.log` | `core/src/observability/logging.ts:49` | 主结构化日志(append); `OPENCODE_PRINT_LOGS=1` 同时打 stderr | 全局 |
| `log/direct/<ts>-<pid>.jsonl` + `latest.json` | `opencode/src/cli/cmd/run/trace.ts:32,36` | `OPENCODE_DIRECT_TRACE=1` 时 dev 事件追踪 | 全局 |
| `log/heap-<pid>-<ts>.heapsnapshot` | `opencode/src/cli/heap.ts:28` | `OPENCODE_AUTO_HEAP_SNAPSHOT` 开启且 RSS 超 2GB 时自动堆快照 | 全局 |
| `plans/` | `opencode/src/session/session.ts:334` | **非 git 项目**的 plan 文件(`<created>-<slug>.md`); git 项目写到项目内 `.opencode/plans/` | 全局(非 git 时) |
| `tool-output/` | `opencode/src/tool/truncation-dir.ts:4` | 超长工具输出截断后落盘; agent 沙箱默认放行读 | 全局 |
| `snapshot/<projectID>/<hash>/` | `opencode/src/snapshot/index.ts:71` | 文件快照的**裸 git 仓库**(`--git-dir`, checkpoint/回滚用) | 全局(按项目分) |
| `worktree/<projectID>/` | `opencode/src/worktree/index.ts:208` | opencode 托管的 git worktree 检出目录 | 全局(按项目分) |
| `repos/<host>/<owner>/<repo>/` | `opencode/src/util/repository.ts:223` | config `references` 的远程 git 仓库裸克隆缓存 | 全局 |

DB 路径覆盖: `OPENCODE_DB`(`database.ts:43-47`)支持 `:memory:` 或绝对路径, 相对路径拼到 `Path.data`.

---

## 4. 配置目录 `Path.config` = `~/.config/opencode`

可被 `OPENCODE_CONFIG_DIR` 覆盖. 首次启动若无任何 config 来源, 自动写一个带 `$schema` 的空 `opencode.jsonc`.

| 落盘项 | 源码位置 | 用途 |
|---|---|---|
| `opencode.jsonc` / `opencode.json` / `config.json` | `opencode/src/config/config.ts:140-148,272-274` | 全局主配置(JSON/JSONC), 优先 jsonc |
| `config`(无扩展名, TOML) | `config.ts:276-290` | 旧版 TOML, 读到后自动转 `config.json` 并删除 |
| `tui.json` / `tui.jsonc` | `opencode/src/config/tui.ts:184` | TUI 外观/键位; 也可用 `OPENCODE_TUI_CONFIG` 指定 |
| `themes/*.json` | `opencode/src/plugin/tui/runtime.ts:259` | 全局 TUI 主题 |
| `agents/**/*.md`(或 `agent/`) | `opencode/src/config/agent.ts:13` | 全局自定义 agent |
| `modes/*.md`(或 `mode/`) | `config/agent.ts:32` | 全局自定义 mode |
| `commands/**/*.md`(或 `command/`) | `opencode/src/config/command.ts:15` | 全局自定义斜杠命令 |
| `plugins/*.{ts,js}`(或 `plugin/`) | `opencode/src/config/plugin.ts:21` | 全局插件(自动发现) |
| `skills/**/SKILL.md`(或 `skill/`) | `opencode/src/skill/index.ts:26` | 全局 skills |
| `tools/*.{ts,js}`(或 `tool/`) | `opencode/src/tool/registry.ts:185` | 全局自定义工具插件 |
| `node_modules/` + `package.json` + `.gitignore` | `config.ts:309-326,452-471` | 每个 config dir 首次自动 `npm install @opencode-ai/plugin` 并写 .gitignore |

> 子目录用**复数**名(`agents/`、`commands/`、`modes/`、`plugins/`、`skills/`、`tools/`、`themes/`),
> 单数名(`agent/` 等)为向后兼容也支持.

---

## 5. 缓存目录 `Path.cache` = `~/.cache/opencode`

| 落盘项 | 源码位置 | 用途 |
|---|---|---|
| `bin/` | `global.ts:22`; 消费 `opencode/src/lsp/server.ts`(gopls/rubocop/zls/clangd/jdtls/lua-ls/texlab 等)、`core/src/ripgrep/binary.ts:97` | 按需下载的 LSP server / ripgrep 二进制及解压中间产物; `which` 查找时把该目录附加到 PATH(`core/src/util/which.ts:7`) |
| `skills/<name>/` | `opencode/src/skill/discovery.ts:35,79-126` | config `skills.urls` 远程 skill 包拉取缓存, 带 `.opencode-version`, 原子换目录 |
| `models.json` / `models-<hash>.json` | `core/src/models-dev.ts:160-164` | `https://models.opencode.ai` 模型目录缓存(5min TTL); `OPENCODE_MODELS_PATH` 可指本地文件 |

---

## 6. 状态目录 `Path.state` = `~/.local/state/opencode`

| 落盘项 | 源码位置 | 用途 |
|---|---|---|
| `server.json` | `cli/src/services/daemon.ts:39` | CLI daemon 模式的 server 注册信息(pid/url/version) |
| `password` | `cli/src/services/daemon.ts:40` | daemon 自动生成的持久连接密码(randomBytes 32), 跨重启复用 |
| `model.json` | 读 `provider/provider.ts:2009`; 写 `cli/cmd/run/variant.shared.ts:19` | 最近使用的模型选择 |
| `plugin-meta.json` | `opencode/src/plugin/meta.ts:49` | 已安装插件元数据; 可被 `OPENCODE_PLUGIN_META_FILE` 覆盖 |
| `locks/` | `core/src/util/flock.ts:17` | 跨进程文件锁(config 补丁、mcp-auth 等) |

---

## 7. 项目级配置

### 7.1 配置文件

- 项目根 `opencode.json` / `opencode.jsonc`(可入 git), 启动时从 cwd 向上找到最近 git 根;
  项目级 TUI 用同目录 `tui.json`.
- **配置合并而非替换**: 多来源按优先级合并, 冲突键后者覆盖前者.

**加载优先级(后者覆盖前者, 来自官方 docs)**:
1. Remote config(`.well-known/opencode`, 组织默认)
2. 全局 `~/.config/opencode/opencode.json`
3. `OPENCODE_CONFIG` 指定文件
4. 项目 `opencode.json`
5. `.opencode/` 目录(agents/commands/plugins)
6. `OPENCODE_CONFIG_CONTENT` 内联
7. 受管配置(macOS `/Library/Application Support/opencode/`、Linux `/etc/opencode/`、Windows `%ProgramData%\opencode`)
8. macOS MDM(`.mobileconfig`, domain `ai.opencode.managed`)— 最高优先级, 不可被用户覆盖

### 7.2 `.opencode/` 目录

配置目录聚合逻辑: `opencode/src/config/paths.ts:23-41`(`ConfigPaths.directories`):
1. `Global.Path.config`(全局)
2. 从 cwd 向上到 worktree 之间所有 `.opencode/`(`paths.ts:27-33`, 受 `OPENCODE_DISABLE_PROJECT_CONFIG` 开关)
3. **家目录下的 `~/.opencode/`** 也会被扫描(`paths.ts:34-38`)
4. `OPENCODE_CONFIG_DIR` 指定目录

```
<worktree>/  (git 项目; 非 git 为 <cwd>)
├── opencode.json / opencode.jsonc     # 项目主配置 (config.ts:440)
└── .opencode/
    ├── opencode.json / opencode.jsonc # .opencode 内也读 (config.ts:438-448)
    ├── tui.json / tui.jsonc
    ├── agents|agent/**/*.md           # agent 定义
    ├── modes|mode/*.md                # mode
    ├── commands|command/**/*.md       # 斜杠命令
    ├── plugins|plugin/*.{ts,js}       # 插件
    ├── skills|skill/**/SKILL.md       # skills
    ├── tools|tool/*.{ts,js}           # 自定义工具
    ├── themes/*.json                  # 项目级 TUI 主题
    ├── plans/*.md                     # git 项目 plan 落点 (session/session.ts:333)
    └── node_modules/ .gitignore       # 插件依赖自动安装
```

**外部生态 skills 也会被扫描**(可用开关禁用):
- `~/.claude/skills/**/SKILL.md` 与项目树 `.claude/`(`skill/index.ts:22,187`)
- `~/.agents/skills/**/SKILL.md` 与项目树 `.agents/`(`skill/index.ts:23,188`)

---

## 8. numas 容器映射(重点)

numas **没有修改 opencode 的任何 XDG/Global 路径常量**(`global.ts`、`flag.ts` 与 upstream 同构).
numas 的路径增量全在容器编排层与新增 CLI 参数, 不改 opencode 数据落点.

容器内三套路径**相互独立**:

```
/home/.numas/                        # ① 程序目录 (Dockerfile, 2026-09 路径统一 /root→/home, 与 HOME 对齐)
├── exec/opencode                     #    opencode binary
├── ui/                               #    --web-ui, sumi(codeblitz) web 静态产物
└── extensions/                       #    --extensions-dir, vsix 扩展市场扫描根

/home/.local/share/opencode/          # ② opencode 运行时数据 (因 ENV HOME=/home)
/home/.config/opencode/               #    config
/home/.cache/opencode/                #    cache
/home/.local/state/opencode/          #    state

/home/.codeblitz/                     # ③ codeblitz(sumi) workbench storage, 与 opencode 无关
```

- **为什么 `HOME=/home`**: 工作区是 `/home/community`(k8s PVC 挂载点), codeblitz 虚拟家目录前缀也是
  `/home`(storage 在 `/home/.codeblitz`). 若 `HOME=/root`, opencode `/path` 返回 home=/root, 前端
  `toHostPath` 把 `/home/*` 映射到 `/root/*` → 工作区被错映、PTY cwd 不存在. 见 `Dockerfile:44-50`.
- `--web-ui` / `--extensions-dir` 只是 server 静态资源 / 扩展市场扫描根
  (`opencode/src/server/shared/ui.ts`、`server/extensions-route.ts`), **不影响** auth/db/storage 落点.
- oh-my-zsh/nvm/node 等交互工具链也装在 `/home` 下(见避坑指南 #22), 与 opencode XDG 同根.

**容器实测**(2026-09, `numas:v0.1.1-explorer`, `HOME=/home`):

```
/home/.local/share/opencode/
  ├── opencode-feat-yunyan.db (-wal/-shm)   # 渠道分库 (分支构建)
  ├── log/  repos/
/home/.config/opencode/
  ├── opencode.jsonc  .gitignore
/home/.cache/opencode/
  ├── bin/  models.json
/home/.local/state/opencode/
  └── locks/
/home/.codeblitz/                            # sumi storage
```

---

## 9. 影响路径的环境变量

**XDG / 家目录(决定全局根)**:

| 变量 | 作用 |
|---|---|
| `XDG_DATA_HOME` / `XDG_CONFIG_HOME` / `XDG_CACHE_HOME` / `XDG_STATE_HOME` | 覆盖对应 XDG 根(默认 `~/.local/share`、`~/.config`、`~/.cache`、`~/.local/state`) |
| `HOME` / `USERPROFILE` | 家目录(numAS 容器显式 `HOME=/home`) |
| `TMPDIR` / `TEMP` / `TMP` | 临时目录根 |
| `OPENCODE_TEST_HOME` | 测试中替换 `Path.home` |
| `OPENCODE_TEST_MANAGED_CONFIG_DIR` | 测试中替换受管配置目录 |

**opencode 配置/数据覆盖**(`opencode/packages/core/src/flag/flag.ts`):

| 变量 | 作用 |
|---|---|
| `OPENCODE_CONFIG` | 显式指定一个全局配置文件路径 |
| `OPENCODE_CONFIG_CONTENT` | 内联配置内容(不落盘) |
| `OPENCODE_CONFIG_DIR` | 覆盖全局配置目录(agents/commands/plugins 搜索根) |
| `OPENCODE_TUI_CONFIG` | 显式 tui 配置文件 |
| `OPENCODE_DISABLE_PROJECT_CONFIG` | 禁用项目级 `.opencode/` 发现 |
| `OPENCODE_DB` | SQLite 路径覆盖(`:memory:` 可用) |
| `OPENCODE_DISABLE_CHANNEL_DB` | 强制用 `opencode.db` 而非分渠道库 |
| `OPENCODE_AUTH_CONTENT` | 内联 auth.json 内容(替代落盘凭证) |
| `OPENCODE_PLUGIN_META_FILE` | 覆盖 `state/plugin-meta.json` |
| `OPENCODE_MODELS_PATH` / `OPENCODE_MODELS_URL` | 本地 models.json / 模型目录 URL |
| `OPENCODE_LOG_LEVEL` / `OPENCODE_PRINT_LOGS` | 日志级别 / 同时打 stderr |
| `OPENCODE_DIRECT_TRACE` / `OPENCODE_AUTO_HEAP_SNAPSHOT` | dev 追踪 / 堆快照落 `log/` |
| `OPENCODE_SERVER_USERNAME` / `OPENCODE_SERVER_PASSWORD` | server 基础认证(不落盘) |
| `OPENCODE_WORKSPACE_ID` / `OPENCODE_PERMISSION` / `OPENCODE_CLIENT` / `OPENCODE_PURE` | workspace / 权限模式 / 客户端类型 / 纯模式 |

**numas 侧**(决定 `/home/.numas/` 资源, 不影响 opencode XDG 数据):
`NUMAS_WEB_UI`/`WEB_UI`、`NUMAS_EXTENSIONS_DIR`/`EXTENSIONS_DIR`、`NUMAS_PORT`/`PORT`、
构建期 `NUMAS_WEB_DIST`、`NUMAS_TARGET`(见 `scripts/entrypoint.sh`、`Dockerfile`).

---

## 10. 持久化 / 备份建议(容器场景)

容器 `--rm` 重启后, **容器层写入全部丢失**, 只有挂载 volume / bind mount 的路径保留.

| 数据 | 容器路径 | 持久化必要性 | 建议 |
|---|---|---|---|
| 工作区(用户代码) | `/home/community` | **必须** | `-v <宿主目录>:/home/community`(numas 标准挂载) |
| opencode 会话/凭证/DB | `/home/.local/share/opencode` | 高(登录态、历史会话) | 多 workspace 共享登录态可挂独立 volume 到 `/home/.local/share/opencode` |
| opencode 全局配置 | `/home/.config/opencode` | 中(自定义 agent/command/plugin) | 需要跨容器保留自定义配置时挂载 |
| codeblitz workbench storage | `/home/.codeblitz` | 中(UI 布局/最近打开) | 保留工作台偏好时挂载 |
| 缓存(LSP 二进制/models) | `/home/.cache/opencode` | 低(可重新下载) | 一般不挂, 丢了自动重建 |
| 易失状态 | `/home/.local/state/opencode` | 低 | 不挂 |
| 程序本体 | `/home/.numas` | 不需要(镜像内置) | 升级用新镜像或 `-v` 覆盖单目录 |

> 注意: opencode 数据按 `HOME` 落. numas 容器 `HOME=/home`, 所以数据在 `/home/.local/...`;
> 若运维改了 HOME 或挂了别的 XDG_* 变量, 数据根会随之变化, 备份前先 `docker exec <c> ls -d ~/.local/share/opencode`.

---

## 11. 验证方法

```bash
C=<容器名或ID>
# ① 全局数据根 (随 HOME)
docker exec $C sh -lc 'echo HOME=$HOME; ls -d ~/.local/share/opencode ~/.config/opencode ~/.cache/opencode ~/.local/state/opencode'
# ② 主库 / 凭证
docker exec $C ls -la ~/.local/share/opencode/ | grep -E "opencode.*db|auth.json|storage|log"
# ③ 全局配置
docker exec $C ls -la ~/.config/opencode/
# ④ 程序目录 (独立, /home/.numas, 2026-09 路径统一后)
docker exec $C ls /home/.numas
# ⑤ codeblitz storage (sumi)
docker exec $C ls -d ~/.codeblitz
# ⑥ 解析后的最终配置 (含受管/合并结果)
docker exec $C /home/.numas/exec/opencode debug config
```

判定:
- 数据目录四类齐全(data/config/cache/state)且在 `$HOME` 下 → 路径正常.
- `auth.json` 存在且权限 `-rw-------`(0600)→ 凭证落盘正常.
- `opencode.db`(或 `opencode-<channel>.db`)存在 → 会话存储正常.
- 换 workspace(`?directory=`)后会话/登录态是否保留, 取决于 data 目录是否跨 workspace 共享挂载.
