"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  ChevronRight,
  Grid3X3,
  List,
  RefreshCw,
  School,
  TrendingUp,
  Activity,
  CheckCircle2,
  UserPlus,
  BookMarked
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useAdminStore from '@/store/useAdminStore'
import { subjects } from '@/config/data'

const ClassesSubjectsPage = () => {
  const { 
    classes,
    subjects,
    isLoadingClasses, // Use specific loading state
    getClassesAndSubjects
  } = useAdminStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [activeTab, setActiveTab] = useState('classes')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDialogLoading, setIsDialogLoading] = useState(false) // Add dialog loading state

  useEffect(() => {
    getClassesAndSubjects()
  }, [getClassesAndSubjects])

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade
    return matchesSearch && matchesGrade
  })

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    return subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getGradeColor = (grade) => {
    const colors = {
      'K': 'bg-pink-500',
      '1': 'bg-blue-500',
      '2': 'bg-green-500',
      '3': 'bg-yellow-500',
      '4': 'bg-purple-500',
      '5': 'bg-indigo-500',
      '6': 'bg-red-500',
      '7': 'bg-orange-500',
      '8': 'bg-teal-500',
      '9': 'bg-cyan-500',
      '10': 'bg-emerald-500',
      '11': 'bg-violet-500',
      '12': 'bg-rose-500'
    }
    return colors[grade] || 'bg-gray-500'
  }

  const getSubjectIcon = (subject) => {
    // Add comprehensive null/undefined check
    if (!subject || typeof subject !== 'string') return '📖'
    
    const subjectData = subjects.find(s => s?.title?.toLowerCase() === subject.toLowerCase())
    if (subjectData) {
      return icons[subjectData.title] || '📖'
    }
    return ''
  }

  const handleViewDetails = (item) => {
    setIsDialogLoading(true)
    setSelectedItem(item)
    setIsDetailDialogOpen(true)
    // Simulate a small delay to prevent loading flash
    setTimeout(() => {
      setIsDialogLoading(false)
    }, 100)
  }

  const ClassCard = ({ classItem, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${getGradeColor(classItem.grade)} flex items-center justify-center text-white font-bold text-lg`}>
                {classItem.grade}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {classItem.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {classItem.studentCount} students • {classItem.teacherCount} teachers
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewDetails(classItem)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Students
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Students</span>
              <span className="text-sm font-medium">{classItem.studentCount}</span>
            </div>
            <Progress value={(classItem.studentCount / 30) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Teachers</span>
              <span className="text-sm font-medium">{classItem.teacherCount}</span>
            </div>
            <Progress value={(classItem.teacherCount / 5) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Curriculums</span>
              <span className="text-sm font-medium">{classItem.curriculumCount}</span>
            </div>
            <Progress value={(classItem.curriculumCount / 10) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const SubjectCard = ({ subject, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl">
                {getSubjectIcon(subject?.name || '')}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {subject?.name || 'Unknown Subject'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {subject?.gradeCount || 0} grades • {subject?.curriculumCount || 0} curriculums
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewDetails(subject)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookMarked className="h-4 w-4 mr-2" />
                  View Curriculums
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Curriculums</span>
              <span className="text-sm font-medium">{subject?.curriculumCount || 0}</span>
            </div>
            <Progress value={(subject?.curriculumCount || 0 / 20) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Grades</span>
              <span className="text-sm font-medium">{subject?.gradeCount || 0}</span>
            </div>
            <Progress value={(subject?.gradeCount || 0 / 13) * 100} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-1 mt-4">
            {(subject?.grades || []).slice(0, 6).map((grade, idx) => (
              <Badge key={`${subject?.id}_grade_${grade}_${idx}`} variant="outline" className="text-xs">
                {grade === 'K' ? 'K' : `${grade}`}
              </Badge>
            ))}
            {(subject?.grades || []).length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{(subject?.grades || []).length - 6}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoadingClasses && classes.length === 0 && subjects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Classes & Subjects
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage educational structure and curriculum organization
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => getClassesAndSubjects()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Classes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{classes.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <School className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Subjects</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{subjects.length}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Students</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Teachers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {classes.reduce((sum, cls) => sum + cls.teacherCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-800 rounded-lg p-1">
            <TabsTrigger value="classes" className="rounded-md">
              <School className="h-4 w-4 mr-2" />
              Classes ({classes.length})
            </TabsTrigger>
            <TabsTrigger value="subjects" className="rounded-md">
              <BookOpen className="h-4 w-4 mr-2" />
              Subjects ({subjects.length})
            </TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                        <SelectItem key={grade} value={grade}>
                          {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 border border-slate-300 dark:border-slate-600 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem, index) => (
                <ClassCard key={classItem.id} classItem={classItem} index={index} />
              ))}
            </div>

            {filteredClasses.length === 0 && (
              <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-12 text-center">
                  <School className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No classes found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm || selectedGrade !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No classes have been created yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-1 border border-slate-300 dark:border-slate-600 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject, index) => (
                <SubjectCard 
                  key={`${subject.id}_${index}`} 
                  subject={subject} 
                  index={index} 
                />
              ))}
            </div>

            {filteredSubjects.length === 0 && (
              <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No subjects found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm
                      ? 'Try adjusting your search criteria.'
                      : 'No subjects have been created yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedItem?.name || 'Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedItem?.grade ? `Grade ${selectedItem.grade} class information` : 'Subject information'}
              </DialogDescription>
            </DialogHeader>
            
            {isDialogLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedItem ? (
              <div className="space-y-4">
                {selectedItem.grade ? (
                  // Class details
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold">{selectedItem.studentCount || 0}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Students</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <GraduationCap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                        <p className="text-2xl font-bold">{selectedItem.teacherCount || 0}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Teachers</p>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <BookOpen className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                      <p className="text-2xl font-bold">{selectedItem.curriculumCount || 0}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Curriculums</p>
                    </div>
                  </div>
                ) : (
                  // Subject details
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <BookOpen className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                        <p className="text-2xl font-bold">{selectedItem.curriculumCount || 0}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Curriculums</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <School className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold">{selectedItem.gradeCount || 0}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Grades</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Available Grades:</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedItem.grades || []).map((grade, idx) => (
                          <Badge key={idx} variant="outline">
                            {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ClassesSubjectsPage