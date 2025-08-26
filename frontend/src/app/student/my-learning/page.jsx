
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Clock, 
  Bookmark, 
  Star, 
  Award, 
  Rocket, 
  Loader2, 
  BookOpen, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Heart, 
  Trophy, 
  Crown,
  Calendar,
  Users,
  BarChart3,
  Lightbulb,
  Brain,
  Target as TargetIcon,
  Flame,
  BookMarked,
  GraduationCap,
  Medal,
  Crown as CrownIcon,
  ArrowRight,
  ChevronRight,
  Eye,
  Timer,
  BookText,
  Video,
  Image as ImageIcon,
  Gamepad2,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import useStudentStore from '@/store/useStudentStore'
import useProgressStore from '@/store/useProgressStore'
import useAuthStore from '@/store/useAuthStore'

// Modern gradient system
const gradients = {
  primary: 'from-violet-500 via-purple-500 to-fuchsia-500',
  secondary: 'from-blue-500 via-cyan-500 to-teal-500',
  success: 'from-emerald-400 via-teal-500 to-cyan-500',
  warning: 'from-amber-400 via-orange-500 to-red-500',
  danger: 'from-red-400 via-pink-500 to-rose-500',
  info: 'from-sky-400 via-blue-500 to-indigo-500'
}

// Subject-specific gradients and icons
const subjectConfig = {
  English: {
    gradient: 'from-pink-400 via-rose-400 to-red-500',
    icon: '📚',
    emoji: '👩‍🏫',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950'
  },
  Math: {
    gradient: 'from-yellow-400 via-orange-400 to-red-500',
    icon: '🔢',
    emoji: '🧠',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  },
  Science: {
    gradient: 'from-green-400 via-emerald-400 to-teal-500',
    icon: '🧪',
    emoji: '👨‍🚀',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950'
  },
  History: {
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    icon: '🏛️',
    emoji: '👴',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950'
  },
  Art: {
    gradient: 'from-purple-400 via-pink-400 to-rose-500',
    icon: '🎨',
    emoji: '👩‍🎨',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  Geography: {
    gradient: 'from-blue-400 via-cyan-400 to-teal-500',
    icon: '🌍',
    emoji: '🗺️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  Physics: {
    gradient: 'from-indigo-400 via-purple-400 to-violet-500',
    icon: '⚛️',
    emoji: '👨‍🔬',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950'
  },
  Chemistry: {
    gradient: 'from-teal-400 via-emerald-400 to-green-500',
    icon: '🧬',
    emoji: '⚗️',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950'
  },
  Biology: {
    gradient: 'from-lime-400 via-green-400 to-emerald-500',
    icon: '🌱',
    emoji: '👨‍🔬',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50 dark:bg-lime-950'
  },
  'Computer Science': {
    gradient: 'from-slate-400 via-blue-400 to-indigo-500',
    icon: '💻',
    emoji: '👨‍💻',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-950'
  }
}

// Animated background particles
const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950" />
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 4}s`
        }}
      >
        <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full opacity-60" />
    </div>
    ))}
    <style jsx>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
        50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
    `}</style>
  </div>
)

// Loading component with modern design
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Rocket className="h-8 w-8 text-violet-500 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
          Loading your learning journey...
        </p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
)

// Error component with modern design
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 flex items-center justify-center">
    <div className="text-center space-y-6 max-w-md mx-auto p-8">
      <div className="relative">
        <div className="text-6xl mb-4 animate-bounce">🤔</div>
        <div className="absolute -top-2 -right-2 text-2xl animate-spin">⚡</div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Oops! 🤔</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300">Something went a little wrong, but don't worry!</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      <Button 
        onClick={onRetry} 
        className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold text-lg px-8 py-3 rounded-2xl hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg"
      >
        <Zap className="mr-2 h-5 w-5" />
        Try Again! 🚀
      </Button>
    </div>
  </div>
)

// Helper function to generate unique keys
const generateUniqueKey = (resource, index) => {
  const baseId = resource._id || resource.resourceId || resource.id
  const resourceType = resource.resourceType || 'unknown'
  const lessonId = resource.lessonId || 'no-lesson'
  return `${baseId}-${resourceType}-${lessonId}-${index}`
}

