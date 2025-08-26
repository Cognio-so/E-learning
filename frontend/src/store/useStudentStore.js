'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useStudentStore = create(
    persist(
        (set, get) => ({
            // State
            students: [],
            studentLessons: [],
            studentResources: [],
            isLoading: false,
            error: null,
            selectedStudent: null,

            // Actions
            setSelectedStudent: (student) => set({ selectedStudent: student }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Fetch all students (for teachers)
            fetchStudents: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get("/api/auth/all");
                    if (response.status === 200) {
                        set({ students: response.data.students || [], isLoading: false });
                        return response.data.students;
                    }
                } catch (error) {
                    console.error('Failed to fetch students:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to load students',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Fetch student's lessons and resources
            fetchStudentData: async (studentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get("/api/lessons/student");
                    if (response.status === 200) {
                        const lessons = response.data.lessons || [];
                        
                        // Extract all resources from lessons - only show content added to lessons
                        const allResources = [];
                        
                        lessons.forEach(lesson => {
                            // Add assessments
                            if (lesson.assessmentIds && Array.isArray(lesson.assessmentIds)) {
                                lesson.assessmentIds.forEach(assessment => {
                                    if (assessment) {
                                        allResources.push({
                                            ...assessment,
                                            lessonTitle: lesson.title,
                                            lessonId: lesson._id,
                                            resourceType: 'assessment',
                                            lessonType: lesson.lessonType,
                                            subject: lesson.subject,
                                            grade: lesson.grade,
                                            difficulty: lesson.difficulty || 'intermediate',
                                            estimatedTimeMinutes: lesson.duration || 60,
                                            rating: assessment.rating || 4.5,
                                            views: assessment.views || 0,
                                            likes: assessment.likes || 0
                                        });
                                    }
                                });
                            }

                            // Add content
                            if (lesson.contentIds && Array.isArray(lesson.contentIds)) {
                                lesson.contentIds.forEach(content => {
                                    if (content) {
                                        allResources.push({
                                            ...content,
                                            lessonTitle: lesson.title,
                                            lessonId: lesson._id,
                                            resourceType: 'content',
                                            lessonType: lesson.lessonType,
                                            subject: lesson.subject,
                                            grade: lesson.grade,
                                            difficulty: lesson.difficulty || 'intermediate',
                                            estimatedTimeMinutes: lesson.duration || 60,
                                            rating: content.rating || 4.5,
                                            views: content.views || 0,
                                            likes: content.likes || 0
                                        });
                                    }
                                });
                            }

                            // Add images
                            if (lesson.imageIds && Array.isArray(lesson.imageIds)) {
                                lesson.imageIds.forEach(image => {
                                    if (image) {
                                        allResources.push({
                                            ...image,
                                            lessonTitle: lesson.title,
                                            lessonId: lesson._id,
                                            resourceType: 'image',
                                            lessonType: lesson.lessonType,
                                            subject: lesson.subject,
                                            grade: lesson.grade,
                                            difficulty: lesson.difficulty || 'intermediate',
                                            estimatedTimeMinutes: lesson.duration || 60,
                                            rating: image.rating || 4.5,
                                            views: image.views || 0,
                                            likes: image.likes || 0
                                        });
                                    }
                                });
                            }

                            // Add comics
                            if (lesson.comicIds && Array.isArray(lesson.comicIds)) {
                                lesson.comicIds.forEach(comic => {
                                    if (comic) {
                                        allResources.push({
                                            ...comic,
                                            lessonTitle: lesson.title,
                                            lessonId: lesson._id,
                                            resourceType: 'comic',
                                            lessonType: lesson.lessonType,
                                            subject: lesson.subject,
                                            grade: lesson.grade,
                                            difficulty: lesson.difficulty || 'intermediate',
                                            estimatedTimeMinutes: lesson.duration || 60,
                                            rating: comic.rating || 4.5,
                                            views: comic.views || 0,
                                            likes: comic.likes || 0
                                        });
                                    }
                                });
                            }

                            // Add slides
                            if (lesson.slideIds && Array.isArray(lesson.slideIds)) {
                                lesson.slideIds.forEach(slide => {
                                    if (slide) {
                                        allResources.push({
                                            ...slide,
                                            lessonTitle: lesson.title,
                                            lessonId: lesson._id,
                                            resourceType: 'slide',
                                            lessonType: lesson.lessonType,
                                            subject: lesson.subject,
                                            grade: lesson.grade,
                                            difficulty: lesson.difficulty || 'intermediate',
                                            estimatedTimeMinutes: lesson.duration || 60,
                                            rating: slide.rating || 4.5,
                                            views: slide.views || 0,
                                            likes: slide.likes || 0
                                        });
                                    }
                                });
                            }

                            // Add web searches
                            if (lesson.webSearchIds && Array.isArray(lesson.webSearchIds)) {
                                lesson.webSearchIds.forEach(webSearch => {
                                    if (webSearch) {
                                        allResources.push({
                                            ...webSearch,
                                            lessonTitle: lesson.title,
                                            lessonId: lesson._id,
                                            resourceType: 'webSearch',
                                            lessonType: lesson.lessonType,
                                            subject: lesson.subject,
                                            grade: lesson.grade,
                                            difficulty: lesson.difficulty || 'intermediate',
                                            estimatedTimeMinutes: lesson.duration || 60,
                                            rating: webSearch.rating || 4.5,
                                            views: webSearch.views || 0,
                                            likes: webSearch.likes || 0
                                        });
                                    }
                                });
                            }
                        });

                        set({ 
                            studentLessons: lessons,
                            studentResources: allResources,
                            isLoading: false 
                        });
                        
                        return { lessons, resources: allResources };
                    }
                } catch (error) {
                    console.error('Failed to fetch student data:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to load student data',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Get resources by type
            getResourcesByType: (type) => {
                const { studentResources } = get();
                return studentResources.filter(resource => resource.resourceType === type);
            },

            // Get resources by lesson
            getResourcesByLesson: (lessonId) => {
                const { studentResources } = get();
                return studentResources.filter(resource => resource.lessonId === lessonId);
            },

            // Get lessons by type
            getLessonsByType: (lessonType) => {
                const { studentLessons } = get();
                return studentLessons.filter(lesson => lesson.lessonType === lessonType);
            },

            // Filter resources by criteria
            filterResources: (filters) => {
                const { studentResources } = get();
                return studentResources.filter(resource => {
                    const searchMatch = !filters.search || 
                        resource.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        resource.topic?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        resource.subject?.toLowerCase().includes(filters.search.toLowerCase());

                    const subjectMatch = filters.subject === 'All' || resource.subject === filters.subject;
                    const gradeMatch = filters.grade === 'All' || resource.grade === filters.grade;
                    const typeMatch = filters.type === 'All' || resource.resourceType === filters.type;

                    return searchMatch && subjectMatch && gradeMatch && typeMatch;
                });
            },

            // Delete student (for teachers)
            deleteStudent: async (studentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete(`/api/auth/student/${studentId}`);
                    
                    if (response.status === 200) {
                        set({ 
                            students: get().students.filter(student => student._id !== studentId),
                            isLoading: false 
                        });
                        return true;
                    }
                } catch (error) {
                    console.error('Delete student error:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to delete student',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Assign assessment to student (for teachers)
            assignAssessment: async (studentId, assessmentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post("/api/assessment/assign", {
                        studentId,
                        assessmentId
                    });
                    
                    if (response.status === 201) {
                        set({ isLoading: false });
                        return response.data;
                    }
                } catch (error) {
                    console.error('Assign assessment error:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to assign assessment',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Remove assessment from student (for teachers)
            removeAssessment: async (assessmentId, studentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete("/api/assessment/assigned", {
                        data: { id: assessmentId, studentId }
                    });
                    
                    if (response.status === 200) {
                        set({ isLoading: false });
                        return response.data;
                    }
                } catch (error) {
                    console.error('Remove assessment error:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to remove assessment',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Get assigned assessments for a student (for teachers)
            getAssignedAssessments: async (studentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get(`/api/assessment/assigned/${studentId}`);
                    
                    if (response.status === 200) {
                        set({ isLoading: false });
                        return response.data.assessment;
                    }
                } catch (error) {
                    console.error('Get assigned assessments error:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to get assigned assessments',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Clear all state
            clearStudentStore: () => {
                set({ 
                    students: [],
                    studentLessons: [],
                    studentResources: [],
                    isLoading: false,
                    error: null,
                    selectedStudent: null
                });
            },
        }),
        {
            name: "student-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                students: state.students,
                studentLessons: state.studentLessons,
                studentResources: state.studentResources
            }),
        }
    )
);

export default useStudentStore;
