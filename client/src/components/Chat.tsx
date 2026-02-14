import { useState, useRef, useEffect } from 'react'
import './Chat.css'

interface Message {
  type: 'sent' | 'received' | 'system'
  content: string
  sender?: string
  time: string
}

interface ChatProps {
  messages: Message[]
  onSend: (content: string) => void
  connected: boolean
}

function Chat({ messages, onSend, connected }: ChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = () => {
    if (input.trim() && connected) {
      onSend(input.trim())
      setInput('')
    }
  }

  // 回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>👋 欢迎使用 OpenClaw Chat</p>
            <p>发送消息开始聊天</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.type}`}
            >
              <div className="message-content">
                {msg.type === 'system' ? (
                  <span className="system-text">{msg.content}</span>
                ) : (
                  <>
                    <div className="message-bubble">{msg.content}</div>
                    <div className="message-meta">
                      {msg.sender && <span className="sender">{msg.sender}</span>}
                      <span className="time">{msg.time}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={connected ? "输入消息..." : "等待连接..."}
          disabled={!connected}
          className="message-input"
        />
        <button 
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          className="send-button"
        >
          发送
        </button>
      </div>
    </div>
  )
}

export default Chat