// Main Component
function MyLearningContent() {
  const { user } = useAuthStore()
  const { 
    studentLessons, 
    studentResources, 
    isLoading: studentLoading, 
    error: studentError,
    fetchStudentData 
  } = useStudentStore()
  
  const { 
    userProgress, 
    learningStats, 
    isLoading: progressLoading, 
    error: progressError,
    fetchUserProgress,
    fetchLearningStats,
    startLearning,
    updateProgress
  } = useProgressStore()

  const [playingCourse, setPlayingCourse] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?._id) {
          await Promise.all([
            fetchStudentData(),
            fetchUserProgress(user._id),
            fetchLearningStats(user._id)
          ])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load your learning data')
      }
    }

    loadData()
  }, [user?._id, fetchStudentData, fetchUserProgress, fetchLearningStats])

  // Handle starting a resource
  const handleStartResource = async (resource) => {
    if (!user?._id) {
      toast.error('Please log in to continue learning')
      return
    }

    setIsUpdating(true)
    try {
      await startLearning(
        user._id,
        resource._id || resource.resourceId,
        resource.resourceType,
        resource.lessonId
      )
      
      toast.success(`🚀 Started learning ${resource.title}!`)
      setPlayingCourse(resource._id || resource.resourceId)
    } catch (error) {
      console.error('Error starting resource:', error)
      toast.error('Failed to start learning')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle progress update
  const handleProgressUpdate = async (resource, progress = 50) => {
    if (!user?._id) return

    setIsUpdating(true)
    try {
      await updateProgress(
        user._id,
        resource._id || resource.resourceId,
        progress
      )
      toast.success('🎉 Progress updated!')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    } finally {
      setIsUpdating(false)
    }
  }

  // Show loading state
  if (studentLoading || progressLoading) {
    return <LoadingSpinner />
  }

  // Show error state
  if (studentError || progressError) {
    return (
      <ErrorDisplay 
        error={studentError || progressError} 
        onRetry={() => {
          if (user?._id) {
            fetchStudentData()
            fetchUserProgress(user._id)
            fetchLearningStats(user._id)
          }
        }}
      />
    )
  }

  // Calculate statistics
  const totalLessons = studentLessons.length
  const totalResources = studentResources.length
  const completedResources = userProgress.filter(p => p.progress >= 100).length
  const activeResources = userProgress.filter(p => p.progress > 0 && p.progress < 100).length
  const totalProgress = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0

  // Get next lessons (resources with low or no progress)
  const nextLessons = studentResources
    .filter(resource => {
      const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
      return !progress || progress.progress < 50
    })
    .slice(0, 3)

  // Get active courses (lessons with some progress)
  const activeCourses = studentLessons.filter(lesson => {
    const lessonResources = studentResources.filter(r => r.lessonId === lesson._id)
    const hasProgress = lessonResources.some(resource => {
      const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
      return progress && progress.progress > 0
    })
    return hasProgress
  })

  // Get recommendations (resources not started)
  const recommendations = studentResources
    .filter(resource => {
      const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
      return !progress || progress.progress === 0
    })
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        
        {/* Modern Header Section */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
        <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xl font-bold">
                      {user?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white">
                    Welcome back, {user?.name?.split(' ')[0] || 'Student'}
              </h1>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    Ready to continue your amazing learning journey? ✨
              </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Card className="border-0 rounded-3xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-pulse">📊</div>
                  <p className="text-3xl font-black text-gray-800 dark:text-white">{totalProgress}%</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Overall Progress</p>
                </div>
              </Card>
              
              <Card className="border-0 rounded-3xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-pulse">🔥</div>
                  <p className="text-3xl font-black text-gray-800 dark:text-white">{learningStats?.streak || 0}</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Day Streak</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Modern Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Flame className="h-4 w-4 mr-2" />
              Active
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Lightbulb className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-3xl font-black">{totalLessons}</p>
                  <p className="font-bold">Total Lessons</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-3xl font-black">{completedResources}</p>
                  <p className="font-bold">Completed</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">⏰</div>
                  <p className="text-3xl font-black">{learningStats?.totalTimeSpent || 0}</p>
                  <p className="font-bold">Minutes</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="text-3xl font-black">{learningStats?.averageScore || 0}%</p>
                  <p className="font-bold">Avg Score</p>
                </CardContent>
              </Card>
            </div>

            {/* Next Lessons & Pending Assessments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Next Lessons */}
              <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-6">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <BookOpen className="h-6 w-6" />
                    Continue Learning 📖
              </CardTitle>
                </CardHeader>
            <CardContent className="p-6">
              {nextLessons.length > 0 ? (
                <div className="space-y-4">
                  {nextLessons.map((resource, index) => {
                    const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
                    const progressPercent = progress ? progress.progress : 0
                        const config = subjectConfig[resource.subject] || subjectConfig['Computer Science']
                    
                    return (
                          <div key={generateUniqueKey(resource, index)} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${config.gradient} flex items-center justify-center text-2xl`}>
                              {config.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white">{resource.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{resource.lessonTitle || resource.topic}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-xs font-bold`}>
                              {resource.subject}
                            </Badge>
                                <Badge variant="outline" className="text-xs font-bold">
                              {resource.resourceType}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                          onClick={() => handleStartResource(resource)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-1 h-4 w-4" />
                          )}
                          Continue
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4 animate-bounce">🎯</div>
                      <p className="text-xl text-gray-600 dark:text-gray-300 font-bold mb-4">No pending lessons!</p>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Start learning something new and exciting!</p>
                  <Button 
                        className="rounded-3xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                    onClick={() => window.location.href = '/student/learning-library'}
                  >
                        <Rocket className="mr-2 h-5 w-5" />
                    Explore Library 📚
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

              {/* Pending Assessments */}
              <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <Target className="h-6 w-6" />
                Pending Assessments 🎯
              </CardTitle>
                </CardHeader>
            <CardContent className="p-6">
              {(() => {
                const pendingAssessments = studentResources
                  .filter(resource => resource.resourceType === 'assessment')
                  .filter(resource => {
                    const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
                    return !progress || progress.progress < 100
                  })
                  .slice(0, 3)

                if (pendingAssessments.length > 0) {
                  return (
                    <div className="space-y-4">
                      {pendingAssessments.map((assessment, index) => (
                            <div key={generateUniqueKey(assessment, index)} className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                          <div className="text-3xl">📝</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white">{assessment.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{assessment.lessonTitle}</p>
                                <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 text-xs font-bold mt-2">
                              Assessment
                            </Badge>
                          </div>
                          <Button 
                                className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            onClick={() => handleStartResource(assessment)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Target className="mr-1 h-4 w-4" />
                            )}
                            Take Quiz
                          </Button>
                        </div>
                      ))}
                    </div>
                  )
                } else {
                  return (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4 animate-bounce">📝</div>
                          <p className="text-xl text-gray-600 dark:text-gray-300 font-bold mb-4">No pending assessments!</p>
                          <p className="text-gray-500 dark:text-gray-400">Complete lessons to unlock assessments!</p>
                    </div>
                  )
                }
              })()}
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active" className="space-y-8 mt-8">
            {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeCourses.map((lesson, lessonIndex) => {
                const lessonResources = studentResources.filter(r => r.lessonId === lesson._id)
                const completedResources = lessonResources.filter(resource => {
                  const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
                  return progress && progress.progress >= 100
                }).length
                
                const overallProgress = lessonResources.length > 0 
                  ? Math.round((completedResources / lessonResources.length) * 100)
                  : 0

                  const config = subjectConfig[lesson.subject] || subjectConfig['Computer Science']

                return (
                  <Card 
                    key={`lesson-${lesson._id}-${lessonIndex}`} 
                      className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden group"
                  >
                      <div className={`relative h-32 bg-gradient-to-r ${config.gradient} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 left-6 w-8 h-8 bg-white rounded-full animate-pulse"></div>
                          <div className="absolute top-8 right-8 w-6 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute bottom-6 left-10 w-10 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                      
                        <div className="relative z-10 flex items-center gap-6">
                          <div className="text-5xl transform transition-transform duration-300 group-hover:scale-110 animate-bounce" style={{ animationDuration: '2s' }}>
                            {config.emoji}
                        </div>
                        <div className="text-white">
                            <h3 className="text-2xl font-black">{lesson.title}</h3>
                            <p className="text-white/90 font-bold">{lesson.description}</p>
                        </div>
                      </div>
                    </div>
                    
                      <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                            <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 font-bold mb-3 text-sm`}>
                              {lesson.subject} {config.icon}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4" /> 
                            {lessonResources.length} resources
                          </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-gray-800 dark:text-white">{overallProgress}%</div>
                          <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                            {completedResources}/{lessonResources.length} completed
                          </div>
                        </div>
                      </div>
                      
                        <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span className="text-gray-700 dark:text-gray-300">Progress</span>
                            <span className="text-violet-600 font-black">{overallProgress}% Complete! 🎯</span>
                        </div>
                          <Progress value={overallProgress} className="h-4" />
                      </div>
                      
                        <div className="grid grid-cols-2 gap-4">
                        <Button 
                            className={`w-full rounded-2xl font-bold transform hover:scale-105 transition-all shadow-lg hover:shadow-xl text-lg py-3 ${
                            playingCourse === lesson._id 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                : `bg-gradient-to-r ${config.gradient}`
                          } border-0 text-white`}
                          onClick={() => {
                            const nextResource = lessonResources.find(resource => {
                              const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
                              return !progress || progress.progress < 100
                            })
                            
                            if (nextResource) {
                              handleStartResource(nextResource)
                              setPlayingCourse(playingCourse === lesson._id ? null : lesson._id)
                            }
                          }}
                          disabled={isUpdating}
                        >
                          {playingCourse === lesson._id ? (
                            <>
                                <Pause className="mr-2 h-5 w-5" /> 
                              Pause ⏸️
                            </>
                          ) : (
                            <>
                                <Play className="mr-2 h-5 w-5" /> 
                              Continue! 🚀
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                            className="w-full rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all text-lg py-3"
                        >
                            <Star className="mr-2 h-5 w-5" /> 
                          Review 📝
                        </Button>
                      </div>
                      
                      {overallProgress >= 75 && (
                          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 rounded-2xl p-4 text-center transform hover:scale-105 transition-all">
                            <div className="flex items-center justify-center gap-3 text-orange-600 dark:text-orange-300 font-bold text-lg">
                              <Trophy className="h-6 w-6" />
                            <span>Almost Done! You're a champion! 🏆</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-6 animate-bounce">🎓</div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">No Active Courses</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Start your learning journey to see active courses here!</p>
                <Button 
                  className="rounded-3xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  onClick={() => window.location.href = '/student/learning-library'}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Learning! 🚀
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-8 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                Discover New Learning 🌟
                <span className="text-2xl animate-pulse">✨</span>
              </h2>
              <Button 
                variant="outline"
                className="rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all"
                onClick={() => window.location.href = '/student/learning-library'}
              >
                See All →
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((resource, index) => {
                const config = subjectConfig[resource.subject] || subjectConfig['Computer Science']
                
                return (
                  <Card key={generateUniqueKey(resource, index)} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden group">
                    <div className={`relative h-24 bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden`}>
                      <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110 animate-pulse">
                        {config.emoji}
                    </div>
                  </div>
                    <CardContent className="p-6">
                      <h4 className="font-bold text-gray-800 dark:text-white text-base line-clamp-2 mb-3">
                      {resource.title}
                    </h4>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-xs font-bold`}>
                        {resource.subject}
                      </Badge>
                        <Badge variant="outline" className="text-xs font-bold">
                        {resource.resourceType}
                      </Badge>
                    </div>
                    <Button 
                        className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      onClick={() => handleStartResource(resource)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <Play className="mr-2 h-4 w-4" />
                      )}
                        Start Learning! 🚀
                    </Button>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Learning Analytics */}
              <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white p-6">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <BarChart3 className="h-6 w-6" />
                    Learning Analytics 📊
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-2xl">
                      <div className="text-3xl mb-2">📚</div>
                      <p className="text-2xl font-black text-gray-800 dark:text-white">{totalLessons}</p>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Total Lessons</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-2xl">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="text-2xl font-black text-gray-800 dark:text-white">{completedResources}</p>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Completed</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Completion Rate</span>
                      <span className="font-black text-violet-600">{totalProgress}%</span>
                    </div>
                    <Progress value={totalProgress} className="h-3" />
                  </div>
            </CardContent>
          </Card>
          
              {/* Achievements */}
              <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-6">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <Trophy className="h-6 w-6" />
                    Achievements 🏆
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-2xl">
                      <div className="text-3xl">🎯</div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">First Steps</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Complete your first lesson</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Earned</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-2xl">
                      <div className="text-3xl">🔥</div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">Streak Master</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">7 day learning streak</p>
                      </div>
                      <Badge variant="outline" className="text-gray-500">In Progress</Badge>
                    </div>
                  </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>
        </Tabs>

        {/* Motivational Message */}
        <div className="text-center">
          <Card className="border-0 rounded-3xl shadow-2xl bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 text-white max-w-lg mx-auto overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-8">
              <div className="text-6xl mb-4 animate-bounce">🌟</div>
              <p className="text-2xl font-black mb-3">Keep Going, Superstar! </p>
              <p className="font-bold text-lg">You're doing an amazing job learning! 🎉✨</p>
              <div className="flex justify-center gap-2 mt-4">
                <span className="text-2xl animate-pulse">🚀</span>
                <span className="text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</span>
                <span className="text-2xl animate-pulse" style={{ animationDelay: '1s' }}>🎯</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function MyLearningPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyLearningContent />
    </Suspense>
  )
}