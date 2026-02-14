/**
 * WebSocket 聊天服务器 - 主入口
 *
 * 功能:
 * - WebSocket 实时双向通信
 * - 消息类型: chat(聊天)、file(文件)、system(系统)
 * - 文件上传/下载 (Express + Multer)
 * - 心跳保活机制
 * - 自动重连支持
 * - 完整错误处理
 */

const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 导入自定义模块
const WebSocketHandler = require('./websocket-handler');
const FileService = require('./file-service');

// ==================== 配置 ====================
const CONFIG = {
    PORT: process.env.PORT || 3000,
    // 心跳配置
    HEARTBEAT: {
        INTERVAL: 30000,    // 心跳检测间隔 (30秒)
        TIMEOUT: 10000      // 心跳超时时间 (10秒)
    },
    // 文件上传配置
    UPLOAD: {
        DIRECTORY: path.join(__dirname, 'uploads'),
        MAX_SIZE: 50 * 1024 * 1024  // 最大50MB
    }
};

// ==================== 初始化 Express 应用 ====================
const app = express();

// JSON 解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 (用于下载文件)
app.use('/uploads', express.static(CONFIG.UPLOAD.DIRECTORY));

// 静态页面服务 (客户端)
app.use(express.static(path.join(__dirname, 'public')));

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

// CORS 支持
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ==================== 初始化文件服务 ====================
const fileService = new FileService(CONFIG.UPLOAD.DIRECTORY);

// 确保上传目录存在
fileService.ensureUploadDir();

// ==================== 文件上传/下载路由 ====================

/**
 * 文件上传接口
 * POST /api/upload
 */
app.post('/api/upload', fileService.getUploadMiddleware(), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '未选择文件'
            });
        }

        const fileInfo = {
            id: uuidv4(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: `/uploads/${req.file.filename}`,
            uploadTime: new Date().toISOString()
        };

        res.json({
            success: true,
            data: fileInfo
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({
            success: false,
            error: '文件上传失败'
        });
    }
});

/**
 * 文件下载接口
 * GET /api/download/:filename
 */
app.get('/api/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(CONFIG.UPLOAD.DIRECTORY, filename);

        res.download(filePath, (err) => {
            if (err) {
                console.error('文件下载错误:', err);
                if (!res.headersSent) {
                    res.status(404).json({
                        success: false,
                        error: '文件不存在'
                    });
                }
            }
        });
    } catch (error) {
        console.error('文件下载错误:', error);
        res.status(500).json({
            success: false,
            error: '文件下载失败'
        });
    }
});

/**
 * 获取文件列表
 * GET /api/files
 */
app.get('/api/files', async (req, res) => {
    try {
        const files = await fileService.getFileList();
        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('获取文件列表错误:', error);
        res.status(500).json({
            success: false,
            error: '获取文件列表失败'
        });
    }
});

// ==================== 创建 HTTP 服务器 ====================
const server = http.createServer(app);

// ==================== 初始化 WebSocket 服务器 ====================
const wss = new WebSocket.Server({
    server,
    // WebSocket 配置
    clientTracking: true,  // 启用客户端跟踪
    maxPayload: CONFIG.UPLOAD.MAX_SIZE  // 最大消息大小
});

// 初始化 WebSocket 处理器
const wsHandler = new WebSocketHandler(wss, CONFIG.HEARTBEAT);

// ==================== WebSocket 服务器事件 ====================

/**
 * 新连接事件
 */
wss.on('connection', (ws, req) => {
    wsHandler.handleConnection(ws, req);
});

/**
 * WebSocket 服务器错误
 */
wss.on('error', (error) => {
    console.error('[WebSocket Server] 服务器错误:', error);
});

// ==================== 优雅关闭 ====================
const gracefulShutdown = () => {
    console.log('\n[Server] 正在关闭服务器...');

    // 关闭所有 WebSocket 连接
    wss.clients.forEach((ws) => {
        ws.close(1001, '服务器关闭');
    });

    // 关闭 WebSocket 服务器
    wss.close(() => {
        console.log('[WebSocket] 服务器已关闭');
    });

    // 关闭 HTTP 服务器
    server.close(() => {
        console.log('[HTTP] 服务器已关闭');
        process.exit(0);
    });

    // 强制退出超时
    setTimeout(() => {
        console.error('[Server] 强制关闭');
        process.exit(1);
    }, 5000);
};

// 监听关闭信号
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// 未捕获异常处理
process.on('uncaughtException', (error) => {
    console.error('[Server] 未捕获异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] 未处理的 Promise 拒绝:', reason);
});

// ==================== 启动服务器 ====================
server.listen(CONFIG.PORT, () => {
    console.log('========================================');
    console.log('  WebSocket 聊天服务器已启动');
    console.log('========================================');
    console.log(`  HTTP Server:  http://localhost:${CONFIG.PORT}`);
    console.log(`  WebSocket:    ws://localhost:${CONFIG.PORT}`);
    console.log(`  上传接口:     POST http://localhost:${CONFIG.PORT}/api/upload`);
    console.log(`  下载接口:     GET  http://localhost:${CONFIG.PORT}/api/download/:filename`);
    console.log(`  文件列表:     GET  http://localhost:${CONFIG.PORT}/api/files`);
    console.log('========================================');
    console.log(`  上传目录: ${CONFIG.UPLOAD.DIRECTORY}`);
    console.log(`  心跳间隔: ${CONFIG.HEARTBEAT.INTERVAL / 1000}秒`);
    console.log('========================================');
});

// 导出模块 (用于测试)
module.exports = { app, server, wss, CONFIG };
