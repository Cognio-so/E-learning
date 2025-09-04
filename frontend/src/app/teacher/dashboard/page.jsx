"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award,
  FileText,
  PlayCircle,
  Image,
  Video,
  Music,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock3,
  Target,
  Lightbulb,
  Star,
  Activity,
  ToolCase
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import useAuthStore from '@/store/useAuthStore'
import useLessonStore from '@/store/useLessonStore'
import useProgressStore from '@/store/useProgressStore'
import useAssessmentStore from '@/store/useAssessmentStore'
import useStudentStore from '@/store/useStudentStore'
import useTeacherReportsStore from '@/store/useTeacherReportsStore'
import useMediaStore from '@/store/useMediaStore'
import useContentStore from '@/store/useContentStore'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { lessons, fetchLessons } = useLessonStore()
  const { learningStats, fetchLearningStats } = useProgressStore()
  const { assessments, fetchAssessments } = useAssessmentStore()
  const { students, fetchStudents } = useStudentStore()
  const { reportData, fetchTeacherReports } = useTeacherReportsStore()
  const { comics, images, slides, webSearch, initializeComics, initializeImages, initializeSlides, initializeWebSearch } = useMediaStore()
  const { savedContent, fetchSavedContent } = useContentStore()
  
  // Calculate real stats from actual data
  const stats = {
    totalStudents: students?.length || 0,
    activeLessons: lessons?.filter(lesson => lesson.status === 'active' || !lesson.status)?.length || 0,
    completedAssessments: assessments?.filter(assessment => assessment.status === 'completed' || assessment.isCompleted)?.length || 0,
    averageScore: reportData?.overview?.averageScore || 0,
    thisWeekLessons: lessons?.filter(lesson => {
      const lessonDate = new Date(lesson.createdAt || lesson.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return lessonDate >= weekAgo
    })?.length || 0,
    pendingTasks: assessments?.filter(assessment => assessment.status === 'pending' || !assessment.status)?.length || 0
  }

  // Calculate media toolkit stats from real data
  const mediaStats = {
    imagesCreated: images?.saved?.length || 0,
    videosCreated: 0, // Add when video functionality is implemented
    slidesCreated: slides?.saved?.length || 0,
    webSearches: webSearch?.saved?.length || 0,
    comicsCreated: comics?.saved?.length || 0
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchLessons(),
          fetchAssessments(),
          fetchLearningStats(user?.id),
          fetchStudents(),
          fetchTeacherReports(user?.id),
          initializeComics(),
          initializeImages(),
          initializeSlides(),
          initializeWebSearch(),
          fetchSavedContent()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id, fetchLessons, fetchAssessments, fetchLearningStats, fetchStudents, fetchTeacherReports, initializeComics, initializeImages, initializeSlides, initializeWebSearch, fetchSavedContent])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const recentLessons = lessons?.slice(0, 5) || []
  const recentAssessments = assessments?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}! 
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Here's what's happening with your classes today
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stats.totalStudents > 0 ? 'Active students' : 'No students yet'}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Lessons</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeLessons}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {stats.thisWeekLessons} this week
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Score</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={stats.averageScore} className="h-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Class performance</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
    <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedAssessments}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
                  <Target className="h-4 w-4 mr-1" />
                  {stats.pendingTasks} pending
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Lessons */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Recent Lessons
                  </CardTitle>
                  <CardDescription>Your latest lesson activities and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLessons.length > 0 ? (
                      recentLessons.map((lesson, index) => (
                        <div key={lesson.id || index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white">{lesson.title || `Lesson ${index + 1}`}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {lesson.subject || 'General'} • {lesson.grade || 'All Grades'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {lesson.status || 'Active'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No lessons created yet</p>
                        <p className="text-sm">Start by creating your first lesson</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                      <BookOpen className="h-6 w-6" />
                      Create Lesson
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0">
                      <FileText className="h-6 w-6" />
                      Generate Assessment
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0">
                      <Image className="h-6 w-6" />
                      Create Content
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">
                      <Users className="h-6 w-6" />
                      Manage Classes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Quick Stats - Replaces Today's Schedule */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Total Content</span>
                      </div>
                      <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                        {(savedContent?.length || 0) + (assessments?.length || 0) + (images?.saved?.length || 0) + (comics?.saved?.length || 0) + (slides?.saved?.length || 0) + (webSearch?.saved?.length || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Active Students</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {students?.filter(s => new Date(s.lastActive || s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Pending Tasks</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        {assessments?.filter(assessment => assessment.status === 'pending' || !assessment.status).length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">This Week</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                        {lessons?.filter(lesson => {
                          const lessonDate = new Date(lesson.createdAt || lesson.date)
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return lessonDate >= weekAgo
                        }).length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Assessments */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Recent Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAssessments.length > 0 ? (
                      recentAssessments.map((assessment, index) => (
                        <div key={assessment.id || index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                              {assessment.title || `Assessment ${index + 1}`}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {assessment.subject || 'General'} • {assessment.questions?.length || 0} questions
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No assessments yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section - Media Toolkit Overview */}
        <motion.div 
          className="mt-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToolCase className="h-5 w-5 text-indigo-600" />
                Media Toolkit Overview
              </CardTitle>
              <CardDescription>Your content creation tools and resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <Image className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium text-slate-900 dark:text-white">Images</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{mediaStats.imagesCreated} created</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <Video className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium text-slate-900 dark:text-white">Videos</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{mediaStats.videosCreated} created</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium text-slate-900 dark:text-white">Slides</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{mediaStats.slidesCreated} created</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-medium text-slate-900 dark:text-white">Web Search</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{mediaStats.webSearches} searches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage