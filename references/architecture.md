# Architecture & Design Reference
*YouTube Course Study Room Framework*
*Created by Xiao Ang*

---

## 1. Architecture Overview

YouTube Course Study Room 采用**「零依赖轻量三层架构」**（Zero-Dependency Lightweight Tri-Tier Architecture）：

```
┌────────────────────────────────────────────────────────────────────────┐
│                   YouTube Course Study Room System                     │
├────────────────────────────────┬───────────────────────────────────────┤
│    Native macOS App Layer      │        Web & Browser Layer            │
│  (Swift Cocoa + WKWebView)     │   (Vanilla HTML5 / CSS3 / ES Modules)  │
│  • WKScriptMessageHandler      │   • Responsive Grid Layout            │
│  • Native Clipboard Bridge     │   • Split-view (Player / Notes)       │
│  • Local Storage Persistence   │   • Keyframe Lightbox Viewer          │
│  • Automated --qa test runner  │   • Live YouTube Player Sync          │
├────────────────────────────────┴───────────────────────────────────────┤
│                     Data & Distillation Engine                         │
│  • library-data.js (Episodes metadata, video IDs, timestamps, assets) │
│  • distill-data.js (Three-tier distilled knowledge models)             │
│  • version.js / version.json (Build hash, release timestamp)          │
│  • notebook.json (User learning journal, tags, trade/study reviews)    │
├────────────────────────────────────────────────────────────────────────┤
│                       Live Sync & Red-Dot Engine                       │
│  • GitHub API / Raw Content Commit Diff Engine                         │
│  • Timezone-agnostic UTC Date Comparison                               │
│  • Real-time Pulsing Red Dot Indicators (🔴 发现 GitHub 有新内容)      │
│  • QA Interactive Simulation Switch (🔴 模拟落后测试开关)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Web Frontend Architecture

### 2.1 零外部依赖哲学 (Zero External Dependencies)
- 纯 HTML5 标准语义标签 (`<header>`, `<nav>`, `<aside>`, `<main>`, `<article>`)
- 现代化 CSS3 变量设计系统 (`--bg-primary`, `--accent-color`, `--card-bg`, 等)
- 原生原生 JavaScript (ES6+)，无 Webpack、无 Vite、无 React/Vue 打包门槛
- 直接支持 `file://` 协议、本地 `python3 -m http.server`、或托管至 GitHub Pages / VitePress / Docusaurus。

### 2.2 核心模块划分
1. **`index.html`**:
   - 导航侧边栏（课程目录、学习进度、GitHub 状态、红点提示）
   - 顶部工具栏（模式切换、搜索、快捷操作、模拟落后开关）
   - 视频/图解交互区（内嵌 YouTube 播放器 / 高清板书切图幻灯片）
   - 交互式复盘手帐与导师速查卡片
2. **`style.css`**:
   - 专业深色/浅色自适应主题
   - 响应式侧边栏与弹性折叠面板
   - 脉冲红点动画 (`@keyframes pulse-red`)
3. **`distill.css`**:
   - 导师原声、核心板书、可复现模型专用排版卡片
4. **`app.js`**:
   - 课程加载、搜索与高亮
   - YouTube 播放器时间戳自动跳转 (`?t=XXs`)
   - 本地手帐笔记增删改查 (`localStorage` 与本地文件桥接)
   - GitHub 版本落后红点检测逻辑 (`checkGitHubSync()`)
5. **`distill.js`**:
   - 蒸馏模型的分类检索、卡片折叠、公式与决策树交互

---

## 3. macOS Native Container Architecture

### 3.1 核心组件 (`native/App.swift`)
使用 macOS 原生 `Cocoa` 与 `WebKit` 框架，在不引入 Electron（动辄 200MB+ 内存占用）的前提下，实现极小体积（< 5MB）且原生流畅的独立桌面应用。

- **`NSApplication` & `NSWindow`**:
  - 沉浸式标题栏 (`NSWindow.StyleMask.titled`, `.closable`, `.miniaturizable`, `.resizable`, `.fullSizeContentView`)
  - 自动记忆窗口尺寸与位置
- **`WKWebView` & `WKWebViewConfiguration`**:
  - 启用本地文件与脚本交互支持
  - 注入原生 JS Bridge：`window.webkit.messageHandlers.nativeBridge.postMessage(...)`
- **Native Bridge 协议处理**:
  - `copyText`: 原生剪贴板复制，返回系统级触觉提示
  - `reloadPage`: 强制刷新当前内容
  - `saveNotebook`: 写入用户手帐至 macOS 专用数据目录 `~/Library/Application Support/<AppId>/notebook.json`
  - `openExternalURL`: 安全调用系统默认浏览器打开外部链接
- **Automated QA Runner (`--qa`)**:
  - 支持命令行参数 `--qa` 启动
  - 自动遍历课程列表、检查静态资源加载状态、验证 Red-Dot 逻辑并生成测试退出码 (exit 0)

### 3.2 动态图标生成 (`native/Icon.swift`)
- 无需外部 Photoshop/Sketch 工具，纯 CoreGraphics 矢量绘制高质感 macOS `.icns` 学习室应用图标。

---

## 4. GitHub Red-Dot Sync Engine

为解决「本地客户端无法感知远程仓库更新」的问题，架构内嵌轻量比对引擎：

```javascript
async function checkGitHubSync(owner, repo, branch = 'main') {
  try {
    // 1. 获取本地版本时间戳 (来自 version.json)
    const localRes = await fetch('./version.json');
    const localData = await localRes.json();
    const localTime = new Date(localData.updatedAt).getTime();

    // 2. 请求 GitHub API / Raw Commit 数据
    const remoteRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${branch}`);
    if (!remoteRes.ok) return;
    const remoteData = await remoteRes.json();
    const remoteTime = new Date(remoteData.commit.committer.date).getTime();

    // 3. 比较时间戳 (设定 5 秒阈值缓冲)
    const isBehind = remoteTime > (localTime + 5000);
    renderSyncStatus(isBehind, remoteData.sha.substring(0, 7));
  } catch (err) {
    console.warn("GitHub sync check skipped:", err);
  }
}
```

- **视觉提示**:
  - 侧边栏与标题栏展示红点指示器：`🔴 发现 GitHub 有新内容`
  - 点击可一键拉取或前往 Release / Commit 查看详情
- **测试开关**:
  - 内置测试开关，点击即可即时切换 `isBehind` 状态，验证 UI 响应与红点显隐。

---

*Created by Xiao Ang*
