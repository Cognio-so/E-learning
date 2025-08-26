// Modified: MessageList.jsx (remove outer h-full overflow-y-auto to avoid nested scrolling; now handled by ChatBody)
'use client'

import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bot, 
  User, 
  Play, 
  Pause, 
  Copy 
} from 'lucide-react'

const MessageList = ({ messages, isTyping, onPlayVoice }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
            <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={message.type === 'user' ? '/api/avatar/user.jpg' : '/api/avatar/ai.jpg'} />
                <AvatarFallback className={message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.voiceUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayVoice(message.id)}
                      className="w-6 h-6 p-0 hover:bg-gray-100"
                    >
                      {message.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-gray-100">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="p-4 rounded-2xl bg-gray-100">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList