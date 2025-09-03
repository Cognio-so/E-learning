
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
  ExternalLink,
  CheckCircle2,
  XCircle,
  MinusCircle,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import useStudentStore from '@/store/useStudentStore'
import useProgressStore from '@/store/useProgressStore'
import useAuthStore from '@/store/useAuthStore'
import FeedbackDialog from '@/components/feedback-dialog'
import useFeedbackStore from '@/store/useFeedbackStore'

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

  const { getUserFeedback } = useFeedbackStore()
  const [selectedResourceForFeedback, setSelectedResourceForFeedback] = useState(null)
  const [selectedLessonForFeedback, setSelectedLessonForFeedback] = useState(null)

  const [playingCourse, setPlayingCourse] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Add feedback dialog state
  const [feedbackDialog, setFeedbackDialog] = useState({
    isOpen: false,
    resource: null,
    lesson: null
  })

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?._id) {
          await Promise.all([
            fetchStudentData(),
            fetchUserProgress(user._id),
            fetchLearningStats(user._id),
            getUserFeedback(user._id) // Load user feedback
          ])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load your learning data')
      }
    }

    loadData()
  }, [user?._id, fetchStudentData, fetchUserProgress, fetchLearningStats, getUserFeedback])

  // Enhanced data calculations
  const calculateEnhancedStats = () => {
    const totalLessons = studentLessons.length
    const totalResources = studentResources.length
    
    // Progress calculations
    const completedResources = userProgress.filter(p => p.progress >= 100)
    const activeResources = userProgress.filter(p => p.progress > 0 && p.progress < 100)
    const notStartedResources = totalResources - completedResources.length - activeResources.length
    
    // Assessment specific calculations
    const assessments = studentResources.filter(r => r.resourceType === 'assessment')
    const completedAssessments = assessments.filter(assessment => {
      const progress = userProgress.find(p => p.resourceId === (assessment._id || assessment.resourceId))
      return progress && progress.progress >= 100
    })
    
    const pendingAssessments = assessments.filter(assessment => {
      const progress = userProgress.find(p => p.resourceId === (assessment._id || assessment.resourceId))
      return !progress || progress.progress < 100
    })
    
    // Score calculations
    const assessmentScores = completedAssessments.map(assessment => {
      const progress = userProgress.find(p => p.resourceId === (assessment._id || assessment.resourceId))
      return progress?.score || 0
    })
    
    const averageScore = assessmentScores.length > 0 
      ? Math.round(assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length)
      : 0
    
    const totalScore = assessmentScores.reduce((sum, score) => sum + score, 0)
    const highestScore = assessmentScores.length > 0 ? Math.max(...assessmentScores) : 0
    
    // Subject breakdown
    const subjectProgress = {}
    studentResources.forEach(resource => {
      const subject = resource.subject || 'Other'
      if (!subjectProgress[subject]) {
        subjectProgress[subject] = { total: 0, completed: 0, score: 0 }
      }
      
      subjectProgress[subject].total++
      const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
      if (progress && progress.progress >= 100) {
        subjectProgress[subject].completed++
        if (progress.score) {
          subjectProgress[subject].score += progress.score
        }
      }
    })
    
    // Time calculations
    const totalTimeSpent = userProgress.reduce((total, p) => total + (p.timeSpent || 0), 0)
    const averageTimePerResource = totalResources > 0 ? Math.round(totalTimeSpent / totalResources) : 0
    
    // Streak and consistency
    const today = new Date().toDateString()
    const recentProgress = userProgress.filter(p => {
      const progressDate = new Date(p.updatedAt || p.completedAt || Date.now()).toDateString()
      const daysDiff = Math.ceil((new Date(today) - new Date(progressDate)) / (1000 * 60 * 60 * 24))
      return daysDiff <= 7
    })
    
    const weeklyActivity = recentProgress.length
    
    return {
      totalLessons,
      totalResources,
      completedResources: completedResources.length,
      activeResources: activeResources.length,
      notStartedResources,
      totalProgress: totalResources > 0 ? Math.round((completedResources.length / totalResources) * 100) : 0,
      
      // Assessment stats
      totalAssessments: assessments.length,
      completedAssessments: completedAssessments.length,
      pendingAssessments: pendingAssessments.length,
      assessmentCompletionRate: assessments.length > 0 ? Math.round((completedAssessments.length / assessments.length) * 100) : 0,
      
      // Score stats
      averageScore,
      totalScore,
      highestScore,
      scoreDistribution: {
        excellent: assessmentScores.filter(s => s >= 90).length,
        good: assessmentScores.filter(s => s >= 70 && s < 90).length,
        average: assessmentScores.filter(s => s >= 50 && s < 70).length,
        needsImprovement: assessmentScores.filter(s => s < 50).length
      },
      
      // Subject stats
      subjectProgress,
      
      // Time stats
      totalTimeSpent,
      averageTimePerResource,
      weeklyActivity,
      
      // Resource type breakdown
      resourceTypeBreakdown: {
        slides: studentResources.filter(r => r.resourceType === 'slides' || r.resourceType === 'slide').length,
        videos: studentResources.filter(r => r.resourceType === 'video').length,
        images: studentResources.filter(r => r.resourceType === 'image').length,
        comics: studentResources.filter(r => r.resourceType === 'comic').length,
        content: studentResources.filter(r => r.resourceType === 'content').length,
        assessments: assessments.length
      }
    }
  }

  const stats = calculateEnhancedStats()

  // Calculate additional variables needed for the UI
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

  // Handle feedback submission
  const handleFeedback = (resource, lesson = null) => {
    console.log('Feedback button clicked:', { resource, lesson })
    setFeedbackDialog({
      isOpen: true,
      resource,
      lesson
    })
    console.log('Feedback dialog state set:', { isOpen: true, resource, lesson })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 mx-auto max-w-7xl p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8">
        
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-lg sm:text-xl font-bold">
                      {user?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 dark:text-white">
                    Welcome back, {user?.name?.split(' ')[0] || 'Student'}
                  </h1>
                  <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
                    Ready to continue your amazing learning journey? ✨
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 animate-pulse">📊</div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 dark:text-white">{stats.totalProgress}%</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">Overall Progress</p>
                </div>
              </Card>
              
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 animate-pulse">🎯</div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 dark:text-white">{stats.averageScore}%</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">Avg Score</p>
                </div>
              </Card>
              
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 animate-pulse">🔥</div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 dark:text-white">{stats.weeklyActivity}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">Weekly Activity</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="overview" className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assessments" className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs sm:text-sm">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs sm:text-sm">
              <Flame className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Active
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs sm:text-sm">
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
            {/* Enhanced Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">📚</div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black">{stats.totalLessons}</p>
                  <p className="text-sm lg:text-base font-bold">Total Lessons</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">✅</div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black">{stats.completedResources}</p>
                  <p className="text-sm lg:text-base font-bold">Completed</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">📊</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black">{stats.totalProgress}%</div>  
                  <p className="text-sm lg:text-base font-bold">Progress</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden transform hover:scale-105 transition-all">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">⭐</div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black">{stats.averageScore}%</p>
                  <p className="text-sm lg:text-base font-bold">Avg Score</p>
                </CardContent>
              </Card>
            </div>

            {/* Assessment Overview */}
            <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white p-6">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Assessment Overview 📝
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{stats.totalAssessments}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Total Assessments</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{stats.completedAssessments}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-2xl">
                    <div className="text-3xl mb-2">⏳</div>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{stats.pendingAssessments}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Pending</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Assessment Completion Rate</span>
                    <span className="font-black text-blue-600">{stats.assessmentCompletionRate}%</span>
                  </div>
                  <Progress value={stats.assessmentCompletionRate} className="h-3" />
                </div>
              </CardContent>
            </Card>

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
                        <div className="flex flex-col gap-2">
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
                          
                          {/* Add Feedback Button for completed resources */}
                          {progress && progress.progress >= 100 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs"
                              onClick={() => handleFeedback(resource)}
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />
                              Feedback
                            </Button>
                          )}
                        </div>
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

          {/* New Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                Your Assessment Results 📊
                <span className="text-xl sm:text-2xl animate-pulse">✨</span>
              </h2>
              <Button 
                variant="outline"
                className="rounded-xl lg:rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all text-sm lg:text-base"
                onClick={() => window.location.href = '/student/learning-library'}
              >
                See All →
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Completed Assessments */}
              <Card className="border-0 shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 lg:p-6">
                  <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    Completed Assessments ✅
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  {(() => {
                    const completedAssessments = studentResources
                      .filter(resource => resource.resourceType === 'assessment')
                      .filter(resource => {
                        const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
                        return progress && progress.progress >= 100
                      })

                    if (completedAssessments.length > 0) {
                      return (
                        <div className="space-y-4">
                          {completedAssessments.map((assessment, index) => {
                            const progress = userProgress.find(p => p.resourceId === (assessment._id || assessment.resourceId))
                            const score = progress?.score || 0
                            
                            return (
                              <div key={generateUniqueKey(assessment, index)} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl shadow-lg">
                                <div className="text-3xl">📝</div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 dark:text-white">{assessment.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{assessment.subject}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs font-bold">
                                      Score: {score}%
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-bold">
                                      {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Needs Improvement'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-black text-green-600">{score}%</div>
                                  <div className="text-sm text-gray-500">Score</div>
                                  {/* Add feedback button for completed assessments */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFeedback(assessment, null)}
                                    className="mt-2 text-xs"
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Feedback
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">📝</div>
                          <p className="text-xl text-gray-600 dark:text-gray-300 font-bold mb-4">No completed assessments yet!</p>
                          <p className="text-gray-500 dark:text-gray-400">Complete some assessments to see your results here!</p>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>

              {/* Pending Assessments */}
              <Card className="border-0 shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 lg:p-6">
                  <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                    Pending Assessments 🎯
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  {(() => {
                    const pendingAssessments = studentResources
                      .filter(resource => resource.resourceType === 'assessment')
                      .filter(resource => {
                        const progress = userProgress.find(p => p.resourceId === (resource._id || resource.resourceId))
                        return !progress || progress.progress < 100
                      })

                    if (pendingAssessments.length > 0) {
                      return (
                        <div className="space-y-4">
                          {pendingAssessments.map((assessment, index) => (
                            <div key={generateUniqueKey(assessment, index)} className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-2xl shadow-lg">
                              <div className="text-3xl">📝</div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-white">{assessment.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{assessment.subject}</p>
                                <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 text-xs font-bold mt-2">
                                  Pending
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
                          <div className="text-6xl mb-4 animate-bounce">🎉</div>
                          <p className="text-xl text-gray-600 dark:text-gray-300 font-bold mb-4">All assessments completed!</p>
                          <p className="text-gray-500 dark:text-gray-400">Great job! You've completed all available assessments!</p>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
            {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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
                      className="border-0 shadow-xl lg:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl overflow-hidden group"
                  >
                      <div className={`relative h-24 sm:h-28 lg:h-32 bg-gradient-to-r ${config.gradient} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 left-6 w-8 h-8 bg-white rounded-full animate-pulse"></div>
                          <div className="absolute top-8 right-8 w-6 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute bottom-6 left-10 w-10 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                      
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                          <div className="text-3xl sm:text-4xl lg:text-5xl transform transition-transform duration-300 group-hover:scale-110 animate-bounce" style={{ animationDuration: '2s' }}>
                            {config.emoji}
                        </div>
                        <div className="text-white text-center sm:text-left">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-black">{lesson.title}</h3>
                            <p className="text-sm sm:text-base text-white/90 font-bold">{lesson.description}</p>
                        </div>
                      </div>
                    </div>
                    
                      <CardContent className="p-6 lg:p-8 space-y-4 lg:space-y-6">
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
                      
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
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
                            onClick={() => handleFeedback(null, lesson)}
                          >
                            <MessageSquare className="mr-2 h-5 w-5" /> 
                            Feedback 📝
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
              <div className="text-center py-12 lg:py-16">
                <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 lg:mb-6 animate-bounce">🎓</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3 lg:mb-4">No Active Courses</h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 lg:mb-8">Start your learning journey to see active courses here!</p>
                <Button 
                  className="rounded-2xl lg:rounded-3xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-base sm:text-lg px-6 lg:px-8 py-3 lg:py-4 shadow-xl lg:shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  onClick={() => window.location.href = '/student/learning-library'}
                >
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Learning! 🚀
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                Discover New Learning 🌟
                <span className="text-xl sm:text-2xl animate-pulse">✨</span>
              </h2>
              <Button 
                variant="outline"
                className="rounded-xl lg:rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all text-sm lg:text-base"
                onClick={() => window.location.href = '/student/learning-library'}
              >
                See All →
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {recommendations.map((resource, index) => {
                const config = subjectConfig[resource.subject] || subjectConfig['Computer Science']
                
                return (
                  <Card key={generateUniqueKey(resource, index)} className="border-0 shadow-lg lg:shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl overflow-hidden group">
                    <div className={`relative h-20 sm:h-24 bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden`}>
                      <div className="text-3xl sm:text-4xl transform transition-transform duration-300 group-hover:scale-110 animate-pulse">
                        {config.emoji}
                    </div>
                  </div>
                    <CardContent className="p-4 lg:p-6">
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base line-clamp-2 mb-3">
                      {resource.title}
                    </h4>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-xs font-bold`}>
                        {resource.subject}
                      </Badge>
                        <Badge variant="outline" className="text-xs font-bold">
                        {resource.resourceType}
                      </Badge>
                    </div>
                    <Button 
                        className="w-full rounded-2xl lg:rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-xs sm:text-sm py-2 lg:py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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

          {/* Enhanced Stats Tab */}
          <TabsContent value="stats" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Enhanced Learning Analytics */}
              <Card className="border-0 shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white p-4 lg:p-6">
                  <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                    Learning Analytics 📊
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="text-center p-3 lg:p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-xl lg:rounded-2xl">
                      <div className="text-2xl sm:text-3xl mb-2">📚</div>
                      <p className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white">{stats.totalLessons}</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">Total Lessons</p>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl lg:rounded-2xl">
                      <div className="text-2xl sm:text-3xl mb-2">✅</div>
                      <p className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white">{stats.completedResources}</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">Completed</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Target className="h-4 w-4 text-violet-500" />
                        Completion Rate
                      </span>
                      <span className="font-black text-violet-600">{stats.totalProgress}%</span>
                    </div>
                    <Progress value={stats.totalProgress} className="h-3" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Assessment Completion</span>
                      <span className="font-black text-blue-600">{stats.assessmentCompletionRate}%</span>
                    </div>
                    <Progress value={stats.assessmentCompletionRate} className="h-3" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Enhanced Achievements */}
              <Card className="border-0 shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 lg:p-6">
                  <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                    Achievements 🏆
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-2xl">
                      <div className="text-3xl">🎯</div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">First Steps</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Complete your first lesson</p>
                      </div>
                      <Badge className={`${stats.completedResources > 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {stats.completedResources > 0 ? 'Earned' : 'Locked'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-2xl">
                      <div className="text-3xl">🔥</div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">Streak Master</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">7 day learning streak</p>
                      </div>
                      <Badge className={`${stats.weeklyActivity >= 7 ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {stats.weeklyActivity >= 7 ? 'Earned' : 'In Progress'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl">
                      <div className="text-3xl">⭐</div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">High Achiever</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Score 90%+ on assessments</p>
                      </div>
                      <Badge className={`${stats.scoreDistribution.excellent > 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {stats.scoreDistribution.excellent > 0 ? 'Earned' : 'Locked'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Score Distribution Chart */}
            <Card className="border-0 shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-400 to-rose-500 text-white p-4 lg:p-6">
                <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                  Score Distribution 📊
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl">
                    <div className="text-2xl mb-2">🏆</div>
                    <p className="text-xl font-black text-gray-800 dark:text-white">{stats.scoreDistribution.excellent}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">90%+ (Excellent)</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl">
                    <div className="text-2xl mb-2">👍</div>
                    <p className="text-xl font-black text-gray-800 dark:text-white">{stats.scoreDistribution.good}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">70-89% (Good)</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-2xl">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-xl font-black text-gray-800 dark:text-white">{stats.scoreDistribution.average}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">50-69% (Average)</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-2xl">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-xl font-black text-gray-800 dark:text-white">{stats.scoreDistribution.needsImprovement}</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">&lt;50% (Improve)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Motivational Message */}
        <div className="text-center">
          <Card className="border-0 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 text-white max-w-sm sm:max-w-lg mx-auto overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 lg:p-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 lg:mb-4 animate-bounce">🌟</div>
              <p className="text-lg sm:text-xl lg:text-2xl font-black mb-2 lg:mb-3">Keep Going, Superstar! </p>
              <p className="font-bold text-sm sm:text-base lg:text-lg">You're doing an amazing job learning! 🎉✨</p>
              <div className="flex justify-center gap-2 mt-3 lg:mt-4">
                <span className="text-xl sm:text-2xl animate-pulse">🚀</span>
                <span className="text-xl sm:text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</span>
                <span className="text-xl sm:text-2xl animate-pulse" style={{ animationDelay: '1s' }}>🎯</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Dialog */}
        <FeedbackDialog
          isOpen={feedbackDialog.isOpen}
          onClose={() => setFeedbackDialog({ isOpen: false, resource: null, lesson: null })}
          resource={feedbackDialog.resource}
          lesson={feedbackDialog.lesson}
        />
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