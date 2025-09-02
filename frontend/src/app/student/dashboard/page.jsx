'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  BookOpen, 
  Award,
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Crown,
  Medal,
  Gift,
  Rocket,
  Rainbow,
  Heart,
  Moon,
  Sun,
  Cloud,
  Lightning,
  Fire,
  Ice,
  Diamond,
  Brain,
  Gamepad2,
  Palette,
  Music,
  Camera,
  Video,
  Users,
  BarChart3,
  Flame,
  BookMarked,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Eye,
  Timer,
  BookText,
  Image as ImageIcon,
  ExternalLink,
  Play,
  Pause,
  Loader2,
  LogOut
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useProgressStore from '@/store/useProgressStore'
import useStudentStore from '@/store/useStudentStore'
import { toast } from 'sonner'

// Fun gradients for kids UI
const kidGradients = {
  purple: "from-violet-500 via-purple-500 to-indigo-500",
  orange: "from-amber-400 via-orange-500 to-pink-500",
  blue: "from-blue-400 via-cyan-500 to-sky-500",
  green: "from-emerald-400 via-green-500 to-teal-500",
  pink: "from-pink-400 via-rose-500 to-fuchsia-500",
  yellow: "from-yellow-400 via-orange-500 to-red-500",
  rainbow: "from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400"
}

// Subject configurations with fun emojis and colors
const subjectConfig = {
  English: {
    gradient: 'from-pink-400 via-rose-400 to-red-500',
    icon: '📚',
    emoji: '👩‍🎓',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950'
  },
  Math: {
    gradient: 'from-yellow-400 via-orange-400 to-red-500',
    icon: '🔢',
    emoji: '👨‍🎓',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  },
  Science: {
    gradient: 'from-green-400 via-emerald-400 to-teal-500',
    icon: '🧪',
    emoji: '👨‍🎓',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950'
  },
  History: {
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    icon: '🏛️',
    emoji: '👨‍🎓',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950'
  },
  Art: {
    gradient: 'from-purple-400 via-pink-400 to-rose-500',
    icon: '🎨',
    emoji: '👩‍🎓',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  Geography: {
    gradient: 'from-blue-400 via-cyan-400 to-teal-500',
    icon: '🌍',
    emoji: '🗺️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  }
}

// Animated background particles
const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950" />
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * window.innerHeight 
        }}
        animate={{ 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * window.innerHeight,
          rotate: [0, 360],
          scale: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 10 + Math.random() * 10,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className={`w-2 h-2 rounded-full opacity-60 ${
          ['bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400'][Math.floor(Math.random() * 4)]
        }`} />
      </motion.div>
    ))}
  </div>
)

// Floating emojis component
const FloatingEmojis = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {['🚀', '⭐', '✨', '🎯', '🏆', '🎨', '👩‍🎓', '🔥'].map((emoji, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl"
        initial={{ 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * window.innerHeight,
          opacity: 0
        }}
        animate={{ 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * window.innerHeight,
          opacity: [0, 1, 0],
          scale: [0.5, 1.5, 0.5],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 8 + Math.random() * 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5
        }}
      >
        {emoji}
      </motion.div>
    ))}
  </div>
)

// Animated stat card with consistent alignment
const AnimatedStatCard = ({ icon, value, label, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ 
      scale: 1.05,
      rotateY: 5,
      transition: { duration: 0.2 }
    }}
    className="h-full"
  >
    <Card className={`border-0 rounded-3xl shadow-xl bg-gradient-to-br ${gradient} text-white overflow-hidden transform transition-all duration-300 h-full`}>
      <CardContent className="p-6 text-center relative h-full flex flex-col justify-center">
        {/* Animated background elements */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-2 right-2 w-8 h-8 opacity-20"
        >
          <Sparkles className="w-full h-full" />
        </motion.div>
        
        <motion.div 
          className="text-5xl mb-4 flex justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {icon}
        </motion.div>
        <div className="text-4xl font-black mb-3 leading-tight">{value}</div>
        <div className="font-bold text-lg leading-tight">{label}</div>
      </CardContent>
    </Card>
  </motion.div>
)

