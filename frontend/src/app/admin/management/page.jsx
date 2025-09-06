'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Award,
  GraduationCap,
  BookOpen,
  Download,
  Upload,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAdminStore from '@/store/useAdminStore';
import { toast } from 'sonner';
import { subjects, grades } from '@/config/data';

const UserManagement = () => {
  const { 
    users, 
    curriculums, 
    isLoadingUsers,
    isLoadingCurriculums,
    error, 
    getAllUsers, 
    getCurriculums,
    addUser, 
    updateUserRole, 
    deleteUser,
    addCurriculum,
    deleteCurriculum 
  } = useAdminStore();

  // Local state - memoized to prevent unnecessary re-renders
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddCurriculumOpen, setIsAddCurriculumOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - memoized
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    grade: '1'
  });

  const [newCurriculum, setNewCurriculum] = useState({
    curriculum_name: '',
    subject: '',
    grade: '1',
    file_id: '',
    ocrfile_id: '',
    url: ''
  });

  // Memoized filtered users to prevent recalculation on every render
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesGrade = gradeFilter === 'all' || user.grade === gradeFilter;
      
      return matchesSearch && matchesRole && matchesGrade;
    });
  }, [users, searchTerm, roleFilter, gradeFilter]);

  // Stable callback for data fetching
  const fetchData = useCallback(() => {
    if (users.length === 0) {
      getAllUsers();
    }
    if (curriculums.length === 0) {
      getCurriculums();
    }
  }, [users.length, curriculums.length, getAllUsers, getCurriculums]);

  // Only fetch data once on mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array - only run once

  // Stable form handlers
  const handleAddUser = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addUser(newUser);
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'student', grade: '1' });
      toast.success('User added successfully!');
    } catch (error) {
      toast.error('Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  }, [newUser, addUser]);

  const handleAddCurriculum = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addCurriculum(newCurriculum);
      setIsAddCurriculumOpen(false);
      setNewCurriculum({ curriculum_name: '', subject: '', grade: '1', file_id: '', ocrfile_id: '', url: '' });
      toast.success('Curriculum added successfully!');
    } catch (error) {
      toast.error('Failed to add curriculum');
    } finally {
      setIsSubmitting(false);
    }
  }, [newCurriculum, addCurriculum]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  }, [deleteUser]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully!');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  }, [updateUserRole]);

  // Stable animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }), []);

  // Memoized UserCard component to prevent unnecessary re-renders
  const UserCard = useCallback(({ user, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className="group h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-full flex flex-col">
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white shadow-lg flex-shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className={`font-semibold text-white text-sm ${
                  user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  user.role === 'teacher' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}>
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg truncate">
                  {user.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                  <Badge 
                    variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}
                    className="capitalize text-xs"
                  >
                    {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                    {user.role === 'teacher' && <Award className="h-3 w-3 mr-1" />}
                    {user.role === 'student' && <GraduationCap className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                  {user.grade && (
                    <Badge variant="outline" className="text-xs">
                      {user.grade === 'KG1' || user.grade === 'KG2' ? user.grade : `Grade ${user.grade}`}
                    </Badge>
                  )}
                  {user.lastActive && (
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ), [itemVariants, handleDeleteUser]);

  // Memoized CurriculumCard component
  const CurriculumCard = useCallback(({ curriculum, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className="group h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-full flex flex-col">
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg truncate">
                  {curriculum.curriculum_name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                  {curriculum.subject}
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {curriculum.grade === 'KG1' || curriculum.grade === 'KG2' ? curriculum.grade : `Grade ${curriculum.grade}`}
                  </Badge>
                  {curriculum.url && (
                    <Badge variant="secondary" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
                  Edit Curriculum
                </DropdownMenuItem>
                {curriculum.url && (
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => deleteCurriculum(curriculum.id || curriculum._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ), [itemVariants, deleteCurriculum]);

  // Only show loading screen on initial load
  if ((isLoadingUsers || isLoadingCurriculums) && users.length === 0 && curriculums.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading management data...</p>
        </div>
      </div>
    );
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
                System Management
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300">
                Manage users, curriculums, and system resources
              </p>
            </div>
            <div className="flex justify-end">
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Create a new user account in the system.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={newUser.name}
                              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="role">Role</Label>
                              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="teacher">Teacher</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="grade">Grade</Label>
                              <Select value={newUser.grade} onValueChange={(value) => setNewUser({...newUser, grade: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {grades.map(grade => (
                                    <SelectItem key={grade} value={grade}>
                                      {grade === 'KG1' || grade === 'KG2' ? grade : `Grade ${grade}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                              {isSubmitting ? 'Adding...' : 'Add User'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
              <span className="ml-1">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="curriculums" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Curriculum Management</span>
              <span className="sm:hidden">Curriculums</span>
              <span className="ml-1">({curriculums.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            {/* Filters and Search */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-4">
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={gradeFilter} onValueChange={setGradeFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          {grades.map(grade => (
                            <SelectItem key={grade} value={grade}>
                              {grade === 'KG1' || grade === 'KG2' ? grade : `Grade ${grade}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            {/* Users Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredUsers.map((user, index) => (
                <UserCard key={user._id} user={user} index={index} />
              ))}
            </motion.div>

            {filteredUsers.length === 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8 sm:p-12 text-center">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No users found</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Curriculums Tab */}
          <TabsContent value="curriculums" className="space-y-4 sm:space-y-6">
            {/* Add Curriculum Button */}
            <div className="flex justify-end">
              <Dialog open={isAddCurriculumOpen} onOpenChange={setIsAddCurriculumOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Curriculum
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Curriculum</DialogTitle>
                    <DialogDescription>
                      Add a new curriculum to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCurriculum} className="space-y-4">
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
                      <Select value={newCurriculum.subject} onValueChange={(value) => setNewCurriculum({...newCurriculum, subject: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.title}>
                              {subject.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select value={newCurriculum.grade} onValueChange={(value) => setNewCurriculum({...newCurriculum, grade: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map(grade => (
                            <SelectItem key={grade} value={grade}>
                              {grade === 'KG1' || grade === 'KG2' ? grade : `Grade ${grade}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">Resource URL (optional)</Label>
                      <Input
                        id="url"
                        type="url"
                        value={newCurriculum.url}
                        onChange={(e) => setNewCurriculum({...newCurriculum, url: e.target.value})}
                      />
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddCurriculumOpen(false)} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? 'Adding...' : 'Add Curriculum'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Curriculums Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Array.isArray(curriculums) && curriculums.length > 0 ? curriculums.map((curriculum, index) => (
                <CurriculumCard key={curriculum.id || curriculum._id} curriculum={curriculum} index={index} />
              )) : null}
            </motion.div>

            {(!Array.isArray(curriculums) || curriculums.length === 0) && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8 sm:p-12 text-center">
                  <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No curriculums found</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Start by adding your first curriculum.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                        {selectedUser.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{selectedUser.name}</span>
                  </DialogTitle>
                  <DialogDescription>User details and information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</Label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Role</Label>
                      <Badge className="mt-1 capitalize">{selectedUser.role}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Grade</Label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedUser.grade === 'KG1' || selectedUser.grade === 'KG2' ? selectedUser.grade : `Grade ${selectedUser.grade}`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                      <Badge variant={selectedUser.isVerified ? "default" : "secondary"} className="mt-1">
                        {selectedUser.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</Label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Active</Label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setSelectedUser(null)} className="w-full sm:w-auto">
                    Close
                  </Button>
                  <Button className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserManagement;
