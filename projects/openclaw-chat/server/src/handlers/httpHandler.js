const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('../utils/logger');
const FileService = require('../services/fileService');

/**
 * 创建 Express HTTP 服务器
 * @param {FileService} fileService - 文件服务实例
 * @returns {express.Application} Express 应用
 */
function createHttpServer(fileService) {
  const app = express();
  const upload = fileService.getMulterConfig();

  // 中间件
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 健康检查
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0'
    });
  });

  // 文件上传
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '没有上传文件'
        });
      }

      logger.info(`文件上传成功: ${req.file.filename}`);

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          url: `/api/download/${req.file.filename}`
        }
      });
    } catch (error) {
      logger.error('文件上传失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // 文件下载
  app.get('/api/download/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const fileInfo = await fileService.getFileInfo(filename);

      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          error: '文件不存在'
        });
      }

      const filePath = fileService.getFilePath(filename);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      logger.error('文件下载失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // 文件列表
  app.get('/api/files', async (req, res) => {
    try {
      const files = await fileService.getFileList();
      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      logger.error('获取文件列表失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // 删除文件
  app.delete('/api/files/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const success = await fileService.deleteFile(filename);

      if (success) {
        res.json({
          success: true,
          message: '文件已删除'
        });
      } else {
        res.status(404).json({
          success: false,
          error: '文件不存在或删除失败'
        });
      }
    } catch (error) {
      logger.error('删除文件失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // 404 处理
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: '接口不存在'
    });
  });

  // 错误处理
  app.use((err, req, res, next) => {
    logger.error('HTTP 错误:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || '服务器内部错误'
    });
  });

  return app;
}

module.exports = createHttpServer;
