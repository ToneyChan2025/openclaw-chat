#!/bin/bash
# OpenClaw 定时任务设置示例
# 使用场景：设置一次性或周期性提醒

# 示例 1：5分钟后提醒喝水
openclaw cron add \
  --name "提醒喝水" \
  --at "5m" \
  --session isolated \
  --message "💧 该喝水啦！" \
  --deliver \
  --channel qqbot \
  --to "YOUR_OPENID" \
  --delete-after-run

# 示例 2：设置具体时间的提醒
openclaw cron add \
  --name "下班提醒" \
  --at "2026-02-13T17:25:00+08:00" \
  --session isolated \
  --message "⏰ 该下班啦！" \
  --deliver \
  --channel qqbot \
  --to "YOUR_OPENID" \
  --delete-after-run

# 示例 3：每天早上8点重复提醒
openclaw cron add \
  --name "早安提醒" \
  --cron "0 8 * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "🌅 早上好！" \
  --deliver \
  --channel qqbot \
  --to "YOUR_OPENID"

# 查看所有定时任务
openclaw cron list

# 删除定时任务
openclaw cron remove --id "任务ID"
