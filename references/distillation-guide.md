# Knowledge Distillation Guide
*YouTube Course Study Room Framework*
*Created by Xiao Ang*

---

## 1. 为什么需要「三层知识蒸馏」？

YouTube 上的顶级长视频教程（通常几十到几百小时）普遍存在以下痛点：
1. **口语冗长**：导师往往边演示边漫谈，关键决策信息分散在数十秒的闲聊之间。
2. **板书易逝**：核心论据在屏幕上一闪而过，普通截图模糊不清或缺少上下文。
3. **学完难落地**：学生看完几十集，脑中充满零散概念，却无法整理成一套「可执行、可复现」的决策清单。

为了彻底解决这一问题，本框架定义了**「三层知识蒸馏标准」**（Three-Layer Distillation Standard）。

---

## 2. 三层蒸馏结构标准

```
┌─────────────────────────────────────────────────────────────────┐
│                     第一层：导师原声原语                        │
│   • 导师原句金句（保留英文原声/口吻）                           │
│   • 核心词汇定义（Glossary / Vocabulary）                       │
│   • 导师心态戒律（Mentorship Rules & Warnings）                 │
├─────────────────────────────────────────────────────────────────┤
│                     第二层：核心板书与关键帧                    │
│   • 1080p 无损画质关键切图（带时间戳 [MM:SS]）                 │
│   • 盘面/代码/架构走势标注（箭头、高亮、关键区域）             │
│   • 演进过程对照（Before vs. After 对比）                       │
├─────────────────────────────────────────────────────────────────┤
│                     第三层：主模型与决策规则                    │
│   • 触发前提条件（Pre-conditions）                             │
│   • 核心执行步骤（Execution Workflow）                         │
│   • 失效与止损标准（Invalidation / Risk Criteria）              │
│   • 终局执行清单（Checklist / Playbook）                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 分层蒸馏实施细则

### 3.1 第一层：导师原声原语 (Verbatim Voice & Mental Models)
- **收集准则**：不要用 AI 的笼统口吻代替导师的标志性表述。必须摘录导师的原话。
- **示例**：
  - *“If you can't see the draw on liquidity, close the chart and walk away.”*
  - 核心定义：`Draw on Liquidity (DOL)` = 算法交付价格寻找未平仓订单池的最主要引力目标。
- **价值**：保留导师真实的思维语境，避免失真。

### 3.2 第二层：核心板书与关键帧 (Visual Evidence & Keyframes)
- **提取准则**：
  - 杜绝低清 360p/720p 糊图，统一利用 `extract_keyframes.py` 无损直取 1080p 视频流。
  - 每张图片必须关联精准的时间戳（例如 `08:45`），点击后可直达视频相应秒数。
  - 图片下方必须配有「读图要领」：解释左边是什么、右边发生什么、为什么在这里做出判断。
- **价值**：构建视觉肌肉记忆。

### 3.3 第三层：主模型与决策规则 (Actionable Model & Playbook)
- **整理准则**：将视频中的演示，提炼为程序员级别的**状态机 / 算法逻辑**：
  1. **环境准备 (Setup)**：什么时段？什么大周期前提？
  2. **信号触发 (Trigger)**：破位？吞没？突破？
  3. **入场执行 (Entry)**：点位、区间、挂单还是市价？
  4. **失效边界 (Invalidation)**：如果价格/系统发生什么行为，立即宣布模型作废？
- **价值**：学习者在实战中只需对照清单打勾，无需二次翻查视频。

---

## 4. 蒸馏数据结构规范 (`distill-data.js`)

在本项目模板中，蒸馏结果编译为结构化数据供 Web / macOS 原生 App 动态加载：

```javascript
window.DISTILL_DATA = {
  courseTitle: "课程全称",
  author: "导师姓名 / 频道名",
  curatedBy: "Created by Xiao Ang",
  models: [
    {
      id: "model-01",
      name: "模型名称（例如：AMDX / 经典做多框架）",
      category: "分类（例如：趋势交易 / 架构设计 / 状态管理）",
      badge: "核心模型",
      description: "一句话阐述该模型的本质目标与解决的问题。",
      coreQuote: "“导师针对该模型的最经典原声金句。”",
      prerequisites: [
        "前提条件 1：例如大级别处于折价区",
        "前提条件 2：特定时间窗口（如 08:30 - 11:00）"
      ],
      steps: [
        {
          step: 1,
          title: "步骤标题",
          detail: "详细操作逻辑",
          keyframeUrl: "lesson-assets/ep01_keyframe_01.png",
          timestamp: "09:30"
        }
      ],
      invalidation: [
        "如果实体跌破 XX 位置，判定模型失效"
      ],
      checklist: [
        "确认条件 A 是否满足",
        "确认条件 B 是否满足",
        "入场挂单是否设置好对应止损"
      ]
    }
  ]
};
```

---

*Created by Xiao Ang*
