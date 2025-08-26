'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Star, 
  Zap, 
  Heart, 
  Lightbulb, 
  Brain 
} from 'lucide-react'

const CoachingSidebar = ({ 
  selectedMode, 
  setSelectedMode, 
  selectedSubject, 
  setSelectedSubject 
}) => {
  const coachingModes = [
    { id: 'teaching', name: 'Teaching Strategies', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'management', name: 'Classroom Management', icon: Target, color: 'bg-green-500' },
    { id: 'assessment', name: 'Assessment', icon: Star, color: 'bg-purple-500' },
    { id: 'technology', name: 'EdTech Integration', icon: Zap, color: 'bg-orange-500' },
    { id: 'wellness', name: 'Teacher Wellness', icon: Heart, color: 'bg-pink-500' }
  ]

  const subjects = [
    { id: 'general', name: 'General' },
    { id: 'math', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'english', name: 'English' },
    { id: 'history', name: 'History' },
    { id: 'art', name: 'Art' },
    { id: 'music', name: 'Music' },
    { id: 'pe', name: 'Physical Education' }
  ]

  return (
    <div className="space-y-6">
      {/* Coaching Modes */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Coaching Modes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {coachingModes.map((mode) => (
            <div
              key={mode.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedMode === mode.id
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${mode.color} rounded-full flex items-center justify-center`}>
                  <mode.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{mode.name}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subject Filter */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Subject</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-white/50 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-white/50 border-0">
            <Lightbulb className="w-4 h-4 mr-2" />
            Lesson Ideas
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white/50 border-0">
            <Target className="w-4 h-4 mr-2" />
            Assessment Tips
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white/50 border-0">
            <Brain className="w-4 h-4 mr-2" />
            Teaching Strategies
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white/50 border-0">
            <Heart className="w-4 h-4 mr-2" />
            Wellness Tips
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CoachingSidebar
