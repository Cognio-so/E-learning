'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
  import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Target, 
  Activity,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Award,
  BarChart3,
  UserCheck,
  UserX,
  Eye,
  Search,
  Filter,
  Trash2,
  Plus,
  FileText,
  Share2,
  Download
} from 'lucide-react'
import { subjects, grades } from '@/config/data'
import useStudentStore from '@/store/useStudentStore'
import useAssessmentStore from '@/store/useAssessmentStore'
import { toast } from 'sonner'

const ClassGroupingPage = () => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    subject: 'All',
    performanceGrade: 'All',
    behavior: 'All'
  })

  const { 
    students, 
    isLoading, 
    error, 
    fetchStudents, 
    deleteStudent, 
    assignAssessment, 
    removeAssessment,
    getAssignedAssessments 
  } = useStudentStore()

  const { 
    assessments, 
    fetchAssessments 
  } = useAssessmentStore()

  useEffect(() => {
    fetchStudents()
    fetchAssessments()
  }, [fetchStudents, fetchAssessments])

  const getBehaviorColor = (behavior) => {
    switch (behavior) {
      case "Excellent": return "bg-green-100 text-green-800 border-green-200"
      case "Good": return "bg-blue-100 text-blue-800 border-blue-200"
      case "Needs Improvement": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const openStudentDialog = (student) => {
    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      try {
        await deleteStudent(studentId)
        toast.success('Student deleted successfully')
      } catch (error) {
        toast.error('Failed to delete student')
      }
    }
  }

  const handleAssignAssessment = async () => {
    if (!selectedAssessment || !selectedStudent) {
      toast.error('Please select an assessment')
      return
    }

    try {
      await assignAssessment(selectedStudent._id, selectedAssessment)
      toast.success('Assessment assigned successfully')
      setIsAssignDialogOpen(false)
      setSelectedAssessment('')
    } catch (error) {
      toast.error('Failed to assign assessment')
    }
  }

  const handleRemoveAssessment = async (assessmentId, studentId) => {
    if (window.confirm('Are you sure you want to remove this assessment?')) {
      try {
        await removeAssessment(assessmentId, studentId)
        toast.success('Assessment removed successfully')
      } catch (error) {
        toast.error('Failed to remove assessment')
      }
    }
  }

  // Filter students based on current filters
  const getFilteredStudents = (studentList) => {
    return studentList.filter(student => {
      // Search filter
      const searchMatch = !filters.search || 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase())

      // Subject filter - check if student has any assessments in the selected subject
      const subjectMatch = filters.subject === 'All' || 
        (student.assignedAssessments && student.assignedAssessments.some(assessment => 
          assessment.subject === filters.subject
        ))

      // Performance Grade filter - use actual performance data if available
      const performanceGradeMatch = filters.performanceGrade === 'All' || 
        (student.averageScore && 
          (filters.performanceGrade === 'A' && student.averageScore >= 90) ||
          (filters.performanceGrade === 'B' && student.averageScore >= 80 && student.averageScore < 90) ||
          (filters.performanceGrade === 'C' && student.averageScore >= 70 && student.averageScore < 80) ||
          (filters.performanceGrade === 'D' && student.averageScore < 70)
        )

      // Behavior filter - use actual behavior data if available
      const behaviorMatch = filters.behavior === 'All' || 
        (student.behavior && student.behavior === filters.behavior)

      return searchMatch && subjectMatch && performanceGradeMatch && behaviorMatch
    })
  }

  const groupStudents = () => {
    const filteredStudents = getFilteredStudents(students)
    
    // Group students based on actual performance data
    const studentsWithScores = filteredStudents.map(student => ({
      ...student,
      averageScore: student.averageScore || 75 // Default score if not available
    }))
    
    // Sort by performance score
    studentsWithScores.sort((a, b) => b.averageScore - a.averageScore)
    
    const highPerformers = studentsWithScores.slice(0, Math.ceil(studentsWithScores.length * 0.3))
    const averagePerformers = studentsWithScores.slice(Math.ceil(studentsWithScores.length * 0.3), Math.ceil(studentsWithScores.length * 0.7))
    const strugglingStudents = studentsWithScores.slice(Math.ceil(studentsWithScores.length * 0.7))

    return {
      "All Students": filteredStudents,
      "High Performers": highPerformers,
      "Average Performers": averagePerformers,
      "Struggling Students": strugglingStudents
    }
  }

  const studentGroups = groupStudents()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Students</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={fetchStudents}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Class Grouping & Student Management
            </h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
              Manage student groups and assign assessments
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Available Assessments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{assessments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {students.filter(s => new Date(s.lastActive || s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Verified Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {students.filter(s => s.isVerified).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Groups Tabs */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center space-x-2 text-xl lg:text-2xl">
              <BarChart3 className="w-5 h-5" />
              <span>Student Groups & Management</span>
            </CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Click on any student to view detailed profile and manage assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {/* Filters */}
            <div className="mb-6 p-4 lg:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700 dark:text-white">Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Subject Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                    <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.title}>
                          {subject.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Performance Grade Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance</label>
                  <Select value={filters.performanceGrade} onValueChange={(value) => setFilters({ ...filters, performanceGrade: value })}>
                    <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="Select Performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Performance Levels</SelectItem>
                      <SelectItem value="A">A (90%+)</SelectItem>
                      <SelectItem value="B">B (80-89%)</SelectItem>
                      <SelectItem value="C">C (70-79%)</SelectItem>
                      <SelectItem value="D">D (69%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Behavior Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Behavior</label>
                  <Select value={filters.behavior} onValueChange={(value) => setFilters({ ...filters, behavior: value })}>
                    <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="Select Behavior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Behaviors</SelectItem>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Tabs defaultValue="All Students" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="All Students" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">All Students</span>
                  <span className="lg:hidden">All</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {studentGroups["All Students"].length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="High Performers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">
                  <UserCheck className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">High Performers</span>
                  <span className="lg:hidden">High</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {studentGroups["High Performers"].length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="Average Performers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Average Performers</span>
                  <span className="lg:hidden">Avg</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {studentGroups["Average Performers"].length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="Struggling Students" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">
                  <UserX className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Struggling Students</span>
                  <span className="lg:hidden">Struggling</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {studentGroups["Struggling Students"].length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {Object.entries(studentGroups).map(([groupName, groupStudents]) => (
                <TabsContent key={groupName} value={groupName} className="mt-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-300">Loading students...</p>
                    </div>
                  ) : groupStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
                      <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters to see more results.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                      {groupStudents.map((student) => (
                        <Card 
                          key={student._id} 
                          className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-lg cursor-pointer"
                          onClick={() => openStudentDialog(student)}
                        >
                          <CardContent className="p-4 lg:p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-16 h-16 border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-400 transition-colors">
                                <AvatarImage src={student.avatar} alt={student.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-gray-700 dark:text-white font-semibold">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{student.name}</h3>
                                  <Badge className={`${student.isVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} text-xs`}>
                                    {student.isVerified ? 'Verified' : 'Pending'}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Email:</span>
                                    <span className="font-medium text-gray-900 dark:text-white truncate text-xs">{student.email}</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Role:</span>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">{student.role}</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Joined:</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-xs">
                                      {new Date(student.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  {student.averageScore && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600 dark:text-gray-300">Avg Score:</span>
                                      <span className={`font-medium ${getGradeColor(student.averageScore)}`}>
                                        {student.averageScore}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                Student
                              </Badge>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openStudentDialog(student)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteStudent(student._id, student.name)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Student Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[90vw] md:max-w-[1024px] max-h-[98vh] overflow-y-auto p-0 dark:bg-gray-900">
            <div className="relative w-full min-h-[600px] sm:min-h-[700px] h-auto">
              {selectedStudent && (
                <>
                  <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
                          {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold dark:text-white">{selectedStudent.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300">{selectedStudent.email}</p>
                      </div>
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Student profile and assessment management
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">
                    {/* Student Information */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>Student Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 capitalize">{selectedStudent.role}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Role</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {selectedStudent.isVerified ? 'Yes' : 'No'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Verified</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-gray-200">Joined Date</span>
                            <span className="text-sm font-semibold dark:text-white">
                              {new Date(selectedStudent.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-gray-200">Last Active</span>
                            <span className="text-sm font-semibold dark:text-white">
                              {new Date(selectedStudent.lastActive || selectedStudent.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Assessment Management */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="w-5 h-5" />
                          <span>Assessment Management</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button 
                          onClick={() => setIsAssignDialogOpen(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assign Assessment
                        </Button>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm dark:text-gray-200">Available Assessments</h4>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {assessments.length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No assessments available</p>
                            ) : (
                              assessments.map((assessment) => (
                                <div key={assessment._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                  <span className="text-sm dark:text-white">{assessment.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {assessment.status}
                                  </Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Mail className="w-5 h-5" />
                          <span>Contact Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm dark:text-gray-300">{selectedStudent.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm dark:text-gray-300">
                            Joined: {new Date(selectedStudent.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Activity className="w-5 h-5" />
                          <span>Actions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Share content functionality
                            toast.info('Content sharing feature coming soon')
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Content
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Export student data
                            toast.info('Export feature coming soon')
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => handleDeleteStudent(selectedStudent._id, selectedStudent.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Student
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Assessment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Assessment</DialogTitle>
              <DialogDescription>
                Select an assessment to assign to {selectedStudent?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment._id} value={assessment._id}>
                      {assessment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAssignAssessment}
                  disabled={!selectedAssessment}
                  className="flex-1"
                >
                  Assign
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAssignDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ClassGroupingPage