'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from 'sonner';
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useProgressStore = create(
    persist(
        (set, get) => ({
            progress: {},
            userProgress: [],
            learningStats: null,
            progressAnalytics: null,
            achievements: null,
            isLoading: false,
            error: null,

            // Set and clear error
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Get user progress for all resources
            fetchUserProgress: async (userId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get(`/api/progress/user/${userId}`);
                    
                    if (response.status === 200) {
                        const progressData = response.data?.data || [];
                        
                        // Convert to map for easy lookup
                        const progressMap = {};
                        if (Array.isArray(progressData)) {
                            progressData.forEach(p => {
                                progressMap[p.resourceId] = p;
                            });
                        }
                        
                        set({ 
                            userProgress: progressData,
                            progress: progressMap,
                            isLoading: false 
                        });
                        return progressData;
                    }
                } catch (error) {
                    console.error('Failed to fetch progress:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to load progress',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Get learning statistics
            fetchLearningStats: async (userId) => {
                try {
                    const response = await axiosInstance.get(`/api/progress/stats/${userId}`);
                    
                    if (response.status === 200) {
                        const stats = response.data.data;
                        set({ learningStats: stats });
                        return stats;
                    }
                } catch (error) {
                    console.error('Error fetching learning stats:', error);
                    return null;
                }
            },

            // Get progress analytics
            fetchProgressAnalytics: async (userId) => {
                try {
                    const response = await axiosInstance.get(`/api/progress/analytics/${userId}`);
                    
                    if (response.status === 200) {
                        const analytics = response.data.data;
                        set({ progressAnalytics: analytics });
                        return analytics;
                    }
                } catch (error) {
                    console.error('Error fetching progress analytics:', error);
                    return null;
                }
            },

            // Get achievements
            fetchAchievements: async (userId) => {
                try {
                    const response = await axiosInstance.get(`/api/progress/achievements/${userId}`);
                    
                    if (response.status === 200) {
                        const achievements = response.data.data;
                        set({ achievements });
                        return achievements;
                    }
                } catch (error) {
                    console.error('Error fetching achievements:', error);
                    return null;
                }
            },

            // Start learning a resource
            startLearning: async (userId, resourceId, resourceType, lessonId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post('/api/progress/start', {
                        userId, 
                        resourceId, 
                        resourceType, 
                        lessonId 
                    });
                    
                    if (response.status === 200) {
                        set(state => ({
                            progress: {
                                ...(state.progress || {}),
                                [resourceId]: response.data.data
                            },
                            isLoading: false
                        }));
                        
                        return response.data.data;
                    }
                } catch (error) {
                    console.error('Failed to start learning:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to start learning',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Update progress
            updateProgress: async (userId, resourceId, progress, timeSpent = 0) => {
                try {
                    const response = await axiosInstance.patch(`/api/progress/${userId}/${resourceId}`, {
                        progress, 
                        timeSpent 
                    });
                    
                    if (response.status === 200) {
                        set(state => ({
                            progress: {
                                ...(state.progress || {}),
                                [resourceId]: response.data.data
                            }
                        }));
                        
                        return response.data.data;
                    }
                } catch (error) {
                    console.error('Failed to update progress:', error);
                    throw error;
                }
            },

            // Complete resource
            completeResource: async (userId, resourceId) => {
                try {
                    const response = await axiosInstance.post(`/api/progress/${userId}/${resourceId}/complete`);
                    
                    if (response.status === 200) {
                        set(state => ({
                            progress: {
                                ...(state.progress || {}),
                                [resourceId]: response.data.data
                            }
                        }));
                        
                        return response.data.data;
                    }
                } catch (error) {
                    console.error('Failed to complete resource:', error);
                    throw error;
                }
            },

            // Submit assessment
            submitAssessment: async (userId, resourceId, answers) => {
                try {
                    const response = await axiosInstance.post(`/api/progress/${userId}/${resourceId}/assessment`, {
                        answers 
                    });
                    
                    if (response.status === 200) {
                        const responseData = response.data.data;
                        
                        // Update progress in store
                        set(state => ({
                            progress: {
                                ...(state.progress || {}),
                                [resourceId]: responseData.progress
                            }
                        }));
                        
                        return responseData;
                    }
                } catch (error) {
                    console.error('Failed to submit assessment:', error);
                    throw error;
                }
            },

            // Refresh all data
            refreshAllData: async (userId) => {
                try {
                    await Promise.all([
                        get().fetchUserProgress(userId),
                        get().fetchLearningStats(userId),
                        get().fetchProgressAnalytics(userId),
                        get().fetchAchievements(userId)
                    ]);
                } catch (error) {
                    console.error('Error refreshing data:', error);
                }
            }
        }),
        {
            name: 'progress-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useProgressStore;
