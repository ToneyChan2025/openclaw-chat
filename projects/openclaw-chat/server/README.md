# OpenClaw Chat Server

自用聊天软件服务器端，对接 OpenClaw Gateway，支持实时聊天和文件传输。

## 功能特性

- ✅ WebSocket 实时通信
- ✅ 心跳保活机制
- ✅ 文件上传/下载
- ✅ OpenClaw AI 对接
- ✅ 消息历史管理
- ✅ 自动重连支持

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置你的 OpenClaw Gateway 地址和 Token
```

### 3. 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:8080` 启动。

## API 接口

### WebSocket

- **地址**: `ws://localhost:8080/ws`
- **消息格式**: JSON

#### 消息类型

```typescript
// 聊天消息
{
  type: 'chat',
  id: 'string',
  timestamp: number,
  payload: {
    content: 'string',
    sender: 'user' | 'openclaw'
  }
}

// 文件消息
{
  type: 'file',
  id: 'string',
  timestamp: number,
  payload: {
    filename: 'string',
    size: number,
    mimeType: 'string',
    url: 'string'
  }
}

// 系统消息
{
  type: 'system',
  id: 'string',
  timestamp: number,
  payload: {
    event: 'connected' | 'disconnected' | 'error',
    message: 'string'
  }
}

// 心跳
{
  type: 'heartbeat',
  id: 'string',
  timestamp: number,
  payload: {
    time: number
  }
}
```

### HTTP API

#### 健康检查
```bash
GET /api/health
```

#### 文件上传
```bash
POST /api/upload
Content-Type: multipart/form-data

file: <文件>
```

#### 文件下载
```bash
GET /api/download/:filename
```

#### 文件列表
```bash
GET /api/files
```

#### 删除文件
```bash
DELETE /api/files/:filename
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | HTTP 端口 | `8080` |
| `OPENCLAW_URL` | OpenClaw Gateway 地址 | `http://localhost:3000` |
| `OPENCLAW_TOKEN` | OpenClaw Token | - |
| `WS_HEARTBEAT_INTERVAL` | WebSocket 心跳间隔(ms) | `30000` |
| `UPLOAD_DIR` | 文件上传目录 | `./uploads` |
| `MAX_FILE_SIZE` | 最大文件大小(bytes) | `104857600` (100MB) |

## 目录结构

```
server/
├── src/
│   ├── handlers/          # HTTP 处理器
│   │   └── httpHandler.js
│   ├── services/          # 业务服务
│   │   ├── connectionManager.js  # WebSocket 连接管理
│   │   ├── messageRouter.js      # 消息路由
│   │   ├── openclawProxy.js      # OpenClaw 代理
│   │   └── fileService.js        # 文件服务
│   ├── utils/             # 工具函数
│   │   ├── logger.js      # 日志
│   │   └── message.js     # 消息格式
│   └── index.js           # 入口文件
├── uploads/               # 上传文件存储
├── logs/                  # 日志文件
├── .env.example           # 环境变量示例
└── package.json
```

## 开发计划

- [x] WebSocket 服务器搭建
- [x] 消息路由实现
- [x] OpenClaw 代理模块
- [x] 文件上传/下载 API
- [ ] 流式响应支持
- [ ] 消息持久化存储
- [ ] 用户认证

## 许可证

MIT
