# YouTube Course Study Room Framework
> **YouTube 视频课程精读、零磁盘占用 1080p 原片抽帧与三层知识蒸馏通用脚手架**  
> *Created by Xiao Ang*

---

## 📖 框架简介 (Introduction)

在 YouTube 上学习顶尖领域的几十小时长视频系列（如算法交易、系统架构、AI 工程、全栈开发、设计体系）时，学习者普遍面临三大痛点：
1. **口语冗长，关键信息稀释**：导师在边操作边讲解中漫谈，重要因果逻辑分散在数十小时中。
2. **板书易逝，低清截图难读**：普通截图分辨率低，普通工具若将全部视频下载到本地动辄几十 GB，极度消耗磁盘。
3. **学完难落地，缺少执行清单**：零散记了一堆名词，但实战时缺乏标准化「状态机」与打勾清单。

**YouTube Course Study Room Framework** 是一套彻底解决上述痛点的通用工程化抽象体系。它包含：
- **Agent 技能规范 (`SKILL.md`)**：赋予 AI 自动化提取字幕、抓取 1080p 关键帧、执行三层知识蒸馏并生成学习室的全流程能力。
- **开箱即用的前端与原生 App 模板 (`template/`)**：零外部依赖（Zero-Dependency）的 Web 端与 5MB 极简 macOS 原生桌面容器。
- **自动化工具链 (`scripts/`)**：流式直取 1080p 切图、字幕分块分段排版、数据包自动化编译与版本打戳。
- **GitHub 红点同步引擎 (`Red-Dot Sync Engine`)**：在本地客户端慢于 GitHub 远程仓库时，实时显示呼吸脉冲红点（`🔴 发现 GitHub 有新内容`），并内置测试开关。

---

## 🌟 核心特性 (Key Features)

### 1. 零磁盘占用 1080p 直流抽帧 (Zero-Disk Keyframing)
- 告别动辄 50GB+ 的本地视频下载。
- 借助 `yt-dlp` 远程视频流定位与 `ffmpeg` 精准时间戳定位，直接将 1080p 无损关键帧解码落盘至 `lesson-assets/`，单张图片仅 200~400KB，解码耗时仅需 1~2 秒。

### 2. 三层知识蒸馏体系 (Three-Layer Knowledge Distillation)
- **第一层 · 导师原声原语 (Voice & Terminology)**：保留导师地道金句、情绪戒律与核心术语定义，绝不用 AI 的泛化腔调稀释导师风格。
- **第二层 · 核心板书与关键帧 (Visual Evidence)**：每一张 1080p 高清切图标注关键参照位，支持点击直达 YouTube 对应播放秒数。
- **第三层 · 主模型与决策规则 (Actionable Models & Playbooks)**：将内容系统化抽象为触发前提、执行步骤、失效边界（Invalidation）和挂单前打勾清单（Checklist）。

### 3. 双端轻量容器架构 (Dual Container Architecture)
- **Web 纯净端**：纯原生 HTML5 / CSS3 / ES Modules，无 Webpack、无 Node 运行时依赖，开箱即用，支持任意静态托管（GitHub Pages、VitePress、本地静态服务）。
- **macOS 原生桌面端 (`native/`)**：基于 Swift Cocoa + WKWebView，体积 < 5MB，自带 CoreGraphics 矢量绘制的 Squircle 质感图标，支持双向 Native Bridge、用户手帐持久化存储与 `--qa` 无头自动化验收。

### 4. GitHub 实时红点比对引擎 (Red-Dot Sync Engine)
- 客户端在启动与运行时，自动请求 GitHub API 比对本地构建时间戳与远程 `main` 分支最新提交。
- 若本地落后，侧边栏、顶部工具栏与进度面板即刻亮起红点（`🔴 发现 GitHub 有新内容`），点击即显示提交差异并一键复制更新命令。
- 提供内置 **`🔴 模拟落后测试开关`**，方便随时验证 UI 响应与回归测试。

---

## 📂 项目结构 (Directory Structure)

