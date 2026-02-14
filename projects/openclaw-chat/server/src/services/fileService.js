const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

/**
 * 文件服务
 * 处理文件上传、下载和管理
 */
class FileService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024; // 100MB
    this.initUploadDir();
  }

  /**
   * 初始化上传目录
   */
  async initUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      logger.info(`上传目录已准备: ${this.uploadDir}`);
    } catch (error) {
      logger.error('创建上传目录失败:', error);
    }
  }

  /**
   * 获取 Multer 配置
   * @returns {multer.Multer} Multer 实例
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // 生成唯一文件名: timestamp-random.ext
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      // 允许的文件类型
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/markdown',
        'application/pdf',
        'application/json',
        'application/javascript',
        'text/javascript',
        'text/css',
        'text/html'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize
      }
    });
  }

  /**
   * 获取文件信息
   * @param {string} filename - 文件名
   * @returns {Promise<Object|null>} 文件信息
   */
  async getFileInfo(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      const stats = await fs.stat(filePath);

      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取文件列表
   * @returns {Promise<Array>} 文件列表
   */
  async getFileList() {
    try {
      const files = await fs.readdir(this.uploadDir);
      const fileInfos = await Promise.all(
        files.map(filename => this.getFileInfo(filename))
      );
      return fileInfos.filter(info => info !== null);
    } catch (error) {
      logger.error('获取文件列表失败:', error);
      return [];
    }
  }

  /**
   * 删除文件
   * @param {string} filename - 文件名
   * @returns {Promise<boolean>}
   */
  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      logger.info(`文件已删除: ${filename}`);
      return true;
    } catch (error) {
      logger.error(`删除文件失败: ${filename}`, error);
      return false;
    }
  }

  /**
   * 获取文件路径
   * @param {string} filename - 文件名
   * @returns {string} 完整路径
   */
  getFilePath(filename) {
    return path.join(this.uploadDir, filename);
  }

  /**
   * 清理过期文件
   * @param {number} maxAge - 最大保留时间（毫秒）
   * @returns {Promise<number>} 删除的文件数量
   */
  async cleanupOldFiles(maxAge = 7 * 24 * 60 * 60 * 1000) { // 默认7天
    try {
      const files = await this.getFileList();
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const age = now - new Date(file.createdAt).getTime();
        if (age > maxAge) {
          const success = await this.deleteFile(file.filename);
          if (success) deletedCount++;
        }
      }

      logger.info(`清理完成，删除 ${deletedCount} 个过期文件`);
      return deletedCount;
    } catch (error) {
      logger.error('清理文件失败:', error);
      return 0;
    }
  }
}

module.exports = FileService;
