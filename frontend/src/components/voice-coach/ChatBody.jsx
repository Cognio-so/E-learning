// New component: ChatBody.jsx (the overall container for message list and input to handle layout and prevent overflow issues)
'use client'

import MessageList from '@/components/voice-coach/MessageList'
import MessageInput from '@/components/voice-coach/MessageInput'

const ChatBody = ({ 
  messages, 
  isTyping, 
  onPlayVoice, 
  onSendMessage, 
  onVoiceRecord, 
  isRecording, 
  isListening 
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          onPlayVoice={onPlayVoice}
        />
      </div>
      <MessageInput
        onSendMessage={onSendMessage}
        onVoiceRecord={onVoiceRecord}
        isRecording={isRecording}
        isListening={isListening}
      />
    </div>
  )
}

export default ChatBody