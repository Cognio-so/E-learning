"use client"
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  Star,
  Clock,
  Tag,
  ChevronRight,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  BookMarked,
  GraduationCap,
  Target,
  TrendingUp,
  Award,
  Globe,
  Database,
  Settings,
  Share2,
  Copy,
  Archive,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useAdminStore from '@/store/useAdminStore'
import { toast } from 'sonner'

const CurriculumPage = () => {
  const { 
    curriculums, 
    isLoading, 
    error, 
    getCurriculums,
    addCurriculum,
    updateCurriculum,
    deleteCurriculum
  } = useAdminStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCurriculum, setSelectedCurriculum] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Form states
  const [newCurriculum, setNewCurriculum] = useState({
    curriculum_name: '',
    subject: '',
    grade: '1',
    description: '',
    objectives: '',
    duration: '',
    difficulty: 'beginner',
    tags: [],
    isActive: true,
    file_id: '',
    ocrfile_id: '',
    url: ''
  })

  const [editCurriculum, setEditCurriculum] = useState({
    curriculum_name: '',
    subject: '',
    grade: '1',
    description: '',
    objectives: '',
    duration: '',
    difficulty: 'beginner',
    tags: [],
    isActive: true,
    file_id: '',
    ocrfile_id: '',
    url: ''
  })

  useEffect(() => {
    getCurriculums()
  }, [getCurriculums])

  // Filter and sort curriculums
  const filteredCurriculums = curriculums
    .filter(curriculum => {
      const matchesSearch = curriculum.curriculum_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           curriculum.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           curriculum.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGrade = selectedGrade === 'all' || curriculum.grade === selectedGrade
      const matchesSubject = selectedSubject === 'all' || curriculum.subject === selectedSubject
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && curriculum.isActive) ||
                           (selectedStatus === 'inactive' && !curriculum.isActive)
      
      return matchesSearch && matchesGrade && matchesSubject && matchesStatus
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || ''
      let bValue = b[sortBy] || ''
      
      if (sortBy === 'curriculum_name') {
        aValue = a.curriculum_name || ''
        bValue = b.curriculum_name || ''
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleAddCurriculum = async (e) => {
    e.preventDefault()
    try {
      await addCurriculum(newCurriculum)
      setIsAddDialogOpen(false)
      setNewCurriculum({
        curriculum_name: '',
        subject: '',
        grade: '1',
        description: '',
        objectives: '',
        duration: '',
        difficulty: 'beginner',
        tags: [],
        isActive: true,
        file_id: '',
        ocrfile_id: '',
        url: ''
      })
      toast.success('Curriculum added successfully!')
    } catch (error) {
      toast.error('Failed to add curriculum')
    }
  }

  const handleEditCurriculum = async (e) => {
    e.preventDefault()
    try {
      await updateCurriculum(selectedCurriculum.id || selectedCurriculum._id, editCurriculum)
      setIsEditDialogOpen(false)
      setSelectedCurriculum(null)
      toast.success('Curriculum updated successfully!')
    } catch (error) {
      toast.error('Failed to update curriculum')
    }
  }

  const handleDeleteCurriculum = async (curriculumId) => {
    if (confirm('Are you sure you want to delete this curriculum?')) {
      try {
        await deleteCurriculum(curriculumId)
        toast.success('Curriculum deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete curriculum')
      }
    }
  }

  const openEditDialog = (curriculum) => {
    setSelectedCurriculum(curriculum)
    setEditCurriculum({
      curriculum_name: curriculum.curriculum_name || '',
      subject: curriculum.subject || '',
      grade: curriculum.grade || '1',
      description: curriculum.description || '',
      objectives: curriculum.objectives || '',
      duration: curriculum.duration || '',
      difficulty: curriculum.difficulty || 'beginner',
      tags: curriculum.tags || [],
      isActive: curriculum.isActive !== false,
      file_id: curriculum.file_id || '',
      ocrfile_id: curriculum.ocrfile_id || '',
      url: curriculum.url || ''
    })
    setIsEditDialogOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSubjectIcon = (subject) => {
    switch (subject?.toLowerCase()) {
      case 'mathematics': return '🔢'
      case 'science': return '🔬'
      case 'english': return '📚'
      case 'history': return '🏛️'
      case 'geography': return '🗺️'
      case 'art': return '🎨'
      case 'music': return '🎵'
      case 'physical education': return '⚽'
      default: return '📖'
    }
  }

  const CurriculumCard = ({ curriculum, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className="group h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-full flex flex-col overflow-hidden">
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4 flex gap-2">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => openEditDialog(curriculum)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Curriculum
                  </DropdownMenuItem>
                  {curriculum.url && (
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleDeleteCurriculum(curriculum.id || curriculum._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="text-4xl">{getSubjectIcon(curriculum.subject)}</div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">
                  {curriculum.curriculum_name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {curriculum.subject}
                </p>
              </div>
            </div>
            
            {curriculum.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {curriculum.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                {curriculum.grade}
              </Badge>
              <Badge className={`text-xs ${getDifficultyColor(curriculum.difficulty)}`}>
                <Target className="h-3 w-3 mr-1" />
                {curriculum.difficulty}
              </Badge>
              {curriculum.duration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {curriculum.duration}
                </Badge>
              )}
            </div>
            
            {curriculum.tags && curriculum.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {curriculum.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {curriculum.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{curriculum.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.8</span>
              </div>
              <span className="text-xs text-slate-500">(24 reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => openEditDialog(curriculum)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {curriculum.url && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => window.open(curriculum.url, '_blank')}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const CurriculumListItem = ({ curriculum, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
                {getSubjectIcon(curriculum.subject)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                    {curriculum.curriculum_name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {curriculum.subject} • Grade {curriculum.grade}
                  </p>
                  {curriculum.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                      {curriculum.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Badge 
                    variant={curriculum.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {curriculum.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(curriculum.difficulty)}`}>
                    {curriculum.difficulty}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEditDialog(curriculum)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteCurriculum(curriculum.id || curriculum._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading && curriculums.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading curriculums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Curriculum Management
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300">
                Create, organize, and manage educational curriculums
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50 text-xs sm:text-sm">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50 text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50 text-xs sm:text-sm">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Curriculum
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Curriculum</DialogTitle>
                    <DialogDescription>
                      Create a new curriculum with all necessary details and resources.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCurriculum} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="curriculum_name">Curriculum Name</Label>
                        <Input
                          id="curriculum_name"
                          value={newCurriculum.curriculum_name}
                          onChange={(e) => setNewCurriculum({...newCurriculum, curriculum_name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={newCurriculum.subject}
                          onChange={(e) => setNewCurriculum({...newCurriculum, subject: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Select value={newCurriculum.grade} onValueChange={(value) => setNewCurriculum({...newCurriculum, grade: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 12}, (_, i) => (
                              <SelectItem key={i+1} value={String(i+1)}>Grade {i+1}</SelectItem>
                            ))}
                            <SelectItem value="K">Kindergarten</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={newCurriculum.duration}
                          onChange={(e) => setNewCurriculum({...newCurriculum, duration: e.target.value})}
                          placeholder="e.g., 12 weeks"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={newCurriculum.difficulty} onValueChange={(value) => setNewCurriculum({...newCurriculum, difficulty: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCurriculum.description}
                        onChange={(e) => setNewCurriculum({...newCurriculum, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="objectives">Learning Objectives</Label>
                      <Textarea
                        id="objectives"
                        value={newCurriculum.objectives}
                        onChange={(e) => setNewCurriculum({...newCurriculum, objectives: e.target.value})}
                        rows={3}
                        placeholder="List the key learning objectives..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="url">Resource URL (optional)</Label>
                      <Input
                        id="url"
                        type="url"
                        value={newCurriculum.url}
                        onChange={(e) => setNewCurriculum({...newCurriculum, url: e.target.value})}
                        placeholder="https://example.com/resource"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={newCurriculum.isActive}
                        onCheckedChange={(checked) => setNewCurriculum({...newCurriculum, isActive: checked})}
                      />
                      <Label htmlFor="isActive">Active Curriculum</Label>
                    </div>
                    
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? 'Adding...' : 'Add Curriculum'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Curriculums</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{curriculums.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Curriculums</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {curriculums.filter(c => c.isActive !== false).length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Subjects</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {new Set(curriculums.map(c => c.subject)).size}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Tag className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Rating</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">4.8</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600 fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters and Controls */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search curriculums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                
                <div className="flex gap-2 sm:gap-4">
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>Grade {i+1}</SelectItem>
                      ))}
                      <SelectItem value="K">Kindergarten</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {Array.from(new Set(curriculums.map(c => c.subject))).map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredCurriculums.length} curriculums found
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => {setSortBy('curriculum_name'); setSortOrder('asc')}}>
                        <SortAsc className="h-4 w-4 mr-2" />
                        Name A-Z
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {setSortBy('curriculum_name'); setSortOrder('desc')}}>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Name Z-A
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {setSortBy('grade'); setSortOrder('asc')}}>
                        <SortAsc className="h-4 w-4 mr-2" />
                        Grade Low-High
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {setSortBy('grade'); setSortOrder('desc')}}>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Grade High-Low
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Curriculums Grid/List */}
        <motion.div 
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            : "space-y-4"
          }
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredCurriculums.map((curriculum, index) => 
              viewMode === 'grid' ? (
                <CurriculumCard key={curriculum.id || curriculum._id} curriculum={curriculum} index={index} />
              ) : (
                <CurriculumListItem key={curriculum.id || curriculum._id} curriculum={curriculum} index={index} />
              )
            )}
          </AnimatePresence>
        </motion.div>

        {filteredCurriculums.length === 0 && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No curriculums found</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm || selectedGrade !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by creating your first curriculum.'
                }
              </p>
              {!searchTerm && selectedGrade === 'all' && selectedSubject === 'all' && selectedStatus === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Curriculum
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Curriculum</DialogTitle>
              <DialogDescription>
                Update the curriculum details and settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCurriculum} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_curriculum_name">Curriculum Name</Label>
                  <Input
                    id="edit_curriculum_name"
                    value={editCurriculum.curriculum_name}
                    onChange={(e) => setEditCurriculum({...editCurriculum, curriculum_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_subject">Subject</Label>
                  <Input
                    id="edit_subject"
                    value={editCurriculum.subject}
                    onChange={(e) => setEditCurriculum({...editCurriculum, subject: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_grade">Grade</Label>
                  <Select value={editCurriculum.grade} onValueChange={(value) => setEditCurriculum({...editCurriculum, grade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>Grade {i+1}</SelectItem>
                      ))}
                      <SelectItem value="K">Kindergarten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_duration">Duration</Label>
                  <Input
                    id="edit_duration"
                    value={editCurriculum.duration}
                    onChange={(e) => setEditCurriculum({...editCurriculum, duration: e.target.value})}
                    placeholder="e.g., 12 weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_difficulty">Difficulty</Label>
                  <Select value={editCurriculum.difficulty} onValueChange={(value) => setEditCurriculum({...editCurriculum, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editCurriculum.description}
                  onChange={(e) => setEditCurriculum({...editCurriculum, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_objectives">Learning Objectives</Label>
                <Textarea
                  id="edit_objectives"
                  value={editCurriculum.objectives}
                  onChange={(e) => setEditCurriculum({...editCurriculum, objectives: e.target.value})}
                  rows={3}
                  placeholder="List the key learning objectives..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_url">Resource URL (optional)</Label>
                <Input
                  id="edit_url"
                  type="url"
                  value={editCurriculum.url}
                  onChange={(e) => setEditCurriculum({...editCurriculum, url: e.target.value})}
                  placeholder="https://example.com/resource"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_isActive"
                  checked={editCurriculum.isActive}
                  onCheckedChange={(checked) => setEditCurriculum({...editCurriculum, isActive: checked})}
                />
                <Label htmlFor="edit_isActive">Active Curriculum</Label>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Updating...' : 'Update Curriculum'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CurriculumPage