```text
youtube-course-study-room/
├── SKILL.md                         # Agent Skill 核心规范说明书
├── README.md                        # 本指南
├── agents/
│   └── openai.yaml                  # Agent UI 元数据配置
├── references/                      # 深度参考架构与方法论
│   ├── methodology.md               # 四步完整学习与交付方法论
│   ├── zero-disk-keyframing.md      # 零磁盘 1080p 抽帧原理与命令
│   ├── architecture.md              # Swift Cocoa + Web 双端架构与红点同步机制
│   └── distillation-guide.md        # 三层知识蒸馏标准与数据定义
└── template/                        # 开箱即用课程学习室脚手架
    ├── scripts/                     # 自动化生产工具链
    │   ├── extract_subs.py          # YouTube 字幕下载与分段排版工具
    │   ├── extract_keyframes.py     # 零磁盘 1080p 关键帧批处理抓取器
    │   └── build_study_room.py      # 数据包打包与版本时间戳编译器
    └── study-room/                  # 学习室应用源码
        ├── index.html               # 交互式学习室主界面
        ├── style.css                # 现代化深色主题、侧边栏与红点脉冲动画
        ├── distill.css              # 三层蒸馏模型专用卡片样式
        ├── app.js                   # 播放器联动、检索、笔记与 GitHub 红点同步
        ├── distill.js               # 蒸馏卡片与交互决策树渲染器
        ├── library-data.js          # 课程目录与关键帧数据源
        ├── distill-data.js          # 导师金句、核心模型与术语数据源
        ├── notebook.json            # 用户复盘手帐与自查错因初始数据
        ├── version.json             # 构建时间戳与 Commit SHA
        ├── version.js               # 浏览器全局版本信息
        ├── lesson-assets/           # 1080p 关键帧图片资产库
        └── native/                  # macOS 原生 App 源码
            ├── App.swift            # Cocoa Swift 原生窗口与 JSBridge
            ├── Icon.swift           # CoreGraphics 矢量图标生成器
            ├── Info.plist           # 桌面 App 属性配置
            └── build.sh             # 一键编译、打包与 --qa 验证脚本
```

---

## 🚀 快速上手 (Quick Start)

### 第一步：准备新课程工程
```bash
# 复制脚手架模板到你的新课程项目目录
cp -r template/study-room ~/Desktop/my-new-course-study-room
cd ~/Desktop/my-new-course-study-room
```

### 第二步：提取字幕与高清关键帧
```bash
# 提取单个视频或整套播放列表的字幕并格式化为 Markdown
python3 /path/to/template/scripts/extract_subs.py \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --out ./transcripts/ep01.md

# 零磁盘占用流式抓取 1080p 核心板书关键帧
python3 /path/to/template/scripts/extract_keyframes.py \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --time "08:45" \
  --out ./lesson-assets/ep01_keyframe_01.png
```

### 第三步：编译数据与打版本戳
```bash
# 自动生成 version.json 与 version.js 并校验数据完整性
python3 /path/to/template/scripts/build_study_room.py --project-dir .
```

### 第四步：编译并运行 macOS 原生桌面 App
```bash
# 自动生成矢量图标、编译 Swift 极简容器并运行自动化 QA 验收
APP_NAME="我的精读学习室" ./native/build.sh ~/Desktop/我的精读学习室.app --qa

# 打开应用体验
open ~/Desktop/我的精读学习室.app
```

---

## 🛠️ 作为 Agent Skill 使用 (Using as an Agent Skill)

本仓库根目录的 `SKILL.md` 符合现代 Agent 规范，已支持自动安装至以下环境：
- `~/.gemini/config/skills/youtube-course-study-room/`
- `~/.agents/skills/youtube-course-study-room/`
- `~/.claude/skills/youtube-course-study-room/`
- `~/.codex/skills/youtube-course-study-room/`

当您在与 AI 对话中输入：
> *“帮我整理 [YouTube 链接/播放列表]，搭建一个专门的学习室 App，抓取关键帧，提炼核心模型，并提交到 GitHub。”*

AI 将自动激活该 Skill，分步执行：
1. 抓取字幕与章节结构；
2. 识别关键逻辑时刻并流式截取 1080p 关键帧；
3. 执行三层知识蒸馏；
4. 编译并打包学习室 Web 与桌面 App；
5. 自动配置 GitHub 远程红点同步并提交推送。

---

## 🏷️ 版权与致谢 (Attribution & License)

- **Framework Author**: Created by Xiao Ang
- **License**: MIT License
- **Philosophy**: 真正的深度学习不是将视频看了一遍又一遍，而是把海量原声提炼为能够指导每一次实战的肌肉记忆与决策准则。
