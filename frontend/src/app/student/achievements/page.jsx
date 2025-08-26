'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
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
  Diamond
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useProgressStore from '@/store/useProgressStore'

// Achievement definitions - these define what achievements are available
const achievementDefinitions = [
  {
    id: 'first_lesson',
    title: "First Steps Explorer",
    description: "Complete your very first lesson! 🚀",
    icon: "🚀",
    points: 10,
    category: "beginner",
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    bgGradient: "from-yellow-50 to-orange-50",
    emoji: "🚀",
    condition: (progress) => progress.completedLessons >= 1
  },
  {
    id: 'five_lessons',
    title: "Knowledge Detective",
    description: "Complete 5 amazing lessons! 🌟",
    icon: "🌟",
    points: 25,
    category: "learning",
    gradient: "from-blue-400 via-purple-500 to-pink-500",
    bgGradient: "from-blue-50 to-purple-50",
    emoji: "📚",
    condition: (progress) => progress.completedLessons >= 5
  },
  {
    id: 'perfect_assessments',
    title: "Quiz Champion",
    description: "Score 100% on 3 super assessments! ⚡",
    icon: "⚡",
    points: 50,
    category: "assessment",
    gradient: "from-green-400 via-teal-500 to-cyan-500",
    bgGradient: "from-green-50 to-teal-50",
    emoji: "💎",
    condition: (progress) => progress.perfectAssessments >= 3
  },
  {
    id: 'speed_learner',
    title: "Speed Lightning",
    description: "Complete 10 lessons in a week! ⚡",
    icon: "⚡",
    points: 75,
    category: "speed",
    gradient: "from-purple-400 via-pink-500 to-red-500",
    bgGradient: "from-purple-50 to-pink-50",
    emoji: "🌈",
    condition: (progress) => progress.weeklyLessons >= 10
  },
  {
    id: 'excellence',
    title: "Perfect Master",
    description: "Get 100% on 5 assessments! 💎",
    icon: "💎",
    points: 100,
    category: "excellence",
    gradient: "from-indigo-400 via-purple-500 to-pink-500",
    bgGradient: "from-indigo-50 to-purple-50",
    emoji: "💎",
    condition: (progress) => progress.perfectAssessments >= 5
  },
  {
    id: 'learning_legend',
    title: "Learning Legend",
    description: "Complete 50 incredible lessons! 🌈",
    icon: "🌈",
    points: 200,
    category: "mastery",
    gradient: "from-pink-400 via-red-500 to-yellow-500",
    bgGradient: "from-pink-50 to-red-50",
    emoji: "🌈",
    condition: (progress) => progress.completedLessons >= 50
  },
  {
    id: 'math_wizard',
    title: "Math Wizard",
    description: "Master 10 math lessons! 🔢",
    icon: "🔢",
    points: 150,
    category: "subject",
    gradient: "from-orange-400 via-red-500 to-pink-500",
    bgGradient: "from-orange-50 to-red-50",
    emoji: "🔢",
    condition: (progress) => progress.subjectProgress?.math >= 10
  },
  {
    id: 'science_explorer',
    title: "Science Explorer",
    description: "Discover 10 science lessons! 🔬",
    icon: "🔬",
    points: 150,
    category: "subject",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    bgGradient: "from-cyan-50 to-blue-50",
    emoji: "🔬",
    condition: (progress) => progress.subjectProgress?.science >= 10
  },
  {
    id: 'reading_hero',
    title: "Reading Hero",
    description: "Read 15 amazing stories! 📚",
    icon: "📚",
    points: 125,
    category: "reading",
    gradient: "from-emerald-400 via-green-500 to-teal-500",
    bgGradient: "from-emerald-50 to-green-50",
    emoji: "📚",
    condition: (progress) => progress.completedLessons >= 15
  },
  {
    id: 'creative_artist',
    title: "Creative Artist",
    description: "Complete 8 art lessons! 🎨",
    icon: "🎨",
    points: 100,
    category: "creative",
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-50 to-purple-50",
    emoji: "🎨",
    condition: (progress) => progress.subjectProgress?.art >= 8
  }
]

