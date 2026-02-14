require('dotenv').config();

const http = require('http');
const WebSocket = require('ws');
const logger = require('./utils/logger');

const ConnectionManager = require('./services/connectionManager');
const MessageRouter = require('./services/messageRouter');
const OpenClawProxy = require('./services/openclawProxy');
const FileService = require('./services/fileService');
const createHttpServer = require('./handlers/httpHandler');

// 配置
const PORT = process.env.PORT || 8080;

async function main() {
  logger.info('==============================================');
  logger.info('OpenClaw Chat Server 启动中...');
  logger.info('==============================================');

  // 初始化服务
  const fileService = new FileService();
  const openclawProxy = new OpenClawProxy();
  const connectionManager = new ConnectionManager();
  const messageRouter = new MessageRouter(connectionManager, openclawProxy);

  // 创建 HTTP 服务器
  const app = createHttpServer(fileService);
  const server = http.createServer(app);

  // 创建 WebSocket 服务器
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });

  // 初始化连接管理器
  connectionManager.init(wss);
  messageRouter.init();

  // 启动服务器
  server.listen(PORT, () => {
    logger.info(`==============================================`);
    logger.info(`服务器已启动`);
    logger.info(`HTTP 端口: ${PORT}`);
    logger.info(`WebSocket: ws://localhost:${PORT}/ws`);
    logger.info(`==============================================`);
    logger.info(`API 接口:`);
    logger.info(`  健康检查: GET http://localhost:${PORT}/api/health`);
    logger.info(`  文件上传: POST http://localhost:${PORT}/api/upload`);
    logger.info(`  文件下载: GET http://localhost:${PORT}/api/download/:filename`);
    logger.info(`  文件列表: GET http://localhost:${PORT}/api/files`);
    logger.info(`==============================================`);
  });

  // 优雅关闭
  process.on('SIGTERM', () => gracefulShutdown(server, wss, connectionManager));
  process.on('SIGINT', () => gracefulShutdown(server, wss, connectionManager));

  // 定期清理过期文件（每天一次）
  setInterval(() => {
    fileService.cleanupOldFiles();
  }, 24 * 60 * 60 * 1000);
}

/**
 * 优雅关闭服务器
 */
function gracefulShutdown(server, wss, connectionManager) {
  logger.info('正在关闭服务器...');

  // 停止心跳检测
  connectionManager.stopHeartbeatCheck();

  // 关闭所有 WebSocket 连接
  wss.clients.forEach(client => {
    client.close(1000, '服务器关闭');
  });

  // 关闭 HTTP 服务器
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });

  // 超时强制退出
  setTimeout(() => {
    logger.error('关闭超时，强制退出');
    process.exit(1);
  }, 10000);
}

// 启动
main().catch(error => {
  logger.error('服务器启动失败:', error);
  process.exit(1);
});
