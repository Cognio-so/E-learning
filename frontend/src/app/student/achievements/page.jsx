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

// Fun gradients for kids UI (matching dashboard theme)
const kidGradients = {
  purple: "from-violet-500 via-purple-500 to-indigo-500",
  orange: "from-amber-400 via-orange-500 to-pink-500",
  blue: "from-blue-400 via-cyan-500 to-sky-500",
  green: "from-emerald-400 via-green-500 to-teal-500",
  pink: "from-pink-400 via-rose-500 to-fuchsia-500",
  yellow: "from-yellow-400 via-orange-400 to-red-500",
  rainbow: "from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400"
}

// Animated background particles (fixed for SSR)
const AnimatedBackground = () => {
  // Use useEffect to access window only on client side
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950" />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: Math.random() * dimensions.width, 
            y: Math.random() * dimensions.height 
          }}
          animate={{ 
            x: Math.random() * dimensions.width, 
            y: Math.random() * dimensions.height,
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
}

// Floating emojis component (fixed for SSR)
const FloatingEmojis = () => {
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {['🚀', '⭐', '✨', '🌟', '🎨', '👩‍🎓', '🔥'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ 
            x: Math.random() * dimensions.width, 
            y: Math.random() * dimensions.height,
            opacity: 0
          }}
          animate={{ 
            x: Math.random() * dimensions.width, 
            y: Math.random() * dimensions.height,
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
}

// Achievement definitions with exact dashboard colors
const achievementDefinitions = [
  {
    id: 'first_lesson',
    title: "First Steps Explorer",
    description: "Complete your very first lesson! 🚀",
    icon: "🚀",
    points: 10,
    category: "beginner",
    gradient: "from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950 dark:via-orange-950 dark:to-red-950",
    borderColor: "border-yellow-200 dark:border-yellow-700",
    textColor: "text-yellow-700",
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
    gradient: "from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950",
    borderColor: "border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700",
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
    gradient: "from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950",
    borderColor: "border-green-200 dark:border-green-700",
    textColor: "text-green-700",
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
    gradient: "from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950",
    borderColor: "border-purple-200 dark:border-purple-700",
    textColor: "text-purple-700",
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
    gradient: "from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-950 dark:via-purple-950 dark:to-violet-950",
    borderColor: "border-indigo-200 dark:border-indigo-700",
    textColor: "text-indigo-700",
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
    gradient: "from-pink-50 via-rose-50 to-red-50 dark:from-pink-950 dark:via-rose-950 dark:to-red-950",
    borderColor: "border-pink-200 dark:border-pink-700",
    textColor: "text-pink-700",
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
    gradient: "from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950 dark:via-orange-950 dark:to-red-950",
    borderColor: "border-yellow-200 dark:border-yellow-700",
    textColor: "text-yellow-700",
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
    gradient: "from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950",
    borderColor: "border-cyan-200 dark:border-cyan-700",
    textColor: "text-cyan-700",
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
    gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950",
    borderColor: "border-emerald-200 dark:border-emerald-700",
    textColor: "text-emerald-700",
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
    gradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950",
    borderColor: "border-violet-200 dark:border-violet-700",
    textColor: "text-violet-700",
    emoji: "🎨",
    condition: (progress) => progress.subjectProgress?.art >= 8
  }
]

// Enhanced Achievement Card with exact dashboard colors and styling
const AchievementCard = ({ achievement, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
    whileHover={{ 
      scale: 1.05,
      rotateY: 5,
      transition: { duration: 0.2 }
    }}
    className="group h-full"
  >
    <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 rounded-3xl shadow-lg h-full flex flex-col ${
      achievement.unlocked 
        ? `${achievement.borderColor} shadow-xl` 
        : `${achievement.borderColor} shadow-lg`
    }`}>
      
      {/* Enhanced animated background elements with exact dashboard colors */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
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
          className="absolute top-2 right-2 w-8 h-8 text-violet-400 dark:text-violet-300"
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
          className="absolute bottom-4 left-4 w-8 h-8 text-fuchsia-400 dark:text-fuchsia-300"
        >
          <Star className="w-full h-full" />
        </motion.div>
      </div>
      
      <CardContent className="p-6 relative z-10 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className="text-5xl"
              animate={achievement.unlocked ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ 
                duration: 3, 
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
                  ? `bg-gradient-to-r ${achievement.gradient} text-white border-0 text-xs font-bold shadow-lg` 
                  : 'bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-bold backdrop-blur-sm'
              } px-3 py-1`}
            >
              {achievement.points} pts
            </Badge>
          </div>
          
          <h3 className={`text-xl font-bold mb-3 ${
            achievement.unlocked 
              ? `bg-gradient-to-r ${achievement.gradient} bg-clip-text text-transparent` 
              : 'text-gray-800 dark:text-white'
          }`}>
            {achievement.title}
          </h3>
          
          <p className={`text-sm mb-4 leading-relaxed ${
            achievement.unlocked ? `${achievement.textColor}` : 'text-gray-700 dark:text-gray-300'
          }`}>
            {achievement.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className={achievement.unlocked ? `${achievement.textColor}` : 'text-gray-700 dark:text-gray-300'}>
                Progress
              </span>
              <span className={achievement.unlocked ? `${achievement.textColor}` : 'text-gray-700 dark:text-gray-300'}>
                {achievement.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-3 rounded-full ${
                  achievement.unlocked 
                    ? `bg-gradient-to-r ${achievement.gradient}` 
                    : `bg-gradient-to-r ${achievement.gradient} opacity-60`
                } shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        
        {/* Enhanced celebration elements with dark theme */}
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="absolute top-3 right-3"
          >
            <div className="relative">
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 drop-shadow-lg" />
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
                className="absolute inset-0 bg-green-500 dark:bg-green-400 rounded-full opacity-20"
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950 relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis />
      
      <div className="relative z-10 container mx-auto p-6 space-y-8">
        {/* Animated Header with dark theme */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.h1 
              className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
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
            
            {/* Floating stars with dark theme */}
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

        {/* Enhanced Stats Cards with dark theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            className="h-full"
          >
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-0 rounded-3xl shadow-xl h-full">
              <CardContent className="p-6 text-center relative h-full flex flex-col justify-center">
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
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
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
            className="h-full"
          >
            <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-0 rounded-3xl shadow-xl h-full">
              <CardContent className="p-6 text-center relative h-full flex flex-col justify-center">
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
                <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
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
            className="h-full"
          >
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950 dark:via-pink-950 dark:to-red-950 border-0 rounded-3xl shadow-xl h-full">
              <CardContent className="p-6 text-center relative h-full flex flex-col justify-center">
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
                <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
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
            className="h-full"
          >
            <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950 dark:via-orange-950 dark:to-red-950 border-0 rounded-3xl shadow-xl h-full">
              <CardContent className="p-6 text-center relative h-full flex flex-col justify-center">
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
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                  Level {stats.level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Current Level
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Tabs with dark theme */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
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
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300 rounded-xl text-gray-700 dark:text-gray-300"
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

        {/* Enhanced Recent Activity with dark theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-0 rounded-3xl shadow-xl">
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
                    className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
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