'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Mic, 
  MicOff, 
  Send, 
  Smile 
} from 'lucide-react'

const MessageInput = ({ onSendMessage, onVoiceRecord, isRecording, isListening }) => {
  const [currentMessage, setCurrentMessage] = useState('')

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return
    onSendMessage(currentMessage)
    setCurrentMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceRecord = () => {
    if (isRecording) {
      onVoiceRecord('stop')
    } else {
      onVoiceRecord('start')
    }
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            className="pr-12 bg-white/70 border-0 focus:ring-2 focus:ring-purple-500 rounded-xl"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 hover:bg-gray-100"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleVoiceRecord}
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        
        <Button
          onClick={handleSendMessage}
          disabled={!currentMessage.trim()}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Voice Status */}
      {isRecording && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Recording... Speak now</span>
        </div>
      )}
      
      {isListening && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Processing your voice...</span>
        </div>
      )}
    </div>
  )
}

export default MessageInput
