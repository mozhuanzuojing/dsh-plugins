/**
 * dsh-remote-wsl / config —— **全插件唯一一份默认配置**。
 *
 * 为什么单独成文件（2026-10-27 换角度评审第 3 条）：默认值以前散在四处
 * （`index.ts` / `preset.ts` / `search-tool.ts` / `fs-provider.ts`），改一处漏三处；
 * 实锤例子：`fs-provider` 的 `readTextMaxBytes` 因为 `preset.ts` 只转发四个键而**部署不可调**。
 * 现在所有宿主侧模块都从 `normalizeConfig()` 取同一份合并结果，preset 也**原样转发全部键**。
 *
 * 注意：`distro` / `wslHome` / `cwd` 默认留空 = **按机器自动解析**，不写死作者环境：
 * - `distro: ''` → 用 WSL 自己的默认发行版（`wsl -l -v` 里带 `*` 的那个）；
 * - `wslHome: ''` → 用该发行版登录用户的 `$HOME`（探测得到，见 explorer.ts 的 distroHome）；
 * - `cwd: ''` → 同 `wslHome`。
 * 显式填写仍然优先；写错发行版名会明确报错（resolveDistro 不猜、不静默回落）。
 *
 * @module dsh-remote-wsl/config
 */

import { spawnSync } from 'node:child_process';

/** 默认配置（字段含义见 README「配置」与各消费方注释）。 */
export const DEFAULTS = {
  // ── 目标发行版（留空 = 自动解析，见上方说明）─────────────────────────────────
  distro: '',
  wslHome: '',
  cwd: '',

  // ── 远端 agent ──────────────────────────────────────────────────────────────
  provider: 'deepseek-official',
  model: 'deepseek-flash',
  profile: 'sdk',
  /** 空 = 跟随桌面版本（读 primary-runtime/runtime.json 的 desktopVersion）。 */
  dshVersion: '',
  desktopRuntimeJson: '',
  /** 宿主机代理端口（先探测再使用；探测失败不阻断直连）。 */
  proxyPort: 9910,
  /** 是否把 WSL 登录 shell 环境注入**常驻进程**（wsl_agent 守护后端 / wsl_open_ui / in-host）。 */
  useShellEnvironment: true,
  /** 版本漂移时后台预热 WSL 侧该版本（不阻塞当前调用）。 */
  backgroundWarm: true,
  /** 远端 agent 的宿主形态：'daemon'（默认，跨宿主复用）或 'in-host'（逃生舱）。 */
  backend: 'daemon',

  // ── 超时 ────────────────────────────────────────────────────────────────────
  /** 单次工具调用的墙钟上限（毫秒）。 */
  timeoutMs: 600000,
  /** fs provider 单次 RPC 的上限（毫秒）；比工具级超时短，失败要快。 */
  fsTimeoutMs: 60000,
  /** 运行时空闲多久后回收（毫秒）。 */
  idleTimeoutMs: 600000,

  // ── 守护 ────────────────────────────────────────────────────────────────────
  daemonPort: 8731,
  /** 端口回退次数（Windows 命名空间里被别的属主占用时逐个试）。 */
  daemonPortTries: 3,
  /** 守护空闲回收（毫秒）。**到期即回收运行时 ⇒ 上下文丢失**。 */
  daemonIdleMs: 1800000,
  /** 寿命闸门：无 key 且无客户端持续这么久后自退（0=关）。有会话时绝不触发。 */
  daemonLingerMs: 600000,
  /** 同一 key 的并发 prompt 等待位上限（超出明确拒绝；上游 SDK 无 cancel）。 */
  daemonQueueLimit: 4,
  /** Windows 侧握手判据的超时（毫秒）。 */
  daemonHandshakeTimeoutMs: 3000,
  /** 起守护后等"Windows 侧握手确认就绪"的上限（毫秒）。 */
  daemonStartTimeoutMs: 20000,
  /** 并发启动锁最多等多久（毫秒）。 */
  daemonLockWaitMs: 45000,

  // ── 文件世界 ────────────────────────────────────────────────────────────────
  /** readText 的字节上限：宿主 readText 区间 <10MiB，16MiB 覆盖并留余量；更大的走真流式。 */
  readTextMaxBytes: 16 * 1024 * 1024,

  // ── 搜索 / 远程 UI ──────────────────────────────────────────────────────────
  /** 缺 rg/fd 时是否自动安装（装失败会把原因与手动命令带回来，不静默降级）。 */
  searchAutoInstall: true,
  /** `wsl_open_ui` 在 WSL 里起的 web 端口。 */
  webPort: 3082,
};

/**
 * 合并默认值与调用方配置（浅合并；`raw` 非对象时忽略）。
 *
 * `distro` / `wslHome` / `cwd` 留空时在这里就解析成具体值，而不是留一个空串给几十个
 * 消费方（`unc(cfg.distro, …)` / `wsl.exe -d cfg.distro` 都假设它是可用名字）。
 * 解析顺序：显式配置 → WSL 默认发行版（`wsl -l -v` 的 `*`）→ 该发行版的登录用户家目录。
 * 解析不到就**留空**，由调用方给出明确错误（见 explorer.ts:resolveDistro 的 no-distro），
 * 绝不静默猜一个可能不存在的发行版。
 *
 * @param raw 插件行 config / preset 子插件 config
 * @param probe 可选的探测缝（测试注入；默认调用真实 `wsl -l -v`）
 */
export function normalizeConfig(raw, probe) {
  const merged = { ...DEFAULTS, ...(raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) };
  const detected = typeof probe === 'function' ? probe() : readWslDefaults();
  const distro = typeof merged.distro === 'string' ? merged.distro.trim() : '';
  if (!distro) merged.distro = detected.distro;
  if (typeof merged.wslHome !== 'string' || !merged.wslHome.trim()) {
    merged.wslHome = detected.home || '';
  }
  if (typeof merged.cwd !== 'string' || !merged.cwd.trim()) merged.cwd = merged.wslHome;
  return merged;
}

/**
 * 读本机 WSL 的默认发行版与它的登录用户家目录。
 *
 * 失败一律返回空值（不抛）：插件要能在"没有 WSL / WSL 未装任何发行版"的机器上加载，
 * 只是相关工具调用会给出明确错误，而不是把整个 profile 拖垮。
 *
 * @returns `{ distro, home }`，拿不到就是空字符串
 */
function readWslDefaults() {
  const out = { distro: '', home: '' };
  try {
    const list = spawnSync('wsl.exe', ['-l', '-v'], { encoding: 'utf8', windowsHide: true, timeout: 8000 });
    const text = String(list.stdout ?? '');
    if (!text) return out;
    // 表格形如：`  * Ubuntu-24.04    Running         2`（`*` 标记默认发行版）。
    for (const line of text.split(/\r?\n/)) {
      const marked = /^\s*\*\s*(\S.*?)\s{2,}/.exec(line);
      const plain = /^\s{2,}(\S.*?)\s{2,}/.exec(line);
      const match = marked ?? plain;
      if (match) {
        out.distro = match[1].trim();
        break;
      }
    }
    if (!out.distro) return out;
    const home = spawnSync('wsl.exe', ['-d', out.distro, '--exec', 'sh', '-c', 'printf %s "$HOME"'], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 8000,
    });
    const homeText = String(home.stdout ?? '').trim();
    if (home.status === 0 && homeText.startsWith('/')) out.home = homeText;
  } catch {
    /* 没有 WSL 或调不通：留空，调用方会报明确错误 */
  }
  return out;
}
