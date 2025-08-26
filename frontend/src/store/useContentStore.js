'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import PythonApi from "@/lib/PythonApi";
import useAuthStore from "@/store/useAuthStore";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useContentStore = create(
    persist(
        (set, get) => ({
            // State
            savedContent: [],
            generatedContent: "",
            isLoading: false,
            isGenerating: false,
            isSaving: false,
            error: null,

            // Actions
            setGeneratedContent: (content) => set({ generatedContent: content }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Fetch all saved content
            fetchSavedContent: async () => {
                set({ isLoading: true, error: null });
                try {
                    // Get user from auth store instead of content store
                    const authStore = useAuthStore.getState();
                    const user = authStore.user;
                    const endpoint = user?.role === 'student' ? '/student' : '/all';
                    const response = await axiosInstance.get(`/api/content${endpoint}`);
                    
                    if (response.status === 200) {
                        set({ savedContent: response.data.content || [], isLoading: false });
                        return response.data.content;
                    }
                } catch (error) {
                    console.error('Failed to fetch content:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to load saved content',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Generate content using Python API
            generateContent: async (contentData) => {
                set({ isGenerating: true, error: null });
                try {
                    // Use Python API to generate content
                    const response = await PythonApi.generateContent(contentData);
                    
                    console.log('Python API response:', response);
                    
                    // Handle different response structures
                    let content = null;
                    
                    if (typeof response === 'string') {
                        // If response is a direct string
                        content = response;
                    } else if (response && typeof response === 'object') {
                        // If response is an object, look for content in different possible properties
                        content = response.content || 
                                 response.generated_content || 
                                 response.text || 
                                 response.result || 
                                 response.data ||
                                 response.message ||
                                 JSON.stringify(response);
                    } else {
                        // Fallback: convert response to string
                        content = String(response);
                    }
                    
                    if (!content) {
                        throw new Error('No content received from the API');
                    }
                    
                    set({ 
                        generatedContent: content,
                        isGenerating: false 
                    });
                    return content;
                } catch (error) {
                    console.error('Content generation error:', error);
                    set({ 
                        error: error.message || 'Failed to generate content',
                        isGenerating: false 
                    });
                    throw error;
                }
            },

            // Save generated content to backend
            saveContent: async (contentData) => {
                set({ isSaving: true, error: null });
                try {
                    // Get current user to ensure we use their grade
                    const user = get().user;
                    
                    // Prepare the data for backend - ensure all required fields are present
                    const saveData = {
                        subject: contentData.subject,
                        topic: contentData.topic,
                        grade: user?.grade || contentData.grade, // Use teacher's grade automatically
                        contentType: contentData.contentType,
                        generatedContent: contentData.generatedContent,
                        // Optional fields with defaults
                        emotionalFlags: contentData.emotionalFlags || '',
                        adaptiveLevel: contentData.adaptiveLevel || false,
                        includeAssessment: contentData.includeAssessment || false,
                        multimediaSuggestions: contentData.multimediaSuggestions || false,
                        generateSlides: contentData.generateSlides || false,
                        instructionalDepth: contentData.instructionalDepth || 'standard',
                        contentVersion: contentData.contentVersion || 'standard',
                        objectives: contentData.objectives || '',
                        language: contentData.language || 'English',
                    };

                    console.log('Sending save data:', saveData);

                    const response = await axiosInstance.post("/api/content/create", saveData);
                    
                    if (response.status === 201) {
                        // Refresh the saved content list
                        await get().fetchSavedContent();
                        set({ isSaving: false });
                        return response.data.content;
                    }
                } catch (error) {
                    console.error('Save content error:', error);
                    const errorMessage = error.response?.data?.message || 'Failed to save content';
                    set({ 
                        error: errorMessage,
                        isSaving: false 
                    });
                    throw error;
                }
            },

            // Update existing content
            updateContent: async (contentId, contentData) => {
                set({ isSaving: true, error: null });
                try {
                    // Get current user to ensure we use their grade
                    const user = get().user;
                    
                    // Ensure the grade is set to teacher's grade
                    const updateData = {
                        ...contentData,
                        grade: user?.grade || contentData.grade // Use teacher's grade automatically
                    };
                    
                    const response = await axiosInstance.put(`/api/content/${contentId}`, updateData);
                    
                    if (response.status === 200) {
                        await get().fetchSavedContent();
                        set({ isSaving: false });
                        return response.data.content;
                    }
                } catch (error) {
                    console.error('Update content error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to update content',
                        isSaving: false 
                    });
                    throw error;
                }
            },

            // Delete content
            deleteContent: async (contentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete(`/api/content/${contentId}`);
                    
                    if (response.status === 200) {
                        set({ 
                            savedContent: get().savedContent.filter(item => item._id !== contentId),
                            isLoading: false 
                        });
                        return true;
                    }
                } catch (error) {
                    console.error('Delete content error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to delete content',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Get content by ID
            getContentById: async (contentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get(`/api/content/${contentId}`);
                    
                    if (response.status === 200) {
                        set({ isLoading: false });
                        return response.data.content;
                    }
                } catch (error) {
                    console.error('Get content error:', error);
                    set({ 
                        error: error.response?.data?.message || 'Failed to get content',
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Generate slides from content
            generateSlidesFromContent: async (slideData) => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await PythonApi.generateSlidesFromContent(slideData);
                    set({ isGenerating: false });
                    return response;
                } catch (error) {
                    console.error('Slide generation error:', error);
                    set({ 
                        error: error.message || 'Failed to generate slides',
                        isGenerating: false 
                    });
                    throw error;
                }
            },

            // Clear generated content
            clearGeneratedContent: () => {
                set({ generatedContent: "", error: null });
            },

            // Clear all state
            clearContentStore: () => {
                set({ 
                    savedContent: [],
                    generatedContent: "",
                    isLoading: false,
                    isGenerating: false,
                    isSaving: false,
                    error: null
                });
            }
        }),
        {
            name: "content-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                savedContent: state.savedContent
                // Remove generatedContent from persistence
            }),
        }
    )
);

export default useContentStore;
