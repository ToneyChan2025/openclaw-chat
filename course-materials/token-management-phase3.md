# Token 管理机制 - Phase 3 实施记录

## 实施日期
2026-02-14

## 实施内容

### ✅ 已完成 - 网关层 Token 管理配置

**1. 更新 compaction 配置**

已添加到 `openclaw.json`：

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 8192,
        "maxHistoryShare": 0.7,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 180000,
          "prompt": "当前会话接近 Token 限制，建议执行 /compact 压缩或 /new 开启新会话。",
          "systemPrompt": "⚠️ Token 预警：当前会话已使用约 90% 容量，建议及时压缩。"
        }
      }
    }
  }
}
```

### 配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `mode` | `safeguard` | 安全模式，自动保护 |
| `reserveTokensFloor` | 8192 | 保留 8K Token 给输出 |
| `maxHistoryShare` | 0.7 | 历史消息最多占 70% |
| `memoryFlush.enabled` | true | 启用内存刷新预警 |
| `softThresholdTokens` | **235000** | **256K 的 ~90% 触发预警** |
| `prompt` | 自定义 | 用户可见的预警提示 |
| `systemPrompt` | 自定义 | 系统级预警提示 |

## 模型上下文窗口配置

| 模型 | 配置值 | 实际限制 | 说明 |
|------|--------|---------|------|
| **Kimi K2.5** | 262,144 | 262,144 (256K) | ✅ 当前驱动模型，compaction 针对此优化 |
| **GLM-5** | 200,000 (默认) | ~128K | 使用 OpenClaw 默认值，无特殊配置 |

> **⚠️ 切换模型注意事项**：
> - 当前 compaction 阈值 235K 针对 Kimi K2.5 (256K) 设置
> - 如切换到 GLM-5 (200K)，235K 阈值会超过其限制
> - **切换前请执行 `/compact` 或手动调整配置**

### 切换模型时的建议操作

```bash
# 1. 切换到 GLM-5 前，先压缩会话
/compact

# 2. 或临时调整阈值（如需）
openclaw config patch --raw '{"agents":{"defaults":{"compaction":{"memoryFlush":{"softThresholdTokens":180000}}}}}'

# 3. 切换回 Kimi K2.5 后恢复
openclaw config patch --raw '{"agents":{"defaults":{"compaction":{"memoryFlush":{"softThresholdTokens":235000}}}}}'
```

### 工作原理

**网关层 Token 管理流程**：

```
用户发送消息
    ↓
网关检查当前会话 Token 使用量
    ↓
如果 ≥ 180K (90%)
    ↓
触发 memoryFlush 预警
    ↓
在回复前插入 systemPrompt 提示
    ↓
继续处理请求
    ↓
如果 ≥ 临界值
    ↓
自动触发 compaction 或提示 /new
```

### 与 Phase 1/2 的关系

| Phase | 层级 | 实现方式 | 作用 |
|-------|------|---------|------|
| Phase 1 | 文档 | AGENTS.md | 教育用户 |
| Phase 2 | 定时任务 | Cron 提醒 | 主动提醒 |
| Phase 3 | 网关层 | compaction 配置 | 自动防护 |

**三层防护**：
1. **预防** (Phase 1): 用户了解最佳实践
2. **提醒** (Phase 2): 定时检查提醒
3. **自动** (Phase 3): 网关自动预警和保护

## 验证方法

**查看当前配置**：
```bash
openclaw config get | grep -A 20 compaction
```

**测试预警**（模拟高 Token 使用）：
1. 持续对话约 20-30 轮
2. 观察是否出现预警提示
3. 检查 `/status` 显示的 Token 使用情况

## 后续优化建议

### 短期（已配置）
- ✅ 网关层 compaction 配置
- ✅ 软阈值预警 (90%)
- ✅ 中文提示信息

### 中期（可选）
- 不同模型差异化阈值
- 用户自定义阈值配置
- 更精细的 Token 计算

### 长期（需要 OpenClaw 核心支持）
- 调用官方 Tokenizer API
- 实时 Token 使用量显示
- 自动压缩策略优化

## 注意事项

1. **当前限制**: OpenClaw 网关使用估算 Token 数，非精确计算
2. **模型差异**: 当前配置基于 200K 上下文，实际模型可能有差异
3. **重启生效**: 配置更改后网关自动重启，约 2-5 秒恢复

## 相关文档

- Phase 1: `course-materials/token-management-phase1.md`
- Phase 2: `course-materials/token-management-phase2.md`
- 完整设计: `course-materials/token-management-design.md`

---

**实施状态**: ✅ Phase 3 基础配置完成
**网关状态**: 已重启并生效
**下一步**: 观察实际使用效果，根据需要微调阈值
