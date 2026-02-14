import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ConnectionIndicator } from './ConnectionIndicator';
import type { Message, ConnectionStatus } from '../types/message';
import { Bot } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  status: ConnectionStatus;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  status 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMessages = messages.filter(m => m.type === 'chat');

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">OpenClaw Chat</h1>
            <p className="text-sm text-gray-500">AI 智能助手</p>
          </div>
        </div>
        <ConnectionIndicator status={status} />
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Bot className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">开始对话</p>
            <p className="text-sm">发送消息与 OpenClaw AI 开始交流</p>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
