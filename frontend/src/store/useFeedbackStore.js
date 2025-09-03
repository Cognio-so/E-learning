'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from 'sonner';
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useFeedbackStore = create(
    persist(
        (set, get) => ({
            feedback: {},
            userFeedback: [],
            isLoading: false,
            error: null,

            // Set and clear error
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Submit feedback
            submitFeedback: async (feedbackData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post('/api/feedback/submit', feedbackData);
                    
                    if (response.status === 201 || response.status === 200) {
                        const newFeedback = response.data.data;
                        
                        // Update local state
                        set(state => ({
                            feedback: {
                                ...state.feedback,
                                [feedbackData.resourceId]: newFeedback
                            },
                            userFeedback: state.userFeedback.map(f => 
                                f.resourceId === feedbackData.resourceId ? newFeedback : f
                            ).filter(f => f.resourceId !== feedbackData.resourceId).concat([newFeedback]),
                            isLoading: false
                        }));
                        
                        toast.success('Feedback submitted successfully! 🎉');
                        return newFeedback;
                    }
                } catch (error) {
                    console.error('Failed to submit feedback:', error);
                    const errorMessage = error.response?.data?.message || 'Failed to submit feedback';
                    set({ 
                        error: errorMessage,
                        isLoading: false 
                    });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            // Get feedback for a resource
            getResourceFeedback: async (resourceId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get(`/api/feedback/resource/${resourceId}`);
                    
                    if (response.status === 200) {
                        const feedbackData = response.data.data;
                        
                        set(state => ({
                            feedback: {
                                ...state.feedback,
                                [resourceId]: feedbackData
                            },
                            isLoading: false
                        }));
                        
                        return feedbackData;
                    }
                } catch (error) {
                    console.error('Failed to get resource feedback:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to load feedback',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Get user's feedback history
            getUserFeedback: async (userId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get(`/api/feedback/user/${userId}`);
                    
                    if (response.status === 200) {
                        const userFeedback = response.data.data;
                        
                        set({ 
                            userFeedback,
                            isLoading: false 
                        });
                        
                        return userFeedback;
                    }
                } catch (error) {
                    console.error('Failed to get user feedback:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to load feedback history',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Update feedback
            updateFeedback: async (feedbackId, updateData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.put(`/api/feedback/${feedbackId}`, updateData);
                    
                    if (response.status === 200) {
                        const updatedFeedback = response.data.data;
                        
                        // Update local state
                        set(state => ({
                            feedback: {
                                ...state.feedback,
                                [updatedFeedback.resourceId]: updatedFeedback
                            },
                            userFeedback: state.userFeedback.map(f => 
                                f._id === feedbackId ? updatedFeedback : f
                            ),
                            isLoading: false
                        }));
                        
                        toast.success('Feedback updated successfully! ✨');
                        return updatedFeedback;
                    }
                } catch (error) {
                    console.error('Failed to update feedback:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to update feedback',
                        isLoading: false 
                    });
                    toast.error('Failed to update feedback');
                    throw error;
                }
            },

            // Delete feedback
            deleteFeedback: async (feedbackId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete(`/api/feedback/${feedbackId}`);
                    
                    if (response.status === 200) {
                        // Remove from local state
                        set(state => ({
                            userFeedback: state.userFeedback.filter(f => f._id !== feedbackId),
                            isLoading: false
                        }));
                        
                        toast.success('Feedback deleted successfully! 🗑️');
                        return true;
                    }
                } catch (error) {
                    console.error('Failed to delete feedback:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to delete feedback',
                        isLoading: false 
                    });
                    toast.error('Failed to delete feedback');
                    throw error;
                }
            },

            // Clear all state
            clearFeedbackStore: () => {
                set({ 
                    feedback: {},
                    userFeedback: [],
                    isLoading: false,
                    error: null
                });
            },
        }),
        {
            name: 'feedback-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useFeedbackStore;
