import { useState, useCallback } from 'react';

const API_URL = 'http://43.130.46.144:8080/api';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          url: `${API_URL}/download/${data.data.filename}`
        };
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      };
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploading,
    progress,
    uploadFile
  };
}

export function useFileDownload() {
  const [downloading, setDownloading] = useState(false);

  const downloadFile = useCallback(async (filename: string) => {
    setDownloading(true);

    try {
      const response = await fetch(`${API_URL}/download/${filename}`);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 创建临时链接并点击下载
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '下载失败'
      };
    } finally {
      setDownloading(false);
    }
  }, []);

  return {
    downloading,
    downloadFile
  };
}
