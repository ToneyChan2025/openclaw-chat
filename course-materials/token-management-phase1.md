# Token 管理机制 - Phase 1 实施记录

## 实施日期
2026-02-14

## 实施内容

### ✅ 已完成

1. **AGENTS.md 补充 Token 管理最佳实践**
   - 添加模型 Token 限制速查表
   - 列出 Token 超限的典型症状
   - 提供 5 个预防技巧
   - 说明 Token 计算规则
   - 紧急情况处理指南

### 📋 实施细节

**新增章节位置**: AGENTS.md 末尾（"Make It Yours"之前）

**包含内容**:
- 模型对比表（GLM-5 vs Kimi K2.5）
- 5个实用技巧（/compact、/new、/status、优化输入、文件管理）
- Token 计算规则说明
- 不同场景的建议操作
- 紧急情况处理流程

## 下一步（Phase 2）

1. 客户端 Token 估算和预警提示
2. 添加 `auto_compact` 配置选项
3. 优化 `/compact` 算法

## 备注

Phase 1 是文档和最佳实践层面，不涉及代码改动。
用户可以通过阅读 AGENTS.md 了解如何管理 Token。
