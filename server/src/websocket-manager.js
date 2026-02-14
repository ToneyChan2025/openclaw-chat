const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

/**
 * WebSocket 连接管理器
 * 管理所有客户端连接、心跳检测、消息路由
 */
class WebSocketManager {
    constructor(server, config) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // 存储所有连接
        this.config = config;
        
        this.init();
    }
    
    init() {
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
        
        // 启动心跳检测
        this.startHeartbeat();
        
        console.log('✅ WebSocket 服务器已启动');
    }
    
    /**
     * 处理新连接
     */
    handleConnection(ws, req) {
        const clientId = uuidv4();
        const clientInfo = {
            id: clientId,
            ws: ws,
            isAlive: true,
            connectedAt: new Date()
        };
        
        this.clients.set(clientId, clientInfo);
        console.log(`🔗 新客户端连接: ${clientId}, 当前连接数: ${this.clients.size}`);
        
        // 发送欢迎消息
        this.sendToClient(clientId, {
            type: 'system',
            id: uuidv4(),
            timestamp: Date.now(),
            payload: {
                event: 'connected',
                message: '连接成功',
                clientId: clientId
            }
        });
        
        // 监听消息
        ws.on('message', (data) => {
            this.handleMessage(clientId, data);
        });
        
        // 监听关闭
        ws.on('close', () => {
            this.handleDisconnect(clientId);
        });
        
        // 监听错误
        ws.on('error', (error) => {
            console.error(`❌ 客户端 ${clientId} 错误:`, error.message);
        });
        
        // 心跳响应
        ws.on('pong', () => {
            clientInfo.isAlive = true;
        });
    }
    
    /**
     * 处理消息
     */
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            console.log(`📨 收到消息 [${clientId}]:`, message.type);
            
            // 根据消息类型处理
            switch (message.type) {
                case 'chat':
                    this.handleChatMessage(clientId, message);
                    break;
                case 'file':
                    this.handleFileMessage(clientId, message);
                    break;
                case 'ping':
                    // 心跳响应
                    this.sendToClient(clientId, {
                        type: 'pong',
                        id: uuidv4(),
                        timestamp: Date.now()
                    });
                    break;
                default:
                    console.warn(`⚠️ 未知消息类型: ${message.type}`);
            }
        } catch (error) {
            console.error('❌ 消息解析错误:', error.message);
            this.sendToClient(clientId, {
                type: 'system',
                id: uuidv4(),
                timestamp: Date.now(),
                payload: {
                    event: 'error',
                    message: '消息格式错误'
                }
            });
        }
    }
    
    /**
     * 处理聊天消息
     */
    handleChatMessage(clientId, message) {
        // 转发给所有客户端（广播）
        this.broadcast({
            ...message,
            timestamp: Date.now()
        }, clientId);
    }
    
    /**
     * 处理文件消息
     */
    handleFileMessage(clientId, message) {
        // 广播文件消息
        this.broadcast({
            ...message,
            timestamp: Date.now()
        }, clientId);
    }
    
    /**
     * 处理断开连接
     */
    handleDisconnect(clientId) {
        this.clients.delete(clientId);
        console.log(`🔌 客户端断开: ${clientId}, 当前连接数: ${this.clients.size}`);
    }
    
    /**
     * 发送消息给指定客户端
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }
    
    /**
     * 广播消息给所有客户端
     */
    broadcast(message, excludeClientId = null) {
        const messageStr = JSON.stringify(message);
        this.clients.forEach((client, id) => {
            if (id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(messageStr);
            }
        });
    }
    
    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        setInterval(() => {
            this.clients.forEach((client, clientId) => {
                if (!client.isAlive) {
                    // 心跳超时，关闭连接
                    console.log(`💔 心跳超时，关闭连接: ${clientId}`);
                    client.ws.terminate();
                    this.clients.delete(clientId);
                    return;
                }
                
                // 标记为未存活，等待 pong 响应
                client.isAlive = false;
                client.ws.ping();
            });
        }, this.config.HEARTBEAT.INTERVAL);
        
        console.log(`💓 心跳检测已启动，间隔: ${this.config.HEARTBEAT.INTERVAL}ms`);
    }
}

module.exports = WebSocketManager;