const AchievementCard = ({ achievement, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
    whileHover={{ 
      scale: 1.05, 
      rotateY: 5,
      transition: { duration: 0.2 }
    }}
    className="group"
  >
    <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl ${
      achievement.unlocked 
        ? `bg-gradient-to-br ${achievement.bgGradient} border-2 border-transparent bg-gradient-to-r ${achievement.gradient} bg-clip-border` 
        : 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700'
    }`}>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
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
          className="absolute top-4 right-4 w-16 h-16"
        >
          <Sparkles className="w-full h-full" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            x: [0, 5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-4 left-4 w-8 h-8"
        >
          <Star className="w-full h-full" />
        </motion.div>
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className="text-5xl"
            animate={achievement.unlocked ? {
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {achievement.icon}
          </motion.div>
          <Badge 
            variant={achievement.unlocked ? "default" : "secondary"}
            className={`${
              achievement.unlocked 
                ? `bg-gradient-to-r ${achievement.gradient} text-white shadow-lg` 
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            } font-bold text-sm px-3 py-1`}
          >
            {achievement.points} pts
          </Badge>
        </div>
        
        <h3 className={`text-xl font-bold mb-3 ${
          achievement.unlocked 
            ? `bg-gradient-to-r ${achievement.gradient} bg-clip-text text-transparent` 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {achievement.title}
        </h3>
        
        <p className={`text-sm mb-4 leading-relaxed ${
          achievement.unlocked ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {achievement.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className={achievement.unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              Progress
            </span>
            <span className={achievement.unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              {achievement.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full ${
                achievement.unlocked 
                  ? `bg-gradient-to-r ${achievement.gradient}` 
                  : 'bg-gradient-to-r from-gray-300 to-gray-400'
              } shadow-lg`}
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
        
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="absolute top-3 right-3"
          >
            <div className="relative">
              <CheckCircle className="w-8 h-8 text-green-500 drop-shadow-lg" />
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-green-500 rounded-full opacity-20"
              />
            </div>
          </motion.div>
        )}
        
        {/* Celebration emoji for unlocked achievements */}
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1, type: "spring" }}
            className="absolute bottom-3 right-3 text-2xl"
          >
            {achievement.emoji}
          </motion.div>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

