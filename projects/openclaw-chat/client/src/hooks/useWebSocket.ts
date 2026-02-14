import { useState, useEffect, useRef, useCallback } from 'react';
import type { WSMessage, ChatMessage, Message, ConnectionStatus } from '../types/message';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null
  });
  const [messages, setMessages] = useState<Message[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setStatus(prev => ({ ...prev, connecting: true, error: null }));
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 已连接');
        setStatus({ connected: true, connecting: false, error: null });
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          setMessages(prev => [...prev, message]);
        } catch (error) {
          console.error('解析消息失败:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket 已关闭');
        setStatus({ connected: false, connecting: false, error: null });
        wsRef.current = null;
        
        // 自动重连
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`尝试重连... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        } else {
          setStatus(prev => ({ 
            ...prev, 
            error: '连接失败，请检查服务器状态' 
          }));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        setStatus(prev => ({ 
          ...prev, 
          connecting: false, 
          error: '连接错误' 
        }));
      };
    } catch (error) {
      console.error('创建 WebSocket 失败:', error);
      setStatus(prev => ({ 
        ...prev, 
        connecting: false, 
        error: '无法连接到服务器' 
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: Omit<WSMessage, 'id' | 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WSMessage = {
        ...message,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };
      
      wsRef.current.send(JSON.stringify(fullMessage));
      
      // 如果是用户发送的消息，添加到本地消息列表
      if (message.type === 'chat') {
        setMessages(prev => [...prev, fullMessage as Message]);
      }
      
      return true;
    }
    return false;
  }, []);

  const sendChatMessage = useCallback((content: string) => {
    return sendMessage({
      type: 'chat',
      payload: {
        content,
        sender: 'user'
      }
    });
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    messages,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    clearMessages
  };
}
