# OpenClaw Chat - 架构设计文档

## 项目概述
自用聊天软件，对接云服务器上的 OpenClaw，支持实时聊天和文件传输。

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Windows 客户端                          │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │   Tauri App     │         │    WebSocket Client     │   │
│  │  (React + TS)   │◄───────►│    (Rust + tauri)       │   │
│  │                 │         │                         │   │
│  │  ┌───────────┐  │         │  ┌─────────────────┐    │   │
│  │  │ 聊天界面   │  │         │  │ 自动重连机制     │    │   │
│  │  │ 文件列表   │  │         │  │ 心跳保活        │    │   │
│  │  │ 输入框     │  │         │  │ 二进制流传输    │    │   │
│  │  └───────────┘  │         │  └─────────────────┘    │   │
│  └─────────────────┘         └─────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket (wss://your-server:8080)
┌──────────────────────────┴──────────────────────────────────┐
│                      云服务器                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WebSocket Server (Node.js)              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  连接管理    │  │  消息路由    │  │  文件服务    │ │   │
│  │  │  /ws/chat   │  │  /ws/msg    │  │  /ws/file   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │ OpenClaw    │  │  文件存储    │                   │   │
│  │  │ 代理模块    │  │  /uploads   │                   │   │
│  │  └─────────────┘  └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 技术栈

### 客户端 (Tauri)
- **框架**: Tauri v2
- **前端**: React + TypeScript
- **UI**: Tailwind CSS
- **通信**: WebSocket (原生 API)
- **存储**: Tauri FS API (本地聊天记录)

### 服务器端 (Node.js)
- **运行时**: Node.js 20+
- **WebSocket**: `ws` 库
- **HTTP**: Express
- **文件处理**: Multer
- **日志**: Winston

---

## 通信协议

### WebSocket 消息格式

```typescript
// 基础消息结构
interface WSMessage {
  type: 'chat' | 'file' | 'system' | 'openclaw';
  id: string;           // 消息唯一ID
  timestamp: number;    // Unix 时间戳
  payload: any;         // 具体数据
}

// 聊天消息
interface ChatMessage {
  type: 'chat';
  payload: {
    content: string;    // 消息内容
    sender: 'user' | 'openclaw';
  }
}

// 文件消息
interface FileMessage {
  type: 'file';
  payload: {
    filename: string;   // 文件名
    size: number;       // 文件大小
    mimeType: string;   // MIME 类型
    data: ArrayBuffer;  // 二进制数据（小文件）
    // 或
    url: string;        // 下载链接（大文件）
  }
}

// 系统消息
interface SystemMessage {
  type: 'system';
  payload: {
    event: 'connected' | 'disconnected' | 'error';
    message: string;
  }
}
```

### 文件传输协议

**小文件 (< 10MB)**: 直接 WebSocket 二进制传输
**大文件 (>= 10MB)**: HTTP 分片上传

```typescript
// 分片上传
interface FileChunk {
  chunkIndex: number;   // 当前片序号
  totalChunks: number;  // 总片数
  data: ArrayBuffer;    // 片数据
  checksum: string;     // MD5 校验
}
```

---

## API 接口

### WebSocket 端点
- `ws://server:8080/ws` - 主连接

### HTTP 端点
- `POST /api/upload` - 文件上传
- `GET /api/download/:fileId` - 文件下载
- `GET /api/health` - 健康检查

---

## 目录结构

```
openclaw-chat/
├── client/                    # Tauri 客户端
│   ├── src/
│   │   ├── components/        # React 组件
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── services/          # WebSocket 服务
│   │   └── types/             # TypeScript 类型
│   ├── src-tauri/             # Rust 后端
│   └── package.json
├── server/                    # Node.js 服务器
│   ├── src/
│   │   ├── handlers/          # 消息处理器
│   │   ├── middleware/        # 中间件
│   │   ├── services/          # 业务逻辑
│   │   └── utils/             # 工具函数
│   ├── uploads/               # 文件存储
│   └── package.json
└── README.md
```

---

## 核心功能模块

### 1. 连接管理
- WebSocket 连接建立
- 自动重连机制（指数退避）
- 心跳保活（30秒间隔）
- 连接状态显示

### 2. 消息系统
- 实时双向通信
- 消息历史存储（本地 SQLite）
- 消息状态（发送中/已送达/已读）
- 支持 Markdown 格式

### 3. 文件传输
- 拖拽上传
- 下载进度显示
- 断点续传
- 文件预览（图片/文本）

### 4. OpenClaw 对接
- 消息转发到 OpenClaw API
- 接收 OpenClaw 回复
- 支持多轮对话

---

## 安全设计

1. **传输加密**: WSS (WebSocket Secure)
2. **身份验证**: 简单 Token（自用场景）
3. **文件安全**: 文件类型白名单、大小限制
4. **IP 白名单**: 仅允许特定 IP 连接（可选）

---

## 开发阶段

### Phase 1: 基础架构 ✅ 当前
- [x] 架构设计文档

### Phase 2: 服务器端 ✅ 完成
- [x] WebSocket 服务器搭建
- [x] 消息路由实现
- [x] OpenClaw 代理模块
- [x] 文件上传/下载 API

### Phase 3: 客户端 ✅ 代码框架完成
- [x] Tauri 项目初始化
- [x] 聊天界面开发
- [x] WebSocket 连接
- [ ] 文件传输功能（待本地测试）
- [ ] Tauri 配置和打包

### Phase 4: 集成测试
- [ ] 端到端测试
- [ ] 文件传输测试
- [ ] 打包 exe
- [ ] 部署到服务器

---

*设计日期: 2026-02-14*
*版本: v1.0*
