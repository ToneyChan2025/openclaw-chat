import React from 'react';
import { ChatContainer } from './components/ChatContainer';
import { MessageInput } from './components/MessageInput';
import { useWebSocket } from './hooks/useWebSocket';
import { useFileUpload } from './hooks/useFile';

function App() {
  const { status, messages, sendChatMessage } = useWebSocket();
  const { uploading, uploadFile } = useFileUpload();

  const handleSendMessage = (content: string) => {
    sendChatMessage(content);
  };

  const handleSendFile = async (file: File) => {
    const result = await uploadFile(file);
    if (result.success) {
      // 文件上传成功后，可以发送一条消息通知
      sendChatMessage(`[文件] ${file.name}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ChatContainer messages={messages} status={status} />
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        disabled={!status.connected}
        uploading={uploading}
      />
    </div>
  );
}

export default App;