// Quick action button with consistent sizing
const QuickActionButton = ({ icon, label, onClick, gradient, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring" }}
    whileHover={{ 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.3 }
    }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full h-32 p-6 rounded-3xl bg-gradient-to-r ${gradient} text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 border-0 flex flex-col items-center justify-center`}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <div className="text-center leading-tight">{label}</div>
  </motion.button>
)

// Progress card with consistent alignment
const ProgressCard = ({ lesson, progress, onContinue, delay = 0 }) => {
  const config = subjectConfig[lesson.subject] || subjectConfig['English']
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring" }}
      whileHover={{ 
        scale: 1.02,
        x: 5,
        transition: { duration: 0.2 }
      }}
      className="h-full"
    >
      <Card className="border-0 rounded-3xl shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden group h-full flex flex-col">
        <div className={`h-20 bg-gradient-to-r ${config.gradient} flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-4xl"
          >
            {config.icon}
          </motion.div>
          
          {/* Floating particles */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-2 right-4 w-2 h-2 bg-white rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-4 left-6 w-3 h-3 bg-white rounded-full"
          />
        </div>
        
        <CardContent className="p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 dark:text-white text-lg mb-2 leading-tight line-clamp-2">
                  {lesson.title}
                </h4>
                <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-xs font-bold`}>
                  {lesson.subject}
                </Badge>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-2xl font-black text-gray-800 dark:text-white">
                  {progress}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Complete
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-violet-600">Keep going! 🎯</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
          
          <Button 
            onClick={onContinue}
            className={`w-full rounded-2xl bg-gradient-to-r ${config.gradient} text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-0 mt-4`}
          >
            <Play className="mr-2 h-5 w-5" />
            Continue Learning! 🚀
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function StudentDashboard() {
  const { user, logout } = useAuthStore()
  const { userProgress, learningStats, fetchUserProgress, fetchLearningStats } = useProgressStore()
  const { studentLessons, studentResources, fetchStudentData } = useStudentStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
    if (user?._id) {
        try {
          await Promise.all([
            fetchUserProgress(user._id),
            fetchLearningStats(user._id),
            fetchStudentData()
          ])
        } catch (error) {
          console.error('Error loading dashboard data:', error)
          toast.error('Failed to load your learning data')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [user?._id, fetchUserProgress, fetchLearningStats, fetchStudentData])

  const handleLogout = () => {
    logout()
    window.location.href = '/auth/login'
  }

  // Calculate statistics
  const totalLessons = studentLessons?.length || 0
  const totalResources = studentResources?.length || 0
  const completedResources = userProgress?.filter(p => p.progress >= 100)?.length || 0
  const activeResources = userProgress?.filter(p => p.progress > 0 && p.progress < 100)?.length || 0
  const totalProgress = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0
  const streak = learningStats?.streak || 0
  const level = Math.floor((totalProgress / 10)) + 1

  // Get recent lessons with progress
  const recentLessons = studentLessons?.slice(0, 3).map(lesson => {
    const lessonResources = studentResources?.filter(r => r.lessonId === lesson._id) || []
    const completedCount = lessonResources.filter(resource => {
      const progress = userProgress?.find(p => p.resourceId === resource._id)
      return progress && progress.progress >= 100
    }).length
    const progress = lessonResources.length > 0 ? Math.round((completedCount / lessonResources.length) * 100) : 0
    
    return { ...lesson, progress }
  }) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="w-20 h-20 border-4 border-violet-200 border-t-violet-500 rounded-full mx-auto"
          />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
              Loading your amazing dashboard... ✨
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis />
      
      <div className="relative z-10 mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.h1 
              className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              Welcome to Your Learning World! 🌟
            </motion.h1>
            
            {/* Floating stars */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute -top-4 -right-1 text-3xl"
            >
              ⭐
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -top-2 -left-1 text-2xl"
            >
              🌟
            </motion.div>
            <motion.div
              animate={{ 
                x: [0, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-8 -right-2 text-xl"
            >
              ✨
            </motion.div>
          </div>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Hello {user?.name?.split(' ')[0] || 'Super Student'}! Ready for another amazing day of learning? 🚀
          </motion.p>
        </motion.div>

        {/* User Profile Card */}
          <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Card className="border-0 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-3xl font-bold">
                      {user?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                <motion.div 
                  animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"
                  />
                </div>
                
                <div className="flex-1 text-center lg:text-left min-w-0">
                  <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2 leading-tight">
                    {user?.name || 'Student'}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    Grade {user?.grade || '8'} • {user?.role || 'Student'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-2 text-sm font-bold">
                      <Crown className="w-4 h-4 mr-2" />
                      Level {level}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-4 py-2 text-sm font-bold">
                      <Flame className="w-4 h-4 mr-2" />
                      {streak} Day Streak
                    </Badge>
                    <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 px-4 py-2 text-sm font-bold">
                      <Target className="w-4 h-4 mr-2" />
                      {totalProgress}% Complete
                    </Badge>
                </div>
                </div>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all flex-shrink-0"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        {/* Quick Stats - Fixed height for consistent alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedStatCard 
            icon="📚" 
            value={totalLessons} 
            label="Total Lessons" 
            gradient={kidGradients.purple}
            delay={0.1}
          />
          <AnimatedStatCard 
            icon="✅" 
            value={completedResources} 
            label="Completed" 
            gradient={kidGradients.green}
            delay={0.2}
          />
          <AnimatedStatCard 
            icon="⏰" 
            value={learningStats?.totalTimeSpent || 0} 
            label="Minutes" 
            gradient={kidGradients.orange}
            delay={0.3}
          />
          <AnimatedStatCard 
            icon="⭐" 
            value={learningStats?.averageScore || 0} 
            label="Avg Score %" 
            gradient={kidGradients.pink}
            delay={0.4}
          />
        </div>

        {/* Quick Actions - Fixed height for consistent alignment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-6 text-center">
            What would you like to do today? 🎯
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionButton 
              icon="📚" 
              label="Start Learning" 
              onClick={() => window.location.href = '/student/learning-library'}
              gradient={kidGradients.blue}
              delay={0.1}
            />
            <QuickActionButton 
              icon="🧠" 
              label="AI Tutor" 
              onClick={() => window.location.href = '/student/ai-tutor'}
              gradient={kidGradients.purple}
              delay={0.2}
            />
            <QuickActionButton 
              icon="🏆" 
              label="Achievements" 
              onClick={() => window.location.href = '/student/achievements'}
              gradient={kidGradients.orange}
              delay={0.3}
            />
            <QuickActionButton 
              icon="📊" 
              label="My Progress" 
              onClick={() => window.location.href = '/student/my-learning'}
              gradient={kidGradients.green}
              delay={0.4}
            />
              </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="fun" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Fun Zone
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Recent Lessons */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-violet-500" />
                Continue Your Journey 🚀
              </h3>
              
              {recentLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentLessons.map((lesson, index) => (
                    <ProgressCard 
                      key={lesson._id} 
                      lesson={lesson} 
                      progress={lesson.progress}
                      onContinue={() => window.location.href = '/student/learning-library'}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    className="text-6xl mb-4"
                    >
                    🎯
                    </motion.div>
                  <p className="text-xl text-gray-600 dark:text-gray-300 font-bold mb-4">
                    Ready to start your learning adventure?
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/student/learning-library'}
                    className="rounded-3xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Explore Lessons! 🚀
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Overall Progress */}
              <Card className="border-0 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden h-full">
                <CardHeader className="bg-gradient-to-r from-violet-400 to-purple-400 text-white p-6">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <BarChart3 className="h-6 w-6" />
                    Your Learning Progress 📊
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Overall Completion</span>
                      <span className="font-black text-violet-600 text-2xl">{totalProgress}%</span>
                    </div>
                    <Progress value={totalProgress} className="h-4" />
                  </div>
                  
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
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card className="border-0 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden h-full">
                <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-400 text-white p-6">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <Flame className="h-6 w-6" />
                    Learning Streak 🔥
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center flex-1 flex flex-col justify-center">
                    <motion.div
                      animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    className="text-6xl mb-4"
                    >
                    🔥
                    </motion.div>
                  <div className="text-4xl font-black text-gray-800 dark:text-white mb-2">
                    {streak} Days
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 font-bold">
                    Keep the fire burning! 💪
                  </p>
                  
                  {streak >= 7 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                      className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 rounded-2xl"
                    >
                      <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-300 font-bold">
                        <Trophy className="h-5 w-5" />
                        <span>Week Warrior! 🏆</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fun Zone Tab */}
          <TabsContent value="fun" className="space-y-8 mt-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-4">
                Time for Some Fun! 🚀✨
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Take a break and enjoy these fun activities!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900 rounded-3xl shadow-lg h-full flex flex-col justify-center"
              >
                <div className="text-6xl mb-4 animate-bounce">🎨</div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Art Corner</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Express your creativity!</p>
                <Button className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white mt-auto">
                  <Palette className="mr-2 h-4 w-4" />
                  Start Drawing
                </Button>
              </motion.div>
              
                <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-3xl shadow-lg h-full flex flex-col justify-center"
              >
                <div className="text-6xl mb-4 animate-bounce">🎵</div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Music Time</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Learn something new!</p>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mt-auto">
                  <Music className="mr-2 h-4 w-4" />
                  Play Music
                </Button>
              </motion.div>
              
                      <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-3xl shadow-lg h-full flex flex-col justify-center"
              >
                <div className="text-6xl mb-4 animate-bounce">📸</div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Photo Fun</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Capture memories!</p>
                <Button className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white mt-auto">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photos
                      </Button>
                </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Card className="border-0 rounded-3xl shadow-2xl bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 text-white max-w-lg mx-auto overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-8">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-6xl mb-4"
              >
                🌟
              </motion.div>
              <p className="text-2xl font-black mb-3">You're Amazing! ✨</p>
              <p className="font-bold text-lg">Every day you learn, you grow stronger! 🚀</p>
              <div className="flex justify-center gap-2 mt-4">
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl"
                >
                  🚀
                </motion.span>
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="text-2xl"
                >
                  ⭐
                </motion.span>
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="text-2xl"
                >
                  🚀
                </motion.span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}