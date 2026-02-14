const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * 文件服务
 * 处理文件上传、下载、管理
 */
class FileService {
    constructor(config) {
        this.config = config;
        this.uploadDir = config.UPLOAD.DIRECTORY;
        
        // 确保上传目录存在
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        
        // 配置 multer
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${uuidv4()}-${file.originalname}`;
                cb(null, uniqueName);
            }
        });
        
        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: config.UPLOAD.MAX_SIZE
            },
            fileFilter: (req, file, cb) => {
                // 可以在这里添加文件类型白名单
                cb(null, true);
            }
        });
    }
    
    /**
     * 获取 Express 路由
     */
    getRouter() {
        const router = express.Router();
        
        // 文件上传接口
        router.post('/upload', this.upload.single('file'), (req, res) => {
            this.handleUpload(req, res);
        });
        
        // 文件下载接口
        router.get('/download/:fileId', (req, res) => {
            this.handleDownload(req, res);
        });
        
        // 文件列表接口
        router.get('/list', (req, res) => {
            this.handleList(req, res);
        });
        
        return router;
    }
    
    /**
     * 处理文件上传
     */
    handleUpload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: '没有上传文件'
                });
            }
            
            const fileInfo = {
                id: req.file.filename.split('-')[0],
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimeType: req.file.mimetype,
                uploadTime: new Date().toISOString()
            };
            
            console.log(`📤 文件上传成功: ${fileInfo.originalName} (${this.formatFileSize(fileInfo.size)})`);
            
            res.json({
                success: true,
                message: '上传成功',
                data: fileInfo
            });
        } catch (error) {
            console.error('❌ 文件上传错误:', error.message);
            res.status(500).json({
                success: false,
                message: '上传失败',
                error: error.message
            });
        }
    }
    
    /**
     * 处理文件下载
     */
    handleDownload(req, res) {
        try {
            const { fileId } = req.params;
            
            // 查找文件
            const files = fs.readdirSync(this.uploadDir);
            const file = files.find(f => f.startsWith(fileId));
            
            if (!file) {
                return res.status(404).json({
                    success: false,
                    message: '文件不存在'
                });
            }
            
            const filePath = path.join(this.uploadDir, file);
            
            console.log(`📥 文件下载: ${file}`);
            
            res.download(filePath, file.substring(fileId.length + 1));
        } catch (error) {
            console.error('❌ 文件下载错误:', error.message);
            res.status(500).json({
                success: false,
                message: '下载失败',
                error: error.message
            });
        }
    }
    
    /**
     * 获取文件列表
     */
    handleList(req, res) {
        try {
            const files = fs.readdirSync(this.uploadDir).map(filename => {
                const parts = filename.split('-');
                const id = parts[0];
                const originalName = parts.slice(1).join('-');
                const stats = fs.statSync(path.join(this.uploadDir, filename));
                
                return {
                    id,
                    originalName,
                    filename,
                    size: stats.size,
                    uploadTime: stats.mtime.toISOString()
                };
            });
            
            res.json({
                success: true,
                data: files
            });
        } catch (error) {
            console.error('❌ 获取文件列表错误:', error.message);
            res.status(500).json({
                success: false,
                message: '获取列表失败',
                error: error.message
            });
        }
    }
    
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = FileService;
