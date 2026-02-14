# OpenClaw + Claude Code 实战课程 - Day 1

## 课程目标
掌握 OpenClaw 调用 Claude Code 进行全自动开发的核心技能

---

## 今日实操内容

### 1. Claude Code 环境配置

#### 1.1 安装与配置
```bash
# 安装 Claude Code（lighthouse 用户）
curl -fsSL https://claude.ai/install.sh | bash

# 配置 GLM-5 模型
export ANTHROPIC_AUTH_TOKEN='your-api-key'
export ANTHROPIC_BASE_URL='https://open.bigmodel.cn/api/anthropic'
export ANTHROPIC_MODEL='glm-5'
```

#### 1.2 关键配置项
- **用户**: lighthouse（普通用户，非 root）
- **权限模式**: bypassPermissions（全自动，无需确认）
- **模型**: GLM-5（通过 BigModel API）

---

### 2. 核心模式：直接 Exec 调用

#### 2.1 为什么不用 Skill？
- Skill 封装增加复杂度
- 直接调用更可靠、可控
- 减少中间层错误

#### 2.2 标准调用流程
```bash
# 1. 创建项目目录
mkdir -p /home/lighthouse/projects/项目名
chown lighthouse:lighthouse /home/lighthouse/projects/项目名

# 2. 调用 Claude Code 开发
su - lighthouse -c "
  export PATH=\"\$HOME/.local/share/fnm:\$PATH\"
  eval \"\$(fnm env)\"
  cd /home/lighthouse/projects/项目名
  echo '开发任务描述' | claude -p
"

# 3. 初始化 Git 并推送
cd /home/lighthouse/projects/项目名
git init
git add .
git commit -m 'Initial commit'
git remote add origin git@github.com:用户名/项目名.git
git push -u origin main
```

#### 2.3 成功案例

**案例 1：计算器工具**
- 任务：开发命令行计算器
- 结果：成功生成 calc.js，支持加减乘除
- 仓库：https://github.com/ToneyChan2025/calc-tool

**案例 2：待办事项工具**
- 任务：开发 Todo CLI 工具
- 结果：成功生成完整项目，支持增删改查
- 功能：todo add/list/done/delete/help

---

### 3. 高级功能：Hooks 配置

#### 3.1 什么是 Hooks？
Claude Code 生命周期中的自动执行点：
- `TaskCompleted` - 任务完成时
- `SessionEnd` - 会话结束时
- `PreToolUse` - 工具使用前

#### 3.2 TaskCompleted Hook 配置

**settings.json**:
```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "/home/lighthouse/.claude/hooks/task-complete.sh"
          }
        ]
      }
    ]
  }
}
```

**Hook 脚本**（task-complete.sh）:
```bash
#!/bin/bash
# 1. 保存任务输出
cat > "$PROJECT_DIR/.claude/task-output.txt"

# 2. 更新状态
jq -n '{status: "completed", timestamp: now}' > "$PROJECT_DIR/.claude/latest.json"

# 3. 自动推送到 GitHub
git add . && git commit -m "Auto commit" && git push

# 4. 发送通知
echo "任务完成！" > /tmp/claude-notify.txt
```

#### 3.3 Hooks 的优势
- **Token 优化**: 零轮询，任务完成后才触发
- **异步通知**: 自动发送完成通知
- **结果追溯**: 自动保存日志和状态

---

### 4. 个人日记系统

#### 4.1 功能设计
- 触发关键词："个人日记"、"写日记"、"记录"
- 自动创建每日日记文件
- 固定格式：信息栏 + 标题 + 摘要 + 内容 + 感想

#### 4.2 日记格式标准
```markdown
# 日记 - 2026-02-14

## 📋 日记信息
- **日期**: 2026-02-14 星期六
- **天气**: 广州 多云 22°C
- **地点**: 广州

## 📝 标题
（根据内容生成）

## 📄 摘要
（根据内容生成，100字内）

## 🖊️ 日记内容

### 上午

### 下午

### 晚上

## 💭 感想与反思

---
*最后更新: 22:05*
```

---

### 5. 最佳实践总结

#### 5.1 开发流程
1. 用户发送指令（任意聊天软件）
2. OpenClaw 创建项目目录
3. Claude Code 后台独立运行开发
4. Hook 触发：保存日志、推送 GitHub、发送通知
5. 用户收到完成通知

#### 5.2 关键要点
- **用户权限**: 使用普通用户（lighthouse），非 root
- **模型配置**: 通过环境变量灵活切换
- **等待时间**: 复杂任务 2-5 分钟
- **错误处理**: 直接 exec 比 Skill 更可靠

#### 5.3 注意事项
- Claude Code 需要登录状态（API Key 配置）
- Hooks 配置不支持 `${VAR}` 语法
- 项目目录需要正确权限（chown lighthouse）

---

### 6. 后续进阶方向

#### 6.1 Agent Teams（实验性功能）
- 多 Claude 实例协同工作
- 适合：代码审查、多模块并行开发
- 启用：`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

#### 6.2 更多 Hooks
- `PreToolUse` - 拦截危险命令
- `SessionEnd` - 会话结束处理
- `PermissionRequest` - 权限请求处理

#### 6.3 自动化增强
- 定时任务（cron）自动开发
- 多平台通知（QQ、微信、Telegram）
- 自动部署到服务器

---

## 今日成果

| 项目 | 状态 | 仓库 |
|------|------|------|
| 计算器工具 | ✅ 完成 | ToneyChan2025/calc-tool |
| 待办事项工具 | ✅ 完成 | ToneyChan2025/todo-cli（待推送） |
| Claude Code 配置 | ✅ 完成 | - |
| Hooks 配置 | ✅ 完成 | - |
| 个人日记系统 | ✅ 完成 | - |

---

## 课程文件位置

```
/root/.openclaw/workspace/course-materials/
├── day1-claude-code-setup.md      # 本文件
├── examples/
│   ├── calc-tool/                 # 计算器示例
│   └── todo-cli/                  # 待办事项示例
└── skills/
    ├── claude-code-auto/          # Skill 模板
    └── personal-diary/            # 日记系统
```

---

*课程日期: 2026-02-14*
*讲师: OpenClaw + Claude Code (GLM-5)*
