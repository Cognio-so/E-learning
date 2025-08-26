'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Bot, 
  MoreVertical 
} from 'lucide-react'

const ChatHeader = ({ selectedMode }) => {
  return (
    <CardHeader className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Voice Coach</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online • Ready to help</span>
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode
          </Badge>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}

export default ChatHeader
