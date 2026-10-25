/**
 * YouTube Course Study Room - Course Library Data
 * Created by Xiao Ang
 */

window.COURSE_LIBRARY = {
  schema: "youtube-course-study-room",
  courseTitle: "YouTube 课程精读与三层知识蒸馏学习室",
  courseSubtitle: "Zero-Disk 1080p 原片图解 · 导师原声原语 · 可复现决策模型",
  author: "Course Mentor / Creator",
  curatedBy: "Created by Xiao Ang",
  repo: "Rouen007/youtube-course-study-room",
  modules: [
    "Module 1 · 核心认知与理论基石",
    "Module 2 · 深度解析与实操推演",
    "Module 3 · 高级模型与综合闭环"
  ],
  lessons: [
    {
      id: "ep01",
      ep: 1,
      date: "Ep.01",
      title: "Ep.01｜课程导论：核心原则与底层认知框架",
      titleEn: "Introduction & Core Principles",
      module: "Module 1 · 核心认知与理论基石",
      duration: "24:15",
      videoId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      topics: ["导论", "底层逻辑", "三层认知", "纪律准则"],
      keyframes: [
        {
          src: "lesson-assets/sample_keyframe_01.png",
          time: "04:30",
          title: "核心认知模型推演",
          caption: "【04:30 关键帧】展示从原始概念到结构化决策路径的演进逻辑。"
        },
        {
          src: "lesson-assets/sample_keyframe_02.png",
          time: "12:15",
          title: "执行前提与失效边界",
          caption: "【12:15 关键帧】强调边界条件与风控触发点，注意观察左侧关键参照物。"
        }
      ],
      handbook: `
### 1. 导师核心原声与心法
> "If you do not master the foundational mechanics, complex execution is mere gambling."

导师在开篇着重指出：大多数学习者之所以学完无法落地，是因为只记住了表面现象，而忽视了底层的因果逻辑。

### 2. 核心架构与板书提炼
- **前提过滤**：确认环境是否处于有效周期窗口内。
- **信号触发**：等待系统出现明确的结构性失衡或确认信号。
- **执行执行**：严格按照预设风险收益比（R:R ≥ 2:1）挂单。

### 3. 复盘要领与实操打勾单
- [ ] 是否在规定时间窗口内？
- [ ] 关键对照位是否已经确认？
- [ ] 失效条件是否已明确写在计划中？
      `,
      distillSummary: "本集建立了全套课程的语言体系与基本假设，重点在于戒除急躁心态与建立客观事实对照机制。"
    },
    {
      id: "ep02",
      ep: 2,
      date: "Ep.02",
      title: "Ep.02｜主模型推演：识别结构失衡与关键触发位",
      titleEn: "Structural Imbalance & Trigger Setup",
      module: "Module 1 · 核心认知与理论基石",
      duration: "31:40",
      videoId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      topics: ["结构失衡", "触发确认", "执行入场", "边界管理"],
      keyframes: [
        {
          src: "lesson-assets/sample_keyframe_01.png",
          time: "08:20",
          title: "位移发生与失衡区间确认",
          caption: "【08:20 关键帧】实体迅速推离平衡区，留下清晰的单向失衡窗口。"
        }
      ],
      handbook: `
### 1. 导师原声
> "Wait for price to confirm the displacement before you commit your risk."

### 2. 关键决策机制
1. **扫清对侧**：确认前序高低点已被彻底探查。
2. **强势位移**：产生连续大实体推进。
3. **回踩入场**：在折价/折让区间介入，绝不追价。
      `,
      distillSummary: "确立了第一套主入场模型的四个阶段：诱多/诱空、强位移、回踩测试、对侧兑现。"
    }
  ]
};
