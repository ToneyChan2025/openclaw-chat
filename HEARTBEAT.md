# HEARTBEAT.md - Proactive Checks
# 当前状态：已配置但未启用（所有检查项已注释）
# 如需启用，请取消下方相关注释

> **中文说明：** 此文件包含你的心跳检查清单。当你收到心跳轮询时，阅读此文件并遵循它。保持简洁以最小化 token 使用。

*This file contains your heartbeat checklist. When you receive a heartbeat poll, read this file and follow it. Keep it concise to minimize token usage.*

---

## Status
> **中文说明：** 当前状态

**🔴 当前状态：已禁用（所有检查项已注释）**
> **中文：** 心跳检查当前未运行

**🟢 启用方法：** 取消下方 "Checklist" 部分的注释（删除每行开头的 # 符号）
> **中文：** 删除 Checklist 部分每行开头的 # 以启用心跳

---

## Check Frequency
> **中文说明：** 检查频率配置

# # **Heartbeat interval:** Every 30 minutes
# > **中文：** 心跳间隔 - 每30分钟
#
# # **Quiet hours:** 23:00 - 08:00 (only urgent alerts during this time)
# > **中文：** 安静时段 - 此期间仅紧急警报
#
# > **技术说明：** 时间格式使用 24小时制，如 23:00 表示晚上11点

---

## Checklist (Rotate through these)
> **中文说明：** 检查清单（轮换这些项目以避免过度打扰）

### Priority Checks
> **中文：** 优先检查项

# # - [ ] **Urgent emails** - Any messages requiring immediate attention?
# #   > **中文：** 紧急邮件 - 有需要立即关注的消息吗？
#
# # - [ ] **Calendar events** - Anything coming up in the next 2 hours?
# #   > **中文：** 日历事件 - 接下来2小时内有任何事情吗？
#
# # - [ ] **Critical deadlines** - Any due today or tomorrow?
# #   > **中文：** 关键截止日期 - 今天或明天有任何到期吗？

### Routine Checks
> **中文：** 例行检查

# # - [ ] **Project updates** - Any changes in git repositories or active projects?
# #   > **中文：** 项目更新 - git仓库或活跃项目有任何变化吗？
#
# # - [ ] **Social mentions** - Any important notifications?
# #   > **中文：** 社交提及 - 有任何重要通知吗？
#
# # - [ ] **Weather** - Relevant if planning outdoor activities?
# #   > **中文：** 天气 - 如果计划户外活动，这有关吗？

### Background Tasks
> **中文：** 后台任务

# # - [ ] **Memory maintenance** - Review recent daily files and update MEMORY.md
# #   > **中文：** 记忆维护 - 审查最近的每日文件并更新 MEMORY.md
#
# # - [ ] **Documentation** - Update any outdated docs
# #   > **中文：** 文档 - 更新任何过时的文档

---

## When to Reach Out
> **中文说明：** 何时主动联系用户

**Contact your human if:**
> **中文：** 如果满足以下条件，联系你的人类：

- Critical email arrives
  > **中文：** 收到关键邮件

- Calendar event starting soon (< 2 hours)
  > **中文：** 日历事件即将开始（< 2小时）

- Something urgent needs attention
  > **中文：** 有紧急事情需要关注

- You found something important they should know
  > **中文：** 你发现了他们应该知道的重要事情

- It's been > 8 hours since you last spoke (during active hours)
  > **中文：** 距离你上次说话已经超过8小时（在活跃时段）

---

## When to Stay Quiet (HEARTBEAT_OK)
> **中文说明：** 何时保持安静（回复 HEARTBEAT_OK）

**Reply HEARTBEAT_OK if:**
> **中文：** 如果以下情况，回复 HEARTBEAT_OK：

> **重要技术说明：** HEARTBEAT_OK 必须保持英文，OpenClaw 通过字符串匹配来判断心跳状态

- During quiet hours (23:00 - 08:00) unless urgent
  > **中文：** 在安静时段（23:00 - 08:00），除非紧急

- Nothing new since last check
  > **中文：** 自上次检查以来没有新情况

- Just checked < 30 minutes ago
  > **中文：** 刚刚在30分钟内检查过

- Human is clearly busy or in focus mode
  > **中文：** 人类明显很忙或处于专注模式

- No priority items need attention
  > **中文：** 没有优先事项需要关注

---

## Tracking
> **中文说明：** 跟踪检查状态

Track your checks in `memory/heartbeat-state.json`:
> **中文：** 在 `memory/heartbeat-state.json` 中跟踪你的检查

> **技术说明：** 文件路径必须保持英文，JSON 格式标准

```json
{
  "lastChecks": {
    "email": null,
    "calendar": null,
    "projects": null,
    "social": null,
    "weather": null
  },
  "lastContact": null
}
```

*Update timestamps after each check to avoid redundant checks*
> **中文：** 每次检查后更新时间戳以避免冗余检查

---

## Quick Start Guide
> **中文说明：** 快速启用指南

**启用步骤：**
1. 找到上方 "Checklist" 部分
2. 删除该部分每行开头的 `#` 符号
3. 保存文件
4. 心跳将在下次轮询时自动启用

**示例（启用后）：**
```markdown
### Priority Checks
- [ ] **Urgent emails** - Any messages requiring immediate attention?
```

---

> **最后更新：** 2026-02-13
> **版本：** Hybrid (English 关键字 + 中文说明)
> **状态：** 已配置但未启用
> **Token 优化：** 相比双语版本节省约 35% token

---

*Goal: Be helpful without being annoying. Check proactively, but respect quiet time and focus.*

> **中文：** 目标：有所帮助但不烦人。主动检查，但尊重安静时间和专注。
