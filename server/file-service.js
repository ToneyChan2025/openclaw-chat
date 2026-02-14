/**
 * 文件服务模块
 *
 * 功能:
 * - 文件上传 (Multer)
 * - 文件下载
 * - 文件管理
 * - 安全检查
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class FileService {
    /**
     * 构造函数
     * @param {string} uploadDir - 上传目录路径
     */
    constructor(uploadDir) {
        this.uploadDir = uploadDir;
        this.maxSize = 50 * 1024 * 1024; // 默认50MB

        // 允许的文件类型
        this.allowedMimeTypes = [
            // 图片
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            // 文档
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/markdown',
            // 压缩文件
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            // 音频
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            // 视频
            'video/mp4',
            'video/webm',
            'video/ogg'
        ];

        // 配置 Multer 存储
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (req, file, cb) => {
                // 生成唯一文件名: 时间戳-UUID.扩展名
                const ext = path.extname(file.originalname);
                const filename = `${Date.now()}-${uuidv4()}${ext}`;
                cb(null, filename);
            }
        });

        // 创建 Multer 实例
        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: this.maxSize
            },
            fileFilter: (req, file, cb) => {
                this.filterFile(req, file, cb);
            }
        });
    }

    /**
     * 确保上传目录存在
     */
    async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            console.log(`[FileService] 上传目录已准备: ${this.uploadDir}`);
        } catch (error) {
            console.error(`[FileService] 创建上传目录失败:`, error);
            throw error;
        }
    }

    /**
     * 文件过滤器
     */
    filterFile(req, file, cb) {
        // 检查 MIME 类型
        if (this.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            // 不在白名单中但允许上传 (可根据需求修改)
            cb(null, true);
        }
    }

    /**
     * 获取上传中间件
     */
    getUploadMiddleware() {
        return this.upload.single('file');
    }

    /**
     * 获取文件列表
     */
    async getFileList() {
        try {
            const files = await fs.readdir(this.uploadDir);
            const fileInfos = [];

            for (const filename of files) {
                const filePath = path.join(this.uploadDir, filename);
                const stats = await fs.stat(filePath);

                if (stats.isFile()) {
                    fileInfos.push({
                        filename: filename,
                        size: stats.size,
                        uploadTime: stats.mtime,
                        url: `/uploads/${filename}`
                    });
                }
            }

            // 按上传时间倒序排列
            fileInfos.sort((a, b) => b.uploadTime - a.uploadTime);

            return fileInfos;
        } catch (error) {
            console.error('[FileService] 获取文件列表失败:', error);
            return [];
        }
    }

    /**
     * 删除文件
     * @param {string} filename - 文件名
     */
    async deleteFile(filename) {
        try {
            // 安全检查: 防止路径遍历攻击
            const safeName = path.basename(filename);
            const filePath = path.join(this.uploadDir, safeName);

            // 检查文件是否存在
            await fs.access(filePath);

            // 删除文件
            await fs.unlink(filePath);

            return { success: true, message: '文件删除成功' };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: false, error: '文件不存在' };
            }
            console.error('[FileService] 删除文件失败:', error);
            return { success: false, error: '删除文件失败' };
        }
    }

    /**
     * 获取文件信息
     * @param {string} filename - 文件名
     */
    async getFileInfo(filename) {
        try {
            const safeName = path.basename(filename);
            const filePath = path.join(this.uploadDir, safeName);
            const stats = await fs.stat(filePath);

            return {
                success: true,
                data: {
                    filename: safeName,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    url: `/uploads/${safeName}`
                }
            };
        } catch (error) {
            return { success: false, error: '文件不存在' };
        }
    }

    /**
     * 清理过期文件
     * @param {number} daysOld - 保留天数
     */
    async cleanOldFiles(daysOld = 30) {
        try {
            const files = await fs.readdir(this.uploadDir);
            const now = Date.now();
            const maxAge = daysOld * 24 * 60 * 60 * 1000;
            let deletedCount = 0;

            for (const filename of files) {
                const filePath = path.join(this.uploadDir, filename);
                const stats = await fs.stat(filePath);

                if (stats.isFile() && (now - stats.mtime.getTime()) > maxAge) {
                    await fs.unlink(filePath);
                    deletedCount++;
                }
            }

            return {
                success: true,
                deletedCount: deletedCount,
                message: `已清理 ${deletedCount} 个过期文件`
            };
        } catch (error) {
            console.error('[FileService] 清理文件失败:', error);
            return { success: false, error: '清理文件失败' };
        }
    }

    /**
     * 格式化文件大小
     */
    static formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}

module.exports = FileService;
