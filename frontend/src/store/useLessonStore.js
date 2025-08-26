'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useLessonStore = create(
    persist(
        (set, get) => ({
            // State
            lessons: [],
            isLoading: false,
            error: null,

            // Actions
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Create general lesson
            createLesson: async (lessonData) => {
                set({ isLoading: true, error: null });
                try {
                    // Validate lesson data before sending
                    if (!lessonData.title || !lessonData.description || !lessonData.subject || !lessonData.grade) {
                        throw new Error('Missing required lesson fields');
                    }

                    const response = await axiosInstance.post("/api/lessons/create", lessonData);
                    
                    if (response.status === 201) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Create lesson error:', error);
                    const errorMessage = error.response?.data?.message || error.message || 'Failed to create lesson';
                    set({ 
                        error: errorMessage,
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Create assessment-based lesson
            createAssessmentLesson: async (lessonData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post("/api/lessons/create-assessment", lessonData);
                    
                    if (response.status === 201) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Create assessment lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to create assessment lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Create content-based lesson
            createContentLesson: async (lessonData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post("/api/lessons/create-content", lessonData);
                    
                    if (response.status === 201) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Create content lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to create content lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Create media-based lesson
            createMediaLesson: async (lessonData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post("/api/lessons/create-media", lessonData);
                    
                    if (response.status === 201) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Create media lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to create media lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Add resource to lesson
            addResourceToLesson: async (lessonId, resourceType, resourceId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post(`/api/lessons/${lessonId}/add-resource`, {
                        resourceType,
                        resourceId
                    });
                    
                    if (response.status === 200) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Add resource to lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to add resource to lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Remove resource from lesson
            removeResourceFromLesson: async (lessonId, resourceType, resourceId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete(`/api/lessons/${lessonId}/remove-resource`, {
                        data: { resourceType, resourceId }
                    });
                    
                    if (response.status === 200) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Remove resource from lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to remove resource from lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Fetch all lessons
            fetchLessons: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get("/api/lessons/all");
                    if (response.status === 200) {
                        set({ lessons: response.data.lessons || [], isLoading: false });
                        return response.data.lessons;
                    }
                } catch (error) {
                    console.error('Failed to fetch lessons:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to load lessons',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Get lessons for students
            fetchStudentLessons: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get("/api/lessons/student");
                    if (response.status === 200) {
                        set({ lessons: response.data.lessons || [], isLoading: false });
                        return response.data.lessons;
                    }
                } catch (error) {
                    console.error('Failed to fetch student lessons:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to load lessons',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Update lesson
            updateLesson: async (lessonId, lessonData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.put(`/api/lessons/${lessonId}`, lessonData);
                    
                    if (response.status === 200) {
                        await get().fetchLessons();
                        set({ isLoading: false });
                        return response.data.lesson;
                    }
                } catch (error) {
                    console.error('Update lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to update lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Delete lesson
            deleteLesson: async (lessonId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete(`/api/lessons/${lessonId}`);
                    
                    if (response.status === 200) {
                        set({ 
                            lessons: get().lessons.filter(lesson => lesson._id !== lessonId),
                            isLoading: false 
                        });
                        return true;
                    }
                } catch (error) {
                    console.error('Delete lesson error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to delete lesson',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Clear all state
            clearLessonStore: () => {
                set({ 
                    lessons: [],
                    isLoading: false,
                    error: null
                });
            },
        }),
        {
            name: "lesson-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                lessons: state.lessons
            }),
        }
    )
);

export default useLessonStore;
