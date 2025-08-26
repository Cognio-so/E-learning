'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target, 
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  PieChart,
  LineChart,
  Activity,
  Star,
  Trophy,
  Loader2,
  User,
  Mail,
  CalendarDays,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import useAuthStore from '@/store/useAuthStore'
import useTeacherReportsStore from '@/store/useTeacherReportsStore'

const ReportsPage = () => {
  const { user } = useAuthStore()
  const {
    reportData,
    isLoading,
    error,
    lastUpdated,
    fetchTeacherReports,
    refreshReports,
    getOverviewStats,
    getPerformanceDistribution,
    getTopPerformers,
    getSubjectPerformance,
    getStudentReports,
    getBehaviorAnalysis,
    getAttendanceData
  } = useTeacherReportsStore()

  // Fetch reports on component mount
  useEffect(() => {
    if (user?._id) {
      fetchTeacherReports(user._id)
    }
  }, [user?._id, fetchTeacherReports])

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return 'text-green-600'
    if (performance >= 80) return 'text-blue-600'
    if (performance >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRefresh = async () => {
    try {
      await refreshReports()
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading student reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    )
  }

  const overviewStats = getOverviewStats()
  const performanceDistribution = getPerformanceDistribution()
  const topPerformers = getTopPerformers()
  const subjects = getSubjectPerformance()
  const studentReports = getStudentReports()
  const behaviorAnalysis = getBehaviorAnalysis()
  const attendanceData = getAttendanceData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Reports - Grade {user?.grade}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time student performance data
              {lastUpdated && (
                <span className="ml-2 text-sm text-blue-600">
                  Last updated: {formatDate(lastUpdated)}
                </span>
              )}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
            </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-white">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                    {isLoading ? '...' : (overviewStats?.totalStudents || 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-white">Average Performance</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(overviewStats?.averagePerformance || 0)}`}>
                    {isLoading ? '...' : (overviewStats?.averagePerformance || 0)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-white">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                    {isLoading ? '...' : (overviewStats?.attendanceRate || 0)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-white">Behavior Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                    {isLoading ? '...' : (overviewStats?.behaviorScore || 0)}/10
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Students ({studentReports.length})</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Top Performers</span>
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-6 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Student Reports</span>
                </CardTitle>
                <CardDescription>
                  Individual student performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {studentReports.length > 0 ? (
                    studentReports.map((student, index) => (
                      <div key={student.studentId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold dark:text-white">{student.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {student.email}
                                </span>
                                <span className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  Grade {student.grade}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getPerformanceColor(student.averageScore)}`}>
                              {student.averageScore}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Average Score
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Completion Rate</span>
                              <span className="text-lg font-bold text-blue-600">{student.completionRate}%</span>
                            </div>
                            <Progress value={student.completionRate} className="mt-2" />
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Resources Completed</span>
                              <span className="text-lg font-bold text-green-600">
                                {student.completedResources}/{student.totalResources}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Active</span>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {student.lastActive ? formatDate(student.lastActive) : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {student.recentAssessments.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 dark:text-white">Recent Assessments</h4>
                            <div className="space-y-2">
                              {student.recentAssessments.map((assessment, aIndex) => (
                                <div key={aIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div>
                                    <p className="font-medium dark:text-white">{assessment.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatDate(assessment.completedAt)}
                                    </p>
                                  </div>
                                  <div className={`text-lg font-bold ${getPerformanceColor(assessment.score)}`}>
                                    {assessment.score}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No students found in Grade {user?.grade}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Distribution */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Performance Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm dark:text-gray-200">Excellent (A)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{performanceDistribution?.excellent || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round((performanceDistribution?.excellent || 0) / (overviewStats?.totalStudents || 1) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={(performanceDistribution?.excellent || 0) / (overviewStats?.totalStudents || 1) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm dark:text-gray-200">Good (B)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{performanceDistribution?.good || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round((performanceDistribution?.good || 0) / (overviewStats?.totalStudents || 1) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={(performanceDistribution?.good || 0) / (overviewStats?.totalStudents || 1) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm dark:text-gray-200">Average (C)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{performanceDistribution?.average || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round((performanceDistribution?.average || 0) / (overviewStats?.totalStudents || 1) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={(performanceDistribution?.average || 0) / (overviewStats?.totalStudents || 1) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm dark:text-gray-200">Needs Improvement (D)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{performanceDistribution?.needsImprovement || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round((performanceDistribution?.needsImprovement || 0) / (overviewStats?.totalStudents || 1) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={(performanceDistribution?.needsImprovement || 0) / (overviewStats?.totalStudents || 1) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.length > 0 ? (
                      topPerformers.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-600' :
                              index === 1 ? 'bg-gray-100 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                            {index + 1}
                          </div>
                          <div>
                              <p className="font-medium dark:text-white">{student.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {student.grade}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${getPerformanceColor(student.performance)}`}>
                            {student.performance}%
                          </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No assessment data available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.length > 0 ? (
                subjects.map((subject, index) => (
                  <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{subject.name}</span>
                        <Badge variant="outline">{subject.students} students</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Performance</span>
                          <span className={`text-lg font-bold ${getPerformanceColor(subject.performance)}`}>
                            {subject.performance}%
                          </span>
                      </div>
                        <Progress value={subject.performance} className="h-2" />
                  </div>
                </CardContent>
              </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  No subject data available yet
                      </div>
              )}
            </div>
          </TabsContent>

          {/* Top Performers Tab */}
          <TabsContent value="top" className="mt-6 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Top Performing Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.length > 0 ? (
                    topPerformers.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {index + 1}
                        </div>
                          <div>
                            <h3 className="text-lg font-semibold dark:text-white">{student.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Grade {student.grade}</p>
                      </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getPerformanceColor(student.performance)}`}>
                            {student.performance}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Average Score
                      </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No top performers data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ReportsPage
