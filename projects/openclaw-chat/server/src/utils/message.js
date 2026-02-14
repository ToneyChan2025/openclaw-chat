/**
 * WebSocket 消息类型定义
 */

const MessageTypes = {
  // 聊天消息
  CHAT: 'chat',
  // 文件消息
  FILE: 'file',
  // 系统消息
  SYSTEM: 'system',
  // OpenClaw 消息
  OPENCLAW: 'openclaw',
  // 心跳
  HEARTBEAT: 'heartbeat',
  // 心跳响应
  HEARTBEAT_ACK: 'heartbeat_ack'
};

const SystemEvents = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting'
};

/**
 * 创建基础消息结构
 * @param {string} type - 消息类型
 * @param {any} payload - 消息内容
 * @returns {Object} 消息对象
 */
function createMessage(type, payload) {
  return {
    type,
    id: generateId(),
    timestamp: Date.now(),
    payload
  };
}

/**
 * 创建聊天消息
 * @param {string} content - 消息内容
 * @param {string} sender - 发送者 ('user' | 'openclaw')
 * @returns {Object} 聊天消息对象
 */
function createChatMessage(content, sender = 'user') {
  return createMessage(MessageTypes.CHAT, {
    content,
    sender
  });
}

/**
 * 创建文件消息
 * @param {Object} fileInfo - 文件信息
 * @returns {Object} 文件消息对象
 */
function createFileMessage(fileInfo) {
  return createMessage(MessageTypes.FILE, {
    filename: fileInfo.filename,
    size: fileInfo.size,
    mimeType: fileInfo.mimeType,
    url: fileInfo.url || null,
    data: fileInfo.data || null
  });
}

/**
 * 创建系统消息
 * @param {string} event - 事件类型
 * @param {string} message - 消息内容
 * @returns {Object} 系统消息对象
 */
function createSystemMessage(event, message) {
  return createMessage(MessageTypes.SYSTEM, {
    event,
    message
  });
}

/**
 * 创建心跳消息
 * @returns {Object} 心跳消息对象
 */
function createHeartbeatMessage() {
  return createMessage(MessageTypes.HEARTBEAT, {
    time: Date.now()
  });
}

/**
 * 生成唯一ID
 * @returns {string} UUID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  MessageTypes,
  SystemEvents,
  createMessage,
  createChatMessage,
  createFileMessage,
  createSystemMessage,
  createHeartbeatMessage,
  generateId
};
