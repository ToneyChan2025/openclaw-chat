const WebSocket = require('ws');
const logger = require('../utils/logger');
const { MessageTypes, SystemEvents, createSystemMessage } = require('../utils/message');

/**
 * WebSocket 连接管理器
 */
class ConnectionManager {
  constructor() {
    this.clients = new Map(); // clientId -> { ws, metadata }
    this.heartbeatInterval = null;
  }

  /**
   * 初始化连接管理器
   * @param {WebSocket.Server} wss - WebSocket 服务器实例
   */
  init(wss) {
    this.wss = wss;
    
    wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // 启动心跳检测
    this.startHeartbeatCheck();

    logger.info('WebSocket 连接管理器已初始化');
  }

  /**
   * 处理新连接
   * @param {WebSocket} ws - WebSocket 连接
   * @param {http.IncomingMessage} req - HTTP 请求对象
   */
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    const clientInfo = {
      ws,
      id: clientId,
      ip: req.socket.remoteAddress,
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      isAlive: true
    };

    this.clients.set(clientId, clientInfo);
    logger.info(`客户端已连接: ${clientId}, IP: ${clientInfo.ip}`);

    // 发送连接成功消息
    this.sendToClient(clientId, createSystemMessage(
      SystemEvents.CONNECTED,
      '连接成功'
    ));

    // 设置消息处理器
    ws.on('message', (data) => {
      this.handleMessage(clientId, data);
    });

    // 设置关闭处理器
    ws.on('close', (code, reason) => {
      this.handleDisconnect(clientId, code, reason);
    });

    // 设置错误处理器
    ws.on('error', (error) => {
      logger.error(`客户端 ${clientId} 发生错误:`, error);
    });

    // 设置 pong 响应（用于心跳）
    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.isAlive = true;
        client.lastHeartbeat = Date.now();
      }
    });
  }

  /**
   * 处理客户端消息
   * @param {string} clientId - 客户端ID
   * @param {Buffer} data - 消息数据
   */
  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const message = JSON.parse(data.toString());
      logger.debug(`收到来自 ${clientId} 的消息:`, { type: message.type });

      // 更新心跳时间
      client.lastHeartbeat = Date.now();

      // 触发消息事件（由外部处理器处理）
      if (this.onMessage) {
        this.onMessage(clientId, message);
      }
    } catch (error) {
      logger.error(`解析消息失败: ${error.message}`);
      this.sendToClient(clientId, createSystemMessage(
        SystemEvents.ERROR,
        '消息格式错误'
      ));
    }
  }

  /**
   * 处理客户端断开连接
   * @param {string} clientId - 客户端ID
   * @param {number} code - 关闭代码
   * @param {Buffer} reason - 关闭原因
   */
  handleDisconnect(clientId, code, reason) {
    const client = this.clients.get(clientId);
    if (client) {
      logger.info(`客户端已断开: ${clientId}, 代码: ${code}`);
      this.clients.delete(clientId);
    }
  }

  /**
   * 发送消息给指定客户端
   * @param {string} clientId - 客户端ID
   * @param {Object} message - 消息对象
   * @returns {boolean} 是否发送成功
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`发送消息给 ${clientId} 失败:`, error);
      return false;
    }
  }

  /**
   * 广播消息给所有客户端
   * @param {Object} message - 消息对象
   * @param {string} excludeClientId - 排除的客户端ID
   */
  broadcast(message, excludeClientId = null) {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  /**
   * 启动心跳检测
   */
  startHeartbeatCheck() {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000;
    
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          logger.warn(`客户端 ${clientId} 心跳超时，断开连接`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, interval);

    logger.info(`心跳检测已启动，间隔: ${interval}ms`);
  }

  /**
   * 停止心跳检测
   */
  stopHeartbeatCheck() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 获取连接统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      totalConnections: this.clients.size,
      clients: Array.from(this.clients.entries()).map(([id, info]) => ({
        id,
        ip: info.ip,
        connectedAt: info.connectedAt,
        lastHeartbeat: info.lastHeartbeat
      }))
    };
  }

  /**
   * 生成客户端ID
   * @returns {string} 客户端ID
   */
  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ConnectionManager;
