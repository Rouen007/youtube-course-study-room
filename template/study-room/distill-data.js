/**
 * YouTube Course Study Room - Three-Layer Distillation Data
 * Created by Xiao Ang
 */

window.DISTILL_DATA = {
  courseTitle: "YouTube 课程精读与三层知识蒸馏学习室",
  author: "Course Mentor",
  curatedBy: "Created by Xiao Ang",
  principles: [
    {
      id: "p1",
      title: "因果先于走势",
      text: "任何结果的发生必有前序前提的孕育；不盲目预测未发生的走势，只在明确触发条件满足后执行。"
    },
    {
      id: "p2",
      title: "边界优于预期",
      text: "每次行动必须预先计算好失效边界（Invalidation）；保护本金是生存的第一法则。"
    },
    {
      id: "p3",
      title: "折让区间再介入",
      text: "绝不在情绪极端或追涨杀跌处进场，耐心等待系统回归到折价/溢价优势区间。"
    }
  ],
  chain: [
    { id: "s1", title: "阶段 1 · 环境感知", question: "当前大周期前提是否支持？" },
    { id: "s2", title: "阶段 2 · 触发确认", question: "是否存在明确的结构破位或强信号？" },
    { id: "s3", title: "阶段 3 · 折价介入", question: "是否回归到合理的失衡区间等待？" },
    { id: "s4", title: "阶段 4 · 目标兑现", question: "目标位是否具有高度确定性与风险回报比？" }
  ],
  glossary: [
    {
      term: "Structural Shift (SS)",
      abbr: "SS",
      translation: "结构性破位 / 转变",
      definition: "价格突破并实体收在关键拐点之外，标志着市场微观交付机制的根本转变。"
    },
    {
      term: "Fair Imbalance (FI)",
      abbr: "FI",
      translation: "单向价格失衡",
      definition: "当单边力量极大、三根连续周期内留出未被双向撮合的空白区域时形成的重力回踩目标。"
    },
    {
      term: "Discount & Premium",
      abbr: "EQ",
      translation: "折价区与溢价区",
      definition: "以有效波段的 50% 均衡位为界：买入只在 50% 以下（折价区），卖出只在 50% 以上（溢价区）。"
    }
  ],
  models: [
    {
      id: "model-primary-long",
      name: "标准顺势折价做多模型 (Classic Discount Long)",
      category: "核心执行模型",
      badge: "核心高胜率",
      description: "在确认大周期处于向上交付前提下，等待短周期对前期低点进行洗盘扫损后，产生强位移并回踩折价失衡区入场。",
      coreQuote: "“Wait for the displacement to prove smart money participation, then enter in the discount.”",
      prerequisites: [
        "大周期日线/4小时级别处于多头控制范围",
        "时间处于高活跃度的核心流动性窗口",
        "前期低点已被快速扫穿并被迅猛收回（洗盘完毕）"
      ],
      steps: [
        {
          step: 1,
          title: "确认洗盘猎杀 (Stop Sweep)",
          detail: "价格下探跌破短周期低点，触发散户止损与突破追空单，但随后立即止跌。"
        },
        {
          step: 2,
          title: "观察实体强位移 (Displacement)",
          detail: "大阳线连续拉升，实体完整收在前高之上，形成结构转变并留下失衡窗口。"
        },
        {
          step: 3,
          title: "挂单折价失衡区 (Limit Entry in Discount)",
          detail: "拉取斐波那契寻找 50% 均衡位以下的失衡区顶沿挂单买入，止损置于洗盘低点下方。"
        },
        {
          step: 4,
          title: "对侧流动性兑现 (Target Opposite Liquidity)",
          detail: "第一目标锁定前高点未平仓订单池，分批止盈锁定胜果。"
        }
      ],
      invalidation: [
        "如果价格再次以实体跌破洗盘低点，立即判定模型失效并止损",
        "如果拉升过程中未能产生连续大实体位移，属于弱反弹，放弃挂单"
      ],
      checklist: [
        "是否处于指定交易时段？",
        "大周期偏向是否一致？",
        "是否有清晰的洗盘与位移？",
        "入场挂单是否严格处于 50% 均衡位下方？",
        "是否已在系统中预设硬止损？"
      ]
    }
  ]
};
