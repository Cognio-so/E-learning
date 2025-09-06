"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Activity,
  UserPlus,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Award,
  Target,
  Zap,
  Shield,
  Database,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import useAuthStore from '@/store/useAuthStore'
import useAdminStore from '@/store/useAdminStore'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const { 
    users, 
    curriculums, 
    analytics, 
    isLoading, 
    error, 
    getDashboardAnalytics 
  } = useAdminStore()
  
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Always call to ensure fresh data
    getDashboardAnalytics();
  }, []); // Remove getDashboardAnalytics from dependency array

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

  // Calculate growth percentages (mock data for demo)
  const growthData = {
    users: 12.5,
    students: 15.2,
    teachers: 8.7,
    curriculums: 22.1
  }

  // Recent activity data
  const recentActivity = [
    { id: 1, type: 'user_registered', user: 'John Doe', action: 'registered as Student', time: '2 minutes ago', avatar: 'JD' },
    { id: 2, type: 'curriculum_added', user: 'Sarah Wilson', action: 'added Math Curriculum', time: '15 minutes ago', avatar: 'SW' },
    { id: 3, type: 'role_updated', user: 'Mike Johnson', action: 'promoted to Teacher', time: '1 hour ago', avatar: 'MJ' },
    { id: 4, type: 'user_deleted', user: 'Admin', action: 'removed inactive user', time: '2 hours ago', avatar: 'AD' }
  ]

  // Add debugging
  console.log('Dashboard analytics:', analytics);
  console.log('Users count:', users.length);
  console.log('Students count:', users.filter(u => u.role === 'student').length);
  console.log('Teachers count:', users.filter(u => u.role === 'teacher').length);

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 truncate">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {value || 0}
              </p>
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-1 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-xs sm:text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {change}%
                </span>
                <span className="text-xs sm:text-sm text-slate-500 ml-1 hidden sm:inline">vs last month</span>
              </div>
            </div>
            <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading && !users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <motion.div 
          className="mb-6 sm:mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300">
                Welcome back, {user?.name}! Here's what's happening in your platform.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Administrator</span>
                <span className="sm:hidden">Admin</span>
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard 
            title="Total Users" 
            value={analytics.totalUsers} 
            change={growthData.users}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend="up"
          />
          <StatCard 
            title="Students" 
            value={analytics.totalStudents} 
            change={growthData.students}
            icon={GraduationCap}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend="up"
          />
          <StatCard 
            title="Teachers" 
            value={analytics.totalTeachers} 
            change={growthData.teachers}
            icon={Award}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend="up"
          />
          <StatCard 
            title="Curriculums" 
            value={analytics.totalCurriculums} 
            change={growthData.curriculums}
            icon={BookOpen}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            trend="up"
          />
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-xs sm:text-sm">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-sm">Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 text-xs sm:text-sm">
                        <UserPlus className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="text-center">Add User</span>
                      </Button>
                      <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-xs sm:text-sm">
                        <BookOpen className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="text-center">Add Curriculum</span>
                      </Button>
                      <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 text-xs sm:text-sm">
                        <Settings className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="text-center">System Settings</span>
                      </Button>
                      <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 text-xs sm:text-sm">
                        <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />
                        <span className="text-center">View Reports</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* System Status */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Database className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">Server Health</span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Healthy</Badge>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">Database</span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Online</Badge>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">API Response</span>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">Good</Badge>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">Storage</span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Optimal</Badge>
                      </div>
                      <Progress value={73} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base sm:text-lg">User Management</CardTitle>
                    <CardDescription className="text-sm">Manage all users in the system</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {users.slice(0, 10).map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border bg-slate-50 dark:bg-slate-700/50 gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-xs sm:text-sm">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">{user.name}</p>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge 
                            variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}
                            className="capitalize text-xs"
                          >
                            {user.role}
                          </Badge>
                          {user.grade && (
                            <Badge variant="outline" className="text-xs">Grade {user.grade}</Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium">Students</span>
                      <span className="text-xs sm:text-sm font-semibold">{analytics.totalStudents}</span>
                    </div>
                    <Progress value={(analytics.totalStudents / analytics.totalUsers) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium">Teachers</span>
                      <span className="text-xs sm:text-sm font-semibold">{analytics.totalTeachers}</span>
                    </div>
                    <Progress value={(analytics.totalTeachers / analytics.totalUsers) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium">Active Users</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">{analytics.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium">Total Sessions</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium">Avg. Session Time</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">24 min</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-sm">Latest system activities and user actions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                    >
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs sm:text-sm font-semibold">
                          {activity.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-slate-900 dark:text-white">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard