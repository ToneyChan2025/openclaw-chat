/**
 * WebSocket 处理器
 *
 * 功能:
 * - 处理 WebSocket 连接/断开
 * - 消息路由和处理
 * - 心跳保活机制
 * - 广播消息
 * - 错误处理
 */

const { v4: uuidv4 } = require('uuid');

// ==================== 消息类型枚举 ====================
const MessageType = {
    CHAT: 'chat',       // 聊天消息
    FILE: 'file',       // 文件消息
    SYSTEM: 'system',   // 系统消息
    HEARTBEAT: 'heartbeat',  // 心跳消息
    HISTORY: 'history', // 历史消息
    ERROR: 'error'      // 错误消息
};

class WebSocketHandler {
    /**
     * 构造函数
     * @param {WebSocket.Server} wss - WebSocket 服务器实例
     * @param {Object} heartbeatConfig - 心跳配置
     */
    constructor(wss, heartbeatConfig) {
        this.wss = wss;
        this.heartbeatConfig = heartbeatConfig;
        this.clients = new Map();  // 存储客户端信息: ws -> clientInfo
        this.messageHistory = [];  // 消息历史 (最多保存100条)
        this.maxHistory = 100;

        // 启动心跳检测
        this.startHeartbeat();
    }

    /**
     * 处理新连接
     * @param {WebSocket} ws - WebSocket 连接
     * @param {http.IncomingMessage} req - HTTP 请求对象
     */
    handleConnection(ws, req) {
        // 生成客户端ID
        const clientId = uuidv4();
        const clientIp = this.getClientIp(req);
        const username = `用户${clientId.substring(0, 6)}`;

        // 初始化客户端信息
        const clientInfo = {
            id: clientId,
            username: username,
            ip: clientIp,
            connectedAt: new Date(),
            isAlive: true,
            lastPong: Date.now()
        };

        // 保存客户端信息
        this.clients.set(ws, clientInfo);

        console.log(`[WebSocket] 新连接: ${username} (${clientId}) 来自 ${clientIp}`);
        console.log(`[WebSocket] 当前在线人数: ${this.clients.size}`);

        // 发送欢迎消息
        this.sendMessage(ws, {
            type: MessageType.SYSTEM,
            content: {
                message: `欢迎加入聊天室，您的昵称是: ${username}`,
                clientId: clientId,
                onlineCount: this.clients.size
            }
        });

        // 发送消息历史
        if (this.messageHistory.length > 0) {
            this.sendMessage(ws, {
                type: MessageType.HISTORY,
                content: this.messageHistory
            });
        }

        // 广播用户加入消息
        this.broadcast({
            type: MessageType.SYSTEM,
            content: {
                message: `${username} 加入了聊天室`,
                onlineCount: this.clients.size
            }
        }, ws);

        // ==================== WebSocket 事件绑定 ====================

        /**
         * 消息事件
         */
        ws.on('message', (data) => {
            this.handleMessage(ws, data);
        });

        /**
         * 关闭事件
         */
        ws.on('close', (code, reason) => {
            this.handleClose(ws, code, reason);
        });

        /**
         * 错误事件
         */
        ws.on('error', (error) => {
            this.handleError(ws, error);
        });

        /**
         * Pong 事件 (心跳响应)
         */
        ws.on('pong', () => {
            const info = this.clients.get(ws);
            if (info) {
                info.isAlive = true;
                info.lastPong = Date.now();
            }
        });
    }

    /**
     * 处理消息
     * @param {WebSocket} ws - WebSocket 连接
     * @param {Buffer|string} data - 消息数据
     */
    handleMessage(ws, data) {
        try {
            // 解析消息
            const message = this.parseMessage(data);
            if (!message) {
                this.sendError(ws, '消息格式错误');
                return;
            }

            const clientInfo = this.clients.get(ws);
            if (!clientInfo) {
                this.sendError(ws, '客户端未注册');
                return;
            }

            // 更新活跃状态
            clientInfo.isAlive = true;
            clientInfo.lastPong = Date.now();

            // 根据消息类型处理
            switch (message.type) {
                case MessageType.CHAT:
                    this.handleChatMessage(ws, message);
                    break;

                case MessageType.FILE:
                    this.handleFileMessage(ws, message);
                    break;

                case MessageType.HEARTBEAT:
                    this.handleHeartbeat(ws, message);
                    break;

                case MessageType.SYSTEM:
                    this.handleSystemMessage(ws, message);
                    break;

                default:
                    this.sendError(ws, `未知的消息类型: ${message.type}`);
            }

        } catch (error) {
            console.error('[WebSocket] 消息处理错误:', error);
            this.sendError(ws, '消息处理失败');
        }
    }

    /**
     * 处理聊天消息
     */
    handleChatMessage(ws, message) {
        const clientInfo = this.clients.get(ws);

        const chatMessage = {
            id: uuidv4(),
            type: MessageType.CHAT,
            sender: {
                id: clientInfo.id,
                username: clientInfo.username
            },
            content: message.content,
            timestamp: new Date().toISOString()
        };

        // 保存到历史记录
        this.addToHistory(chatMessage);

        // 广播给所有客户端
        this.broadcast(chatMessage);
    }

    /**
     * 处理文件消息
     */
    handleFileMessage(ws, message) {
        const clientInfo = this.clients.get(ws);

        const fileMessage = {
            id: uuidv4(),
            type: MessageType.FILE,
            sender: {
                id: clientInfo.id,
                username: clientInfo.username
            },
            content: message.content,  // 文件信息 (url, filename, size 等)
            timestamp: new Date().toISOString()
        };

        // 保存到历史记录
        this.addToHistory(fileMessage);

        // 广播给所有客户端
        this.broadcast(fileMessage);
    }

    /**
     * 处理心跳消息
     */
    handleHeartbeat(ws, message) {
        // 响应心跳
        this.sendMessage(ws, {
            type: MessageType.HEARTBEAT,
            content: {
                timestamp: Date.now(),
                serverTime: new Date().toISOString()
            }
        });
    }

    /**
     * 处理系统消息
     */
    handleSystemMessage(ws, message) {
        const clientInfo = this.clients.get(ws);

        // 处理修改用户名
        if (message.content.action === 'setUsername') {
            const oldName = clientInfo.username;
            clientInfo.username = message.content.username || oldName;

            this.broadcast({
                type: MessageType.SYSTEM,
                content: {
                    message: `${oldName} 更名为 ${clientInfo.username}`
                }
            });
        }
    }

    /**
     * 处理连接关闭
     */
    handleClose(ws, code, reason) {
        const clientInfo = this.clients.get(ws);

        if (clientInfo) {
            console.log(`[WebSocket] 连接关闭: ${clientInfo.username} (${clientInfo.id})`);
            console.log(`[WebSocket] 关闭码: ${code}, 原因: ${reason || '无'}`);

            // 广播用户离开消息
            this.broadcast({
                type: MessageType.SYSTEM,
                content: {
                    message: `${clientInfo.username} 离开了聊天室`,
                    onlineCount: this.clients.size - 1
                }
            }, ws);

            // 移除客户端
            this.clients.delete(ws);
        }

        console.log(`[WebSocket] 当前在线人数: ${this.clients.size}`);
    }

    /**
     * 处理错误
     */
    handleError(ws, error) {
        const clientInfo = this.clients.get(ws);
        console.error(`[WebSocket] 连接错误: ${clientInfo?.username || '未知'} - ${error.message}`);
    }

    // ==================== 消息发送方法 ====================

    /**
     * 发送消息给指定客户端
     * @param {WebSocket} ws - WebSocket 连接
     * @param {Object} message - 消息对象
     */
    sendMessage(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    /**
     * 广播消息给所有客户端
     * @param {Object} message - 消息对象
     * @param {WebSocket} excludeWs - 排除的连接 (可选)
     */
    broadcast(message, excludeWs = null) {
        const messageStr = JSON.stringify(message);

        this.clients.forEach((clientInfo, ws) => {
            if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
                ws.send(messageStr);
            }
        });
    }

    /**
     * 发送错误消息
     */
    sendError(ws, errorMessage) {
        this.sendMessage(ws, {
            type: MessageType.ERROR,
            content: {
                message: errorMessage,
                timestamp: new Date().toISOString()
            }
        });
    }

    // ==================== 心跳保活机制 ====================

    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        // 定期发送 Ping 并检测客户端存活状态
        setInterval(() => {
            const now = Date.now();

            this.clients.forEach((clientInfo, ws) => {
                // 检查连接状态
                if (ws.readyState !== WebSocket.OPEN) {
                    this.clients.delete(ws);
                    return;
                }

                // 检查是否超时未响应
                if (!clientInfo.isAlive) {
                    console.log(`[WebSocket] 客户端超时断开: ${clientInfo.username}`);
                    ws.terminate();
                    this.clients.delete(ws);
                    return;
                }

                // 标记为待检测,等待 Pong 响应
                clientInfo.isAlive = false;
                ws.ping();
            });

            // 打印心跳日志
            if (this.clients.size > 0) {
                console.log(`[Heartbeat] 已发送心跳, 在线: ${this.clients.size} 人`);
            }

        }, this.heartbeatConfig.INTERVAL);
    }

    // ==================== 辅助方法 ====================

    /**
     * 解析消息
     */
    parseMessage(data) {
        try {
            // 处理 Buffer
            let messageStr = data;
            if (Buffer.isBuffer(data)) {
                messageStr = data.toString('utf-8');
            }

            const message = JSON.parse(messageStr);

            // 验证消息格式
            if (!message.type) {
                return null;
            }

            return message;
        } catch (error) {
            console.error('[WebSocket] 消息解析失败:', error);
            return null;
        }
    }

    /**
     * 获取客户端 IP
     */
    getClientIp(req) {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.socket.remoteAddress
            || 'unknown';
    }

    /**
     * 添加消息到历史记录
     */
    addToHistory(message) {
        this.messageHistory.push(message);

        // 限制历史记录数量
        if (this.messageHistory.length > this.maxHistory) {
            this.messageHistory.shift();
        }
    }

    /**
     * 获取在线用户列表
     */
    getOnlineUsers() {
        const users = [];
        this.clients.forEach((clientInfo) => {
            users.push({
                id: clientInfo.id,
                username: clientInfo.username,
                connectedAt: clientInfo.connectedAt
            });
        });
        return users;
    }

    /**
     * 获取服务器统计信息
     */
    getStats() {
        return {
            onlineCount: this.clients.size,
            historyCount: this.messageHistory.length,
            uptime: process.uptime()
        };
    }
}

module.exports = WebSocketHandler;
module.exports.MessageType = MessageType;
