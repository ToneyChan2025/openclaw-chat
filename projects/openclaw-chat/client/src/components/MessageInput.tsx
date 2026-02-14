import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendFile?: (file: File) => void;
  disabled?: boolean;
  uploading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  disabled = false,
  uploading = false
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (selectedFile && onSendFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
    }
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {selectedFile && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-100 rounded-lg">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
          ) : (
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(
            "p-3 rounded-xl transition-colors",
            disabled || uploading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Shift+Enter 换行)"
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 px-4 py-3 rounded-xl border resize-none outline-none transition-colors",
            disabled
              ? "bg-gray-50 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          )}
        />

        <button
          onClick={handleSend}
          disabled={disabled || uploading || (!message.trim() && !selectedFile)}
          className={cn(
            "p-3 rounded-xl transition-colors",
            disabled || uploading || (!message.trim() && !selectedFile)
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-primary-500 text-white hover:bg-primary-600"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
