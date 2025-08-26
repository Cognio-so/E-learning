'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import PythonApi from "@/lib/PythonApi";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useAssessmentStore = create(
    persist(
        (set, get) => ({
            // State
            assessments: [],
            generatedQuestions: [],
            generatedSolutions: [],
            rawContent: "",
            isLoading: false,
            isGenerating: false,
            isSaving: false,
            error: null,

            // Actions
            setGeneratedQuestions: (questions) => set({ generatedQuestions: questions }),
            setGeneratedSolutions: (solutions) => set({ generatedSolutions: solutions }),
            setRawContent: (content) => set({ rawContent: content }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Fetch all assessments
            fetchAssessments: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get("/api/assessment/all");
                    if (response.status === 200) {
                        set({ assessments: response.data.assessments || [], isLoading: false });
                        return response.data.assessments;
                    }
                } catch (error) {
                    console.error('Failed to fetch assessments:', error);
                    
                    // Handle 401 Unauthorized specifically
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to load assessments',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Generate assessment using Python API
            generateAssessment: async (assessmentData) => {
                set({ isGenerating: true, error: null });
                try {
                    // Use Python API to generate assessment
                    const response = await PythonApi.generateAssessment(assessmentData);
                    
                    console.log('Python API assessment response:', response);
                    
                    // The Python backend now returns structured data directly
                    let questions = [];
                    let solutions = [];
                    let rawContent = "";
                    
                    if (response && typeof response === 'object') {
                        // Direct structured response from Python backend
                        questions = response.questions || [];
                        solutions = response.solutions || [];
                        rawContent = response.raw_content || response.rawContent || '';
                    } else if (typeof response === 'string') {
                        // Fallback: if response is still a string, try to parse it
                        try {
                            const parsed = JSON.parse(response);
                            questions = parsed.questions || [];
                            solutions = parsed.solutions || [];
                            rawContent = parsed.raw_content || parsed.rawContent || response;
                        } catch (e) {
                            rawContent = response;
                        }
                    }
                    
                    // Additional debugging
                    console.log('Extracted questions:', questions);
                    console.log('Extracted solutions:', solutions);
                    console.log('Extracted rawContent:', rawContent);
                    
                    if (!questions || questions.length === 0) {
                        throw new Error('No questions received from the API. Response structure: ' + JSON.stringify(response));
                    }
                    
                    set({ 
                        generatedQuestions: questions,
                        generatedSolutions: solutions,
                        rawContent: rawContent,
                        isGenerating: false 
                    });
                    return { questions, solutions, rawContent };
                } catch (error) {
                    console.error('Assessment generation error:', error);
                    set({ 
                        error: error.message || 'Failed to generate assessment',
                        isGenerating: false 
                    });
                    throw error;
                }
            },

            // Create new assessment
            createAssessment: async (assessmentData) => {
                set({ isSaving: true, error: null });
                try {
                    // Prepare the data for backend - ensure all required fields are present
                    const saveData = {
                        title: assessmentData.title,
                        subject: assessmentData.subject,
                        grade: assessmentData.grade,
                        duration: parseInt(assessmentData.duration),
                        description: assessmentData.description || '',
                        topic: assessmentData.topic,
                        difficulty: assessmentData.difficulty,
                        learningObjectives: assessmentData.learningObjectives || '',
                        numQuestions: parseInt(assessmentData.numQuestions),
                        questionTypes: assessmentData.questionTypes,
                        anxietyTriggers: assessmentData.anxietyTriggers || '',
                        customPrompt: assessmentData.customPrompt || '',
                        language: assessmentData.language || 'English',
                        // Include generated content if available
                        questions: assessmentData.questions || get().generatedQuestions || [],
                        solutions: assessmentData.solutions || get().generatedSolutions || [],
                        rawContent: assessmentData.rawContent || get().rawContent || '',
                        status: assessmentData.status || 'draft'
                    };

                    console.log('Sending assessment data:', saveData);

                    const response = await axiosInstance.post("/api/assessment/create", saveData);
                    
                    if (response.status === 201) {
                        // Refresh the assessments list
                        await get().fetchAssessments();
                        set({ isSaving: false });
                        return response.data.assessment;
                    }
                } catch (error) {
                    console.error('Create assessment error:', error);
                    
                    // Handle 401 Unauthorized specifically
                    if (error.response?.status === 401) {
                        const errorMessage = error.response?.data?.message || 'Authentication required. Please log in again.';
                        set({ 
                            error: errorMessage,
                            isSaving: false 
                        });
                    } else {
                        const errorMessage = error.response?.data?.message || 'Failed to create assessment';
                        set({ 
                            error: errorMessage,
                            isSaving: false 
                        });
                    }
                    throw error;
                }
            },

            // Get assessment by ID
            getAssessmentById: async (assessmentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.get(`/api/assessment/${assessmentId}`);
                    
                    if (response.status === 200) {
                        set({ isLoading: false });
                        return response.data.assessment;
                    }
                } catch (error) {
                    console.error('Get assessment error:', error);
                    
                    // Handle 401 Unauthorized specifically
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to get assessment',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Update assessment
            updateAssessment: async (assessmentId, assessmentData) => {
                set({ isSaving: true, error: null });
                try {
                    const response = await axiosInstance.put(`/api/assessment/${assessmentId}`, assessmentData);
                    
                    if (response.status === 200) {
                        await get().fetchAssessments();
                        set({ isSaving: false });
                        return response.data.assessment;
                    }
                } catch (error) {
                    console.error('Update assessment error:', error);
                    
                    // Handle 401 Unauthorized specifically
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isSaving: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to update assessment',
                            isSaving: false 
                        });
                    }
                    throw error;
                }
            },

            // Delete assessment
            deleteAssessment: async (assessmentId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.delete(`/api/assessment/${assessmentId}`);
                    
                    if (response.status === 200) {
                        set({ 
                            assessments: get().assessments.filter(item => item._id !== assessmentId),
                            isLoading: false 
                        });
                        return true;
                    }
                } catch (error) {
                    console.error('Delete assessment error:', error);
                    
                    // Handle 401 Unauthorized specifically
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({ 
                            error: error.response?.data?.message || 'Failed to delete assessment',
                            isLoading: false 
                        });
                    }
                    throw error;
                }
            },

            // Clear generated content
            clearGeneratedContent: () => {
                set({ 
                    generatedQuestions: [], 
                    generatedSolutions: [], 
                    rawContent: "",
                    error: null 
                });
            },

            // Clear all state
            clearAssessmentStore: () => {
                set({ 
                    assessments: [],
                    generatedQuestions: [],
                    generatedSolutions: [],
                    rawContent: "",
                    isLoading: false,
                    isGenerating: false,
                    isSaving: false,
                    error: null
                });
            },

            // Add this method to debug authentication and data fetching
            debugAuthAndData: async () => {
                try {
                    console.log('Testing authentication...');
                    const response = await axiosInstance.get("/api/auth/user"); // Fixed: Changed from /me to /user
                    console.log('Auth status:', response.data);
                    
                    console.log('Testing assessment fetch...');
                    const assessmentResponse = await axiosInstance.get("/api/assessment/all");
                    console.log('Assessment response:', assessmentResponse.data);
                    
                    return { auth: response.data, assessments: assessmentResponse.data };
                } catch (error) {
                    console.error('Debug failed:', error.response?.status, error.response?.data);
                    return { error: error.response?.data };
                }
            },
        }),
        {
            name: "assessment-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                assessments: state.assessments
                // Remove generated content from persistence
            }),
        }
    )
);

export default useAssessmentStore;
