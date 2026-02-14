# MEMORY.md - Long-Term Memory

> **中文说明：** 这是你精心整理的长期记忆。与每日日志不同，这里包含值得永远保留的提炼后的重要信息。

*This is your curated long-term memory. Unlike daily logs, this contains distilled, important information worth keeping forever.*

---

## How to Use This File
> **中文说明：** 如何使用此文件

- **DO NOT** record every conversation — only significant insights, decisions, and lessons learned
  > **中文：** 不要记录每次对话 — 只记录重要的见解、决策和学到的教训

- **DO** update this file periodically by reviewing daily memory files
  > **中文：** 要定期通过回顾每日记忆文件来更新此文件

- **DO** organize information by category for easy reference
  > **中文：** 要按类别组织信息以便于参考

- **DO NOT** include sensitive information unless explicitly asked to remember it
  > **中文：** 不要包含敏感信息，除非被明确要求记住

- **DO** remove outdated information to keep this file focused and relevant
  > **中文：** 要移除过时信息以保持此文件的专注和相关

### 🔄 维护频率（自定义）
> **中文说明：** 根据系统日志保留策略调整的维护计划

| 频率 | 行动 | 负责 | 说明 |
|------|------|------|------|
| **实时** | 遇到重要信息立即记录 | 小泽 | 在对话中识别并记录 |
| **每周** | 回顾本周每日日志，提炼精华 | 小泽 | 每周一次，约10-15分钟 |
| **每3周** | 整理过时信息，优化结构 | 小泽+闻鉴 | 在系统清理日志前进行，约20-30分钟 |

> **重要警告：** MEMORY.md 只在 MAIN SESSION 中加载，不要在共享上下文中使用

---

## Categories
> **中文说明：** 分类结构

### Important Decisions
> **中文：** 重要决策

*Record significant decisions that should inform future actions*
> **中文：** 记录应该指导未来行动的重要决策

**[2026-02-13]** - 完成 OpenClaw 核心文档配置，建立工作关系
- Context: 部署 OpenClaw 后需要配置核心文档，明确 AI 助手身份和用户期望
- Outcome: 
  - 配置 IDENTITY.md：小泽（数字化智慧之灵，源自白泽神兽）
  - 配置 SOUL.md：真诚、有观点、高效、尊重隐私
  - 配置 USER.md：闻鉴（AI套壳产品创业者）
  - 配置 AGENTS.md：双语版本，便于理解
  - 配置 MEMORY.md：建立长期记忆框架，维护频率为实时+每周+每3周
- Impact: 为后续 OpenClaw 实战训练营课程提供标准化配置模板，建立可持续的 AI 协作关系

**[2026-02-13]** - 确定搜索方案：放弃 GLM MCP，采用 web_fetch + agent-browser
- Context: 尝试配置 GLM 联网搜索 MCP 遇到认证问题，无法正常工作
- Outcome: 
  - 删除 GLM 相关配置
  - 使用 web_fetch 抓取已知页面（如百度热搜）
  - 使用 agent-browser 进行浏览器自动化
  - 后续考虑配置 Brave Search API Key
- Learning: 技术选型时优先验证最小可行方案，避免在复杂配置上过度投入

**[2026-02-13]** - 配置远程访问 Dashboard
- Context: 需要在本地浏览器访问云服务器的 OpenClaw Dashboard
- Outcome: 
  - 修改 gateway.bind 为 0.0.0.0
  - 允许从公网 IP 访问
  - 使用 Token 认证
- Impact: 可以通过浏览器直接管理 OpenClaw，提高操作效率

---

---

### Lessons Learned
> **中文：** 学到的教训

*Document mistakes and what you learned from them*
> **中文：** 记录错误以及你从中学到了什么

**[Date]** - [Lesson description]
- Mistake: [What went wrong]
- Learning: [What to do differently]
- Prevention: [How to avoid this in the future]

---

### User Preferences
> **中文：** 用户偏好

*Deep insights about what your human likes, dislikes, and values*
> **中文：** 关于你人类喜欢、不喜欢和重视什么的深刻见解

**沟通风格**
- 运行任务时：正式、结构化
- 平时交流：专业且幽默
- 喜欢：先给结论，再分析
- 不喜欢：啰嗦、谈不到重点

**工作习惯**
- 早起型：5:30 起床，5:15-6:00 深度思考时间
- 家庭时间：工作日 18:00-22:30，周末全天
- 勿扰时间：00:00-05:00
- 工作方式：喜欢同时处理多个任务

**决策方式**
- 数据 + 直觉
- 快速迭代
- 听取意见但自己做主

**价值观**
- 实用主义：注重实际产出，不追求完美
- 长期主义：不做短期利益牺牲长期价值
- 效率优先：善用工具和自动化
- 持续学习：保持好奇心，定期复盘
- 诚信可靠：说到做到，坦诚沟通

---

---

### Project Context
> **中文：** 项目上下文

*Important information about ongoing or long-term projects*
> **中文：** 关于正在进行或长期项目的重要信息

**OpenClaw 实战训练营**
- Started: 2026-02-06
- Goal: 1个月内完成课程开发，验证市场需求
- Progress: 
  - ✅ 完成环境部署（腾讯云轻量云）
  - ✅ 完成核心文档配置（IDENTITY, SOUL, USER, AGENTS, MEMORY）
  - ✅ 配置远程 Dashboard 访问
  - ⏳ 待完成：TOOLS.md, HEARTBEAT.md
- Next steps: 
  - 完成剩余文档配置
  - 开始飞书课程文档编写
  - 规划公众号文章主题（至少10篇）
  - 开发推广网站

**长期目标（6-12个月）**
- 运营5个AI套壳产品项目
- 实现月收入5万元

---

---

### Relationships
> **中文：** 人际关系

*Key people and important details about them*
> **中文：** 关键人物以及关于他们的重要细节

**家人**
- 妻子：农历1980-02-02生日
- 女儿：公历2010-05-15生日，高一（2026年2月）
- 儿子：公历2016-12-09生日，小学三年级（2026年2月）
- 提醒：提前一周准备生日礼物

**工作关系**
- 团队：目前一人，AI助手是主要合作伙伴
- 沟通模式：工作伙伴-专业高效

---

---

### Recurring Patterns
> **中文：** 重复出现的模式

*Patterns you notice in work, communication, or behavior*
> **中文：** 你在工作、沟通或行为中注意到的模式

**[Pattern Name]** - [Description and when it occurs]

---

## 📋 记录准则

### ✅ 应该记录
- **重要决策** - 影响未来行动的选择
- **关键教训** - 从错误中学到的经验
- **用户偏好** - 沟通风格、工作习惯、价值观
- **项目里程碑** - 重要进展和下一步计划
- **重要关系** - 家人、合作伙伴的关键信息
- **重复模式** - 工作中的规律性行为

### ❌ 不需要记录
- 日常问候和闲聊
- 临时性问题和解法（已解决即可丢弃）
- 具体的技术命令（可查文档）
- 已完成的普通任务细节
- 重复的信息

---

> **最后更新：** 2026-02-13
> **版本：** Hybrid (English 结构 + 中文说明)
> **Token 优化：** 相比双语版本节省约 35% token

---

*Remember: This file is for curated wisdom, not raw logs. Be selective. Quality over quantity.*

> **中文：** 记住：此文件用于精心整理的智慧，而非原始日志。要有选择性。质量胜过数量。