export default function Achievements() {
  const { user } = useAuthStore()
  const { fetchUserProgress, userProgress, fetchAchievements, achievements: userAchievements } = useProgressStore()
  const [activeTab, setActiveTab] = useState('all')
  const [stats, setStats] = useState({
    totalPoints: 0,
    achievementsUnlocked: 0,
    totalAchievements: achievementDefinitions.length,
    streak: 0,
    level: 1
  })

  useEffect(() => {
    if (user?._id) {
      fetchUserProgress(user._id)
      fetchAchievements(user._id)
    }
  }, [user?._id, fetchUserProgress, fetchAchievements])

  // Calculate real stats from user progress
  useEffect(() => {
    if (userProgress) {
      // Generate achievements based on current progress
      const achievements = generateAchievements()
      const unlockedCount = achievements.filter(a => a.unlocked).length
      const totalPoints = achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0)
      
      // Calculate level based on total points
      const level = Math.floor(totalPoints / 100) + 1
      
      // Calculate streak from progress data
      const streak = userProgress.length > 0 ? 
        userProgress.reduce((max, p) => Math.max(max, p.streak || 0), 0) : 0

      setStats({
        totalPoints,
        achievementsUnlocked: unlockedCount,
        totalAchievements: achievementDefinitions.length,
        streak,
        level
      })
    }
  }, [userProgress])

  // Generate achievements based on real user progress
  const generateAchievements = () => {
    if (!userProgress) return achievementDefinitions.map(def => ({ ...def, unlocked: false, progress: 0 }))

    // Calculate progress metrics
    const progressMetrics = {
      completedLessons: userProgress.filter(p => p.completed).length,
      perfectAssessments: userProgress.filter(p => p.resourceType === 'assessment' && p.score === 100).length,
      weeklyLessons: userProgress.filter(p => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return new Date(p.completedAt) > weekAgo
      }).length,
      subjectProgress: userProgress.reduce((acc, p) => {
        const subject = p.subject?.toLowerCase()
        if (subject) {
          acc[subject] = (acc[subject] || 0) + 1
        }
        return acc
      }, {})
    }

    return achievementDefinitions.map(definition => {
      const unlocked = definition.condition(progressMetrics)
      const progress = calculateProgress(definition, progressMetrics)
      
      return {
        ...definition,
        unlocked,
        progress
      }
    })
  }

  const calculateProgress = (definition, metrics) => {
    switch (definition.id) {
      case 'first_lesson':
        return metrics.completedLessons >= 1 ? 100 : Math.min(metrics.completedLessons * 100, 99)
      case 'five_lessons':
        return Math.min((metrics.completedLessons / 5) * 100, 100)
      case 'perfect_assessments':
        return Math.min((metrics.perfectAssessments / 3) * 100, 100)
      case 'speed_learner':
        return Math.min((metrics.weeklyLessons / 10) * 100, 100)
      case 'excellence':
        return Math.min((metrics.perfectAssessments / 5) * 100, 100)
      case 'learning_legend':
        return Math.min((metrics.completedLessons / 50) * 100, 100)
      case 'math_wizard':
        return Math.min(((metrics.subjectProgress?.math || 0) / 10) * 100, 100)
      case 'science_explorer':
        return Math.min(((metrics.subjectProgress?.science || 0) / 10) * 100, 100)
      case 'reading_hero':
        return Math.min((metrics.completedLessons / 15) * 100, 100)
      case 'creative_artist':
        return Math.min(((metrics.subjectProgress?.art || 0) / 8) * 100, 100)
      default:
        return 0
    }
  }

  const achievements = generateAchievements()

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true
    return achievement.category === activeTab
  })

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  const categoryIcons = {
    all: "🌟",
    beginner: "🚀",
    learning: "📚",
    assessment: "⚡",
    speed: "⚡",
    excellence: "💎",
    mastery: "🌈",
    subject: "🔢",
    reading: "📚",
    creative: "🎨"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
               Achievements 🏆
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
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Celebrate your amazing learning journey and unlock incredible rewards! 🚀
          </motion.p>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 dark:border-blue-700 shadow-xl">
              <CardContent className="p-6 text-center">
                <motion.div 
                  className="text-4xl mb-3"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  🚀
                </motion.div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.achievementsUnlocked}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Achievements Unlocked
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 dark:border-green-700 shadow-xl">
              <CardContent className="p-6 text-center">
                <motion.div 
                  className="text-4xl mb-3"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  ⚡
                </motion.div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.totalPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Total Points
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 border-2 border-purple-200 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 dark:border-purple-700 shadow-xl">
              <CardContent className="p-6 text-center">
                <motion.div 
                  className="text-4xl mb-3"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  🌈
                </motion.div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Day Streak
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 dark:border-yellow-700 shadow-xl">
              <CardContent className="p-6 text-center">
                <motion.div 
                  className="text-4xl mb-3"
                  animate={{ 
                    y: [0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  💎
                </motion.div>
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Level {stats.level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Current Level
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
            {[
              { value: 'all', label: 'All', count: achievements.length },
              { value: 'beginner', label: 'Beginner', count: achievements.filter(a => a.category === 'beginner').length },
              { value: 'learning', label: 'Learning', count: achievements.filter(a => a.category === 'learning').length },
              { value: 'assessment', label: 'Quiz', count: achievements.filter(a => a.category === 'assessment').length },
              { value: 'excellence', label: 'Excellence', count: achievements.filter(a => a.category === 'excellence').length },
              { value: 'mastery', label: 'Mastery', count: achievements.filter(a => a.category === 'mastery').length }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg font-semibold transition-all duration-300"
              >
                <span className="mr-2">{categoryIcons[tab.value]}</span>
                {tab.label} ({tab.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredAchievements.map((achievement, index) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 dark:border-indigo-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-xl">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Gift className="w-6 h-6" />
                </motion.div>
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unlockedAchievements.slice(0, 3).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
                  >
                    <motion.div 
                      className="text-3xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      {achievement.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {achievement.description}
                      </div>
                    </div>
                    <Badge className={`bg-gradient-to-r ${achievement.gradient} text-white font-bold text-sm px-4 py-2 shadow-lg`}>
                      +{achievement.points}
                    </Badge>
                  </motion.div>
                ))}
                {unlockedAchievements.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>No achievements unlocked yet. Keep learning to earn rewards!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}