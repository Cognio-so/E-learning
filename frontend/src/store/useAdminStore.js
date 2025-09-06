'use client';
import { create } from "zustand";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useAdminStore = create((set, get) => ({
    // State
    users: [],
    curriculums: [],
    classes: [],
    subjects: [],
    analytics: {
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalCurriculums: 0,
        totalClasses: 0,
        totalSubjects: 0,
        activeUsers: 0,
        recentActivity: []
    },
    // Separate loading states
    isLoading: false,
    isLoadingUsers: false,
    isLoadingCurriculums: false,
    isLoadingClasses: false,
    error: null,
    // Cache timestamps
    lastUsersFetch: null,
    lastCurriculumsFetch: null,
    lastClassesFetch: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Helper function to check if data is fresh (5 minutes)
    isDataFresh: (timestamp) => {
        if (!timestamp) return false;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(timestamp) > fiveMinutesAgo;
    },

    // User Management
    getAllUsers: async () => {
        const state = get();
        if (state.isDataFresh(state.lastUsersFetch) && state.users.length > 0) {
            return; // Use cached data
        }

        set({ isLoadingUsers: true, error: null });
        try {
            const response = await axiosInstance.get('/api/admin/users');
            const users = response.data;
            
            // Calculate analytics
            const totalUsers = users.length;
            const totalStudents = users.filter(u => u.role === 'student').length;
            const totalTeachers = users.filter(u => u.role === 'teacher').length;
            const activeUsers = users.filter(u => {
                const lastActive = new Date(u.lastActive || u.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastActive >= weekAgo;
            }).length;

            set({ 
                users,
                lastUsersFetch: new Date().toISOString(),
                analytics: {
                    ...state.analytics,
                    totalUsers,
                    totalStudents,
                    totalTeachers,
                    activeUsers
                },
                isLoadingUsers: false 
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch users', isLoadingUsers: false });
        }
    },

    addUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/admin/add-user', userData);
            
            // Refresh users list
            await get().getAllUsers();
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to add user', isLoading: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateUserRole: async (userId, role) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/admin/update-role', { userId, role });
            
            // Update local state
            const updatedUsers = get().users.map(user => 
                user._id === userId ? { ...user, role } : user
            );
            set({ users: updatedUsers, isLoading: false });
            
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to update role', isLoading: false });
            throw error;
        }
    },

    deleteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post('/api/admin/delete-user', { userId });
            
            // Remove from local state
            const updatedUsers = get().users.filter(user => user._id !== userId);
            set({ users: updatedUsers, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to delete user', isLoading: false });
            throw error;
        }
    },

    // Curriculum Management
    getCurriculums: async () => {
        const state = get();
        if (state.isDataFresh(state.lastCurriculumsFetch) && state.curriculums.length > 0) {
            return; // Use cached data
        }

        set({ isLoadingCurriculums: true, error: null });
        try {
            console.log('Fetching curriculums...');
            const response = await axiosInstance.get('/api/admin/curriculums');
            console.log('Curriculums response:', response.data);
            const curriculums = response.data || [];
            
            set({ 
                curriculums,
                lastCurriculumsFetch: new Date().toISOString(),
                analytics: {
                    ...state.analytics,
                    totalCurriculums: curriculums.length
                },
                isLoadingCurriculums: false 
            });
            console.log('Curriculums set in store:', curriculums.length);
        } catch (error) {
            console.error('Error fetching curriculums:', error);
            set({ 
                curriculums: [],
                error: error.response?.data?.message || 'Failed to fetch curriculums', 
                isLoadingCurriculums: false 
            });
        }
    },

    addCurriculum: async (curriculumData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/admin/add-curriculum', curriculumData);
            // Invalidate cache and refresh
            set({ lastCurriculumsFetch: null });
            await get().getCurriculums();
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to add curriculum', isLoading: false });
            throw error;
        }
    },

    updateCurriculum: async (id, curriculumData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(`/api/admin/curriculum/${id}`, curriculumData);
            // Invalidate cache and refresh
            set({ lastCurriculumsFetch: null });
            await get().getCurriculums();
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to update curriculum', isLoading: false });
            throw error;
        }
    },

    deleteCurriculum: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/api/admin/curriculum/${id}`);
            // Invalidate cache and refresh
            set({ lastCurriculumsFetch: null });
            await get().getCurriculums();
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to delete curriculum', isLoading: false });
            throw error;
        }
    },

    // Classes & Subjects Management
    getClassesAndSubjects: async () => {
        const state = get();
        if (state.isDataFresh(state.lastClassesFetch) && state.classes.length > 0 && state.subjects.length > 0) {
            return; // Use cached data
        }

        set({ isLoadingClasses: true, error: null });
        try {
            console.log('Fetching classes and subjects...');
            
            // Get users and curriculums in parallel
            const [usersResponse, curriculumsResponse] = await Promise.all([
                axiosInstance.get('/api/admin/users'),
                axiosInstance.get('/api/admin/curriculums')
            ]);
            
            const users = usersResponse.data;
            const curriculums = curriculumsResponse.data || [];
            
            // Process classes from users (group by grade)
            const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
            const classes = grades.map(grade => {
                const students = users.filter(u => u.role === 'student' && u.grade === grade);
                const teachers = users.filter(u => u.role === 'teacher' && u.grade === grade);
                const gradeCurriculums = curriculums.filter(c => c.grade === grade);
                
                return {
                    id: `grade_${grade}`,
                    grade: grade,
                    name: grade === 'K' ? 'Kindergarten' : `Grade ${grade}`,
                    studentCount: students.length,
                    teacherCount: teachers.length,
                    curriculumCount: gradeCurriculums.length,
                    students: students,
                    teachers: teachers,
                    curriculums: gradeCurriculums,
                    isActive: students.length > 0 || teachers.length > 0,
                    createdAt: new Date().toISOString()
                };
            }).filter(cls => cls.isActive);
            
            // Process subjects from curriculums with unique IDs
            const subjectMap = new Map();
            curriculums.forEach((curriculum, index) => {
                const subject = curriculum.subject;
                if (!subjectMap.has(subject)) {
                    const uniqueId = `subject_${subject.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${index}`;
                    subjectMap.set(subject, {
                        id: uniqueId,
                        name: subject,
                        curriculumCount: 0,
                        gradeCount: 0,
                        curriculums: [],
                        grades: new Set(),
                        isActive: true,
                        createdAt: new Date().toISOString()
                    });
                }
                const subjectData = subjectMap.get(subject);
                subjectData.curriculumCount++;
                subjectData.grades.add(curriculum.grade);
                subjectData.curriculums.push(curriculum);
            });
            
            const subjects = Array.from(subjectMap.values()).map((subject, index) => ({
                ...subject,
                id: `subject_${subject.name.toLowerCase().replace(/\s+/g, '_')}_${index}`,
                gradeCount: subject.grades.size,
                grades: Array.from(subject.grades)
            }));
            
            set({ 
                classes,
                subjects,
                lastClassesFetch: new Date().toISOString(),
                analytics: {
                    ...state.analytics,
                    totalClasses: classes.length,
                    totalSubjects: subjects.length
                },
                isLoadingClasses: false 
            });
            
            console.log('Classes and subjects loaded:', { classes: classes.length, subjects: subjects.length });
        } catch (error) {
            console.error('Error fetching classes and subjects:', error);
            set({ 
                classes: [],
                subjects: [],
                error: error.response?.data?.message || 'Failed to fetch classes and subjects', 
                isLoadingClasses: false 
            });
        }
    },

    // Dashboard Analytics - now uses cached data
    getDashboardAnalytics: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log('Loading dashboard analytics...');
            
            // Use existing data if available, otherwise fetch
            await Promise.all([
                get().getAllUsers(),
                get().getCurriculums()
            ]);
            
            // Get the updated state after fetching
            const state = get();
            const users = state.users;
            const curriculums = state.curriculums;
            
            // Calculate analytics
            const totalUsers = users.length;
            const totalStudents = users.filter(u => u.role === 'student').length;
            const totalTeachers = users.filter(u => u.role === 'teacher').length;
            const activeUsers = users.filter(u => {
                const lastActive = new Date(u.lastActive || u.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastActive >= weekAgo;
            }).length;

            // Update analytics
            set({ 
                analytics: {
                    totalUsers,
                    totalStudents,
                    totalTeachers,
                    totalCurriculums: curriculums.length,
                    activeUsers,
                    recentActivity: []
                },
                isLoading: false 
            });
            
            console.log('Dashboard analytics loaded successfully:', {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalCurriculums: curriculums.length,
                activeUsers
            });
        } catch (error) {
            console.error('Error loading dashboard analytics:', error);
            set({ error: 'Failed to load dashboard data', isLoading: false });
        }
    }
}));

export default useAdminStore;
