import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../utils/cn';
import type { ChatMessage } from '../types/message';
import { User, Bot, FileText } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.payload.sender === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary-500" : "bg-gray-200"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600" />
        )}
      </div>

      <div
        className={cn(
          "message-bubble",
          isUser ? "message-bubble-user" : "message-bubble-ai"
        )}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.payload.content}
          </ReactMarkdown>
        </div>
        <div
          className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-100" : "text-gray-400"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
