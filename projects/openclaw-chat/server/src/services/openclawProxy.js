const logger = require('../utils/logger');
const { MessageTypes, createChatMessage, createSystemMessage } = require('../utils/message');

/**
 * OpenClaw 代理服务
 * 负责与 OpenClaw Gateway 通信
 */
class OpenClawProxy {
  constructor() {
    this.gatewayUrl = process.env.OPENCLAW_URL || 'http://localhost:3000';
    this.gatewayToken = process.env.OPENCLAW_TOKEN;
  }

  /**
   * 发送消息到 OpenClaw
   * @param {string} clientId - 客户端ID
   * @param {string} message - 用户消息内容
   * @returns {Promise<Object>} OpenClaw 响应
   */
  async sendMessage(clientId, message) {
    try {
      logger.info(`转发消息到 OpenClaw: ${clientId}`);

      const response = await fetch(`${this.gatewayUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gatewayToken}`,
          'X-Client-Id': clientId
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`OpenClaw 响应错误: ${response.status}`);
      }

      const data = await response.json();
      
      // 提取回复内容
      const reply = data.choices?.[0]?.message?.content || '抱歉，我无法理解您的消息。';
      
      logger.info(`收到 OpenClaw 响应: ${clientId}`);
      
      return {
        success: true,
        reply,
        raw: data
      };
    } catch (error) {
      logger.error('OpenClaw 请求失败:', error);
      return {
        success: false,
        error: error.message,
        reply: '抱歉，服务暂时不可用，请稍后重试。'
      };
    }
  }

  /**
   * 流式发送消息到 OpenClaw
   * @param {string} clientId - 客户端ID
   * @param {string} message - 用户消息内容
   * @param {Function} onChunk - 接收数据块的回调
   * @returns {Promise<void>}
   */
  async sendMessageStream(clientId, message, onChunk) {
    try {
      logger.info(`开始流式转发到 OpenClaw: ${clientId}`);

      const response = await fetch(`${this.gatewayUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gatewayToken}`,
          'X-Client-Id': clientId
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`OpenClaw 响应错误: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      logger.info(`流式响应完成: ${clientId}`);
    } catch (error) {
      logger.error('OpenClaw 流式请求失败:', error);
      onChunk('抱歉，服务暂时不可用，请稍后重试。');
    }
  }

  /**
   * 检查 OpenClaw 服务状态
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.gatewayUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.gatewayToken}`
        }
      });
      return response.ok;
    } catch (error) {
      logger.error('OpenClaw 健康检查失败:', error);
      return false;
    }
  }
}

module.exports = OpenClawProxy;
