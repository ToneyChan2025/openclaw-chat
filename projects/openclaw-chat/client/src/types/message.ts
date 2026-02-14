/**
 * WebSocket 消息类型定义
 */

export type MessageType = 'chat' | 'file' | 'system' | 'heartbeat' | 'heartbeat_ack';

export interface WSMessage {
  type: MessageType;
  id: string;
  timestamp: number;
  payload: any;
}

export interface ChatMessage extends WSMessage {
  type: 'chat';
  payload: {
    content: string;
    sender: 'user' | 'openclaw';
  };
}

export interface FileMessage extends WSMessage {
  type: 'file';
  payload: {
    filename: string;
    size: number;
    mimeType: string;
    url?: string;
    data?: ArrayBuffer;
  };
}

export interface SystemMessage extends WSMessage {
  type: 'system';
  payload: {
    event: 'connected' | 'disconnected' | 'error' | 'reconnecting';
    message: string;
  };
}

export type Message = ChatMessage | FileMessage | SystemMessage;

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}
