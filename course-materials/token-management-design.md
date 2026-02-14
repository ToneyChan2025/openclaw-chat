# OpenClaw Token 管理机制设计方案

> 针对 GLM-5 和 Kimi K2.5 的 Token 超限防护方案
> 记录时间: 2026-02-13

---

## 一、模型 Token 限制调研

### 当前使用模型

| 模型 | 上下文窗口 | 输出 Token 限制 | 备注 |
|------|-----------|----------------|------|
| **GLM-5 (智谱)** | 128K | 8K | 最新旗舰模型 |
| **Kimi K2.5 (月之暗面)** | 256K | 8K | 长上下文优势 |

### Token 计算规则
- **Input Tokens**: 系统提示 + 历史消息 + 当前输入
- **Output Tokens**: 模型生成的回复
- **总限制**: Input + Output ≤ 模型上下文上限

---

## 二、Token 超限防护机制

### 2.1 预防层 - 智能预警

```yaml
# 配置示例: gateway.yaml
token_management:
  enabled: true
  
  # 模型配置
  models:
    glm-5:
      context_limit: 131072      # 128K
      warning_threshold: 0.8      # 80% 预警
      critical_threshold: 0.95    # 95% 强制处理
      
    kimi-k2.5:
      context_limit: 262144      # 256K  
      warning_threshold: 0.85     # 85% 预警（上下文大，可更激进）
      critical_threshold: 0.95    # 95% 强制处理

  # 预警行为
  on_warning:
    action: "notify"              # 通知用户
    message: "⚠️ 当前会话已使用 {usage}% Token，建议执行 /compact"
    
  on_critical:
    action: "auto_compact"        # 自动压缩
    fallback: "request_reset"     # 压缩失败则请求重置
```

### 2.2 处理层 - 自动恢复

| 场景 | 检测时机 | 处理策略 |
|------|---------|---------|
| **预警状态** | 每次请求前检查 | 发送提示，建议用户手动 `/compact` |
| **临界状态** | 每次请求前检查 | 自动执行 `/compact`，然后继续 |
| **超限错误** | 收到 API 错误 | 自动 `/compact` 后重试一次 |
| **压缩失败** | `/compact` 后仍超限 | 提示用户 `/new` 或 `/reset` |

### 2.3 配置层 - 用户自定义

```yaml
# 用户级配置: ~/.openclaw/token-config.yaml
token_management:
  # 个人偏好
  auto_compact: true              # 是否允许自动压缩
  show_warnings: true             # 是否显示预警
  warning_style: "progress_bar"   # 样式: simple/progress_bar/percentage
  
  # 自定义阈值（覆盖全局）
  custom_thresholds:
    glm-5:
      warning: 0.75
      critical: 0.90
```

---

## 三、实现方案

### 方案 A: 网关层实现（推荐）

在 OpenClaw Gateway 中统一处理：

```typescript
// 伪代码示意
class TokenManager {
  async beforeRequest(session: Session, model: Model) {
    const usage = await this.calculateTokenUsage(session);
    const limit = model.contextLimit;
    const ratio = usage / limit;
    
    // 预警
    if (ratio > model.warningThreshold) {
      await this.notifyUser(session, usage, limit);
    }
    
    // 临界处理
    if (ratio > model.criticalThreshold) {
      const compacted = await this.autoCompact(session);
      if (!compacted) {
        throw new TokenLimitError("请使用 /new 开启新会话");
      }
    }
  }
  
  async onError(error: APIError, session: Session) {
    if (error.isTokenLimit()) {
      // 自动压缩并重试
      await this.autoCompact(session);
      return this.retry(session);
    }
  }
}
```

**优点**:
- 统一处理，所有客户端受益
- 可精确计算 Token（调用分词器）
- 支持模型特定的策略

### 方案 B: 客户端实现

在 Agent 侧实现（当前会话中）：

```typescript
// 伪代码示意
class SessionTokenManager {
  private tokenCount: number = 0;
  private lastWarning: number = 0;
  
  async checkBeforeSend(message: string) {
    const model = this.getCurrentModel();
    const estimated = await this.estimateTokens(message);
    const projected = this.tokenCount + estimated;
    
    if (projected > model.limit * 0.95) {
      // 尝试压缩
      const saved = await this.compact();
      if (projected - saved > model.limit * 0.95) {
        return { action: "reject", reason: "token_limit" };
      }
    }
  }
}
```

**优点**:
- 实现简单，无需改网关
- 用户可自定义行为

**缺点**:
- Token 估算可能不准
- 每个 Agent 需单独实现

---

## 四、建议实施步骤

### Phase 1: 快速缓解（本周）
1. 在 AGENTS.md 中添加 Token 管理最佳实践
2. 设置定时提醒，建议用户定期 `/compact`
3. 在 Dashboard 显示当前会话 Token 使用量

### Phase 2: 客户端增强（2周内）
1. 实现 Token 估算和预警提示
2. 添加 `auto_compact` 配置选项
3. 优化 `/compact` 算法，提高压缩率

### Phase 3: 网关层优化（1个月内）
1. 网关集成 Token 管理器
2. 调用官方 Tokenizer 精确计算
3. 支持模型特定的策略配置

---

## 五、相关命令增强

```bash
# 查看详细 Token 使用情况
/status --tokens

# 输出示例:
# 模型: kimi-k2.5
# 上下文限制: 256K tokens
# 当前使用: 180K tokens (70%)
# 预估剩余: 76K tokens
# 建议: 正常使用

# 带压缩提示的状态
/compact --dry-run
# 输出: 压缩后可释放 ~45K tokens (25%)
```

---

## 六、课程价值

### 可讲解的知识点
1. **Token 是什么** - 从字符到 Token 的编码过程
2. **上下文窗口** - 为什么模型有记忆限制
3. **不同模型的差异** - GLM-5 vs Kimi K2.5 的设计取舍
4. **工程实践** - 如何在产品层面优雅处理限制

### 实战练习建议
- 模拟 Token 超限场景，练习使用 `/compact` 和 `/new`
- 对比不同压缩策略的效果
- 设计自己的 Token 预警阈值
