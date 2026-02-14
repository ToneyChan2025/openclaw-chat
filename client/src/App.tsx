import { useState, useEffect, useRef } from 'react'
import Chat from './components/Chat'
import './App.css'

function App() {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout>()

  // WebSocket 连接
  const connect = () => {
    const wsUrl = 'ws://localhost:3000'
    console.log('正在连接:', wsUrl)
    
    ws.current = new WebSocket(wsUrl)
    
    ws.current.onopen = () => {
      console.log('✅ WebSocket 连接成功')
      setConnected(true)
      // 发送欢迎消息
      addMessage({
        type: 'system',
        content: '已连接到服务器',
        time: new Date().toLocaleTimeString()
      })
    }
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 收到消息:', data)
        
        if (data.type === 'chat') {
          addMessage({
            type: 'received',
            content: data.payload.content,
            sender: data.payload.sender,
            time: new Date(data.timestamp).toLocaleTimeString()
          })
        } else if (data.type === 'system') {
          addMessage({
            type: 'system',
            content: data.payload.message,
            time: new Date().toLocaleTimeString()
          })
        }
      } catch (error) {
        console.error('消息解析错误:', error)
      }
    }
    
    ws.current.onclose = () => {
      console.log('🔌 连接断开')
      setConnected(false)
      // 自动重连
      reconnectTimer.current = setTimeout(connect, 3000)
    }
    
    ws.current.onerror = (error) => {
      console.error('❌ WebSocket 错误:', error)
    }
  }

  // 添加消息
  const addMessage = (msg: any) => {
    setMessages(prev => [...prev, msg])
  }

  // 发送消息
  const sendMessage = (content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat',
        id: Date.now().toString(),
        timestamp: Date.now(),
        payload: {
          content,
          sender: 'user'
        }
      }
      ws.current.send(JSON.stringify(message))
      
      // 添加到本地显示
      addMessage({
        type: 'sent',
        content,
        time: new Date().toLocaleTimeString()
      })
    }
  }

  // 组件挂载时连接
  useEffect(() => {
    connect()
    
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
      ws.current?.close()
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>OpenClaw Chat</h1>
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 已连接' : '🔴 未连接'}
        </div>
      </header>
      
      <main className="app-main">
        <Chat 
          messages={messages} 
          onSend={sendMessage}
          connected={connected}
        />
      </main>
    </div>
  )
}

export default App
