const logger = require('../utils/logger');
const { MessageTypes, createChatMessage, createFileMessage, createSystemMessage } = require('../utils/message');

/**
 * 消息路由器
 * 负责将消息路由到相应的处理器
 */
class MessageRouter {
  constructor(connectionManager, openclawProxy) {
    this.connectionManager = connectionManager;
    this.openclawProxy = openclawProxy;
    this.messageHistory = new Map(); // clientId -> messages[]
    this.maxHistorySize = 100;
  }

  /**
   * 初始化路由器
   */
  init() {
    // 设置连接管理器的消息回调
    this.connectionManager.onMessage = (clientId, message) => {
      this.routeMessage(clientId, message);
    };

    logger.info('消息路由器已初始化');
  }

  /**
   * 路由消息到相应处理器
   * @param {string} clientId - 客户端ID
   * @param {Object} message - 消息对象
   */
  async routeMessage(clientId, message) {
    logger.debug(`路由消息: ${message.type} from ${clientId}`);

    switch (message.type) {
      case MessageTypes.CHAT:
        await this.handleChatMessage(clientId, message);
        break;
      case MessageTypes.FILE:
        await this.handleFileMessage(clientId, message);
        break;
      case MessageTypes.HEARTBEAT:
        this.handleHeartbeat(clientId, message);
        break;
      default:
        logger.warn(`未知消息类型: ${message.type}`);
        this.sendError(clientId, '未知的消息类型');
    }
  }

  /**
   * 处理聊天消息
   * @param {string} clientId - 客户端ID
   * @param {Object} message - 消息对象
   */
  async handleChatMessage(clientId, message) {
    const content = message.payload?.content;
    if (!content) {
      this.sendError(clientId, '消息内容不能为空');
      return;
    }

    // 保存用户消息到历史
    this.addToHistory(clientId, {
      role: 'user',
      content,
      timestamp: Date.now()
    });

    // 转发到 OpenClaw
    const response = await this.openclawProxy.sendMessage(clientId, content);

    if (response.success) {
      // 发送 OpenClaw 回复
      const replyMessage = createChatMessage(response.reply, 'openclaw');
      this.connectionManager.sendToClient(clientId, replyMessage);

      // 保存到历史
      this.addToHistory(clientId, {
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now()
      });
    } else {
      this.sendError(clientId, response.reply);
    }
  }

  /**
   * 处理文件消息
   * @param {string} clientId - 客户端ID
   * @param {Object} message - 消息对象
   */
  async handleFileMessage(clientId, message) {
    const fileInfo = message.payload;
    
    logger.info(`收到文件消息: ${fileInfo?.filename} from ${clientId}`);

    // 确认文件接收
    this.connectionManager.sendToClient(clientId, createSystemMessage(
      'file_received',
      `文件 ${fileInfo?.filename} 已接收`
    ));

    // TODO: 处理文件（如需要转发给 OpenClaw 分析）
  }

  /**
   * 处理心跳消息
   * @param {string} clientId - 客户端ID
   * @param {Object} message - 消息对象
   */
  handleHeartbeat(clientId, message) {
    // 心跳已在连接管理器中处理，这里可以添加额外逻辑
    this.connectionManager.sendToClient(clientId, {
      type: MessageTypes.HEARTBEAT_ACK,
      timestamp: Date.now()
    });
  }

  /**
   * 发送错误消息
   * @param {string} clientId - 客户端ID
   * @param {string} errorMessage - 错误信息
   */
  sendError(clientId, errorMessage) {
    this.connectionManager.sendToClient(clientId, createSystemMessage(
      'error',
      errorMessage
    ));
  }

  /**
   * 添加消息到历史
   * @param {string} clientId - 客户端ID
   * @param {Object} message - 消息对象
   */
  addToHistory(clientId, message) {
    if (!this.messageHistory.has(clientId)) {
      this.messageHistory.set(clientId, []);
    }

    const history = this.messageHistory.get(clientId);
    history.push(message);

    // 限制历史记录大小
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * 获取消息历史
   * @param {string} clientId - 客户端ID
   * @param {number} limit - 限制数量
   * @returns {Array} 消息历史
   */
  getHistory(clientId, limit = 50) {
    const history = this.messageHistory.get(clientId) || [];
    return history.slice(-limit);
  }

  /**
   * 清除消息历史
   * @param {string} clientId - 客户端ID
   */
  clearHistory(clientId) {
    this.messageHistory.delete(clientId);
  }
}

module.exports = MessageRouter;
