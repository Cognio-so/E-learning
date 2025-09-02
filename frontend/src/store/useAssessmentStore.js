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
                    
                    // Enhanced question detection and validation logic
                    let questions = [];
                    let solutions = [];
                    let rawContent = "";
                    
                    if (response && typeof response === 'object') {
                        // Direct structured response from Python backend
                        questions = get().validateAndNormalizeQuestions(response.questions || []);
                        solutions = get().validateAndNormalizeSolutions(response.solutions || []);
                        rawContent = response.raw_content || response.rawContent || '';
                    } else if (typeof response === 'string') {
                        // Fallback: if response is still a string, try to parse it
                        try {
                            const parsed = JSON.parse(response);
                            questions = get().validateAndNormalizeQuestions(parsed.questions || []);
                            solutions = get().validateAndNormalizeSolutions(parsed.solutions || []);
                            rawContent = parsed.raw_content || parsed.rawContent || response;
                        } catch (e) {
                            console.warn('Failed to parse response as JSON:', e);
                            rawContent = response;
                        }
                    }
                    
                    // Additional debugging
                    console.log('Extracted questions:', questions);
                    console.log('Extracted solutions:', solutions);
                    console.log('Extracted rawContent:', rawContent);
                    
                    // Enhanced validation with detailed error messages
                    if (!questions || questions.length === 0) {
                        throw new Error(`No valid questions received from the API. Expected questions array, got: ${JSON.stringify(response)}`);
                    }
                    
                    // Validate question structure
                    const invalidQuestions = questions.filter(q => !get().isValidQuestion(q));
                    if (invalidQuestions.length > 0) {
                        console.warn('Some questions have invalid structure:', invalidQuestions);
                        // Filter out invalid questions but continue with valid ones
                        questions = questions.filter(q => get().isValidQuestion(q));
                        if (questions.length === 0) {
                            throw new Error('All questions failed validation. Please check the API response format.');
                        }
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

            // Helper method to validate and normalize questions
            validateAndNormalizeQuestions: (questions) => {
                if (!Array.isArray(questions)) {
                    console.warn('Questions is not an array:', questions);
                    return [];
                }
                
                return questions.map((q, index) => {
                    if (!q || typeof q !== 'object') {
                        console.warn(`Question ${index} is not a valid object:`, q);
                        return null;
                    }
                    
                    // IMPROVEMENT: Added detailed logging for debugging
                    console.log(`Normalizing question ${index}:`, { raw: q });

                    // Extract embedded options if they exist in the question text
                    let questionText = q.question || q.text || q.content || q.questionText || '';
                    let extractedOptions = q.options || q.choices || q.answers || [];
                    
                    // Check if options are embedded in the question text
                    if ((!extractedOptions || extractedOptions.length === 0 || extractedOptions === null) && 
                        typeof questionText === 'string' && questionText.includes('A)')) {
                        const result = get().extractEmbeddedOptions(questionText);
                        questionText = result.cleanedText;
                        extractedOptions = result.options;
                        console.log(`Extracted options from question ${index}:`, extractedOptions);
                    }

                    // Detect the type using all available information including extracted options
                    const detectedType = get().detectQuestionType({
                        ...q,
                        question: questionText,
                        options: extractedOptions
                    });
                    
                    const normalized = {
                        id: q.id || `q_${index}`,
                        question: questionText,
                        type: detectedType,
                        options: get().normalizeOptions(extractedOptions, detectedType),
                        correctAnswer: q.correctAnswer || q.answer || q.correct_answer || '',
                        explanation: q.explanation || q.solution || '',
                        difficulty: q.difficulty || 'medium',
                        points: q.points || 1
                    };
                    
                    // Validate required fields
                    if (!normalized.question.trim()) {
                        console.warn(`Question ${index} has no question text:`, q);
                        return null;
                    }

                    console.log(`Result for question ${index}:`, { normalized: normalized });
                    
                    return normalized;
                }).filter(q => q !== null); // Remove invalid questions
            },

            // Helper method to validate and normalize solutions
            validateAndNormalizeSolutions: (solutions) => {
                if (!Array.isArray(solutions)) {
                    console.warn('Solutions is not an array:', solutions);
                    return [];
                }
                
                return solutions.map((s, index) => {
                    if (!s || typeof s !== 'object') {
                        console.warn(`Solution ${index} is not a valid object:`, s);
                        return null;
                    }
                    
                    return {
                        id: s.id || `s_${index}`,
                        questionId: s.questionId || `q_${index}`,
                        solution: s.solution || s.explanation || s.answer || '',
                        steps: s.steps || [],
                        hints: s.hints || []
                    };
                }).filter(s => s !== null);
            },

            // Helper method to extract embedded options from question text
            extractEmbeddedOptions: (text) => {
                const options = [];
                let cleanedText = text;
                
                // Pattern to match options like "A) option text B) option text"
                const optionPattern = /([A-D])\)\s*([^A-D]*?)(?=\s*[A-D]\)|$)/gi;
                const matches = [...text.matchAll(optionPattern)];
                
                if (matches.length > 0) {
                    // Extract options
                    matches.forEach(match => {
                        const optionText = match[2].trim();
                        if (optionText) {
                            options.push(optionText);
                        }
                    });
                    
                    // Clean the question text by removing the options part
                    // Find where the first option starts
                    const firstOptionIndex = text.search(/\s*A\)/i);
                    if (firstOptionIndex > 0) {
                        cleanedText = text.substring(0, firstOptionIndex).trim();
                        // Remove trailing question number if it exists
                        cleanedText = cleanedText.replace(/^\d+\.\s*/, '');
                    }
                }
                
                return { cleanedText, options };
            },

            // Helper method to detect question type
            detectQuestionType: (question) => {
                // First check if type is already provided and normalize it
                if (question.type || question.questionType) {
                    const providedType = (question.type || question.questionType || '').toLowerCase().trim();
                    
                    // Skip 'text' as it's not a valid question type - it's a fallback
                    if (providedType !== 'text') {
                        // Normalize common variations
                        if (providedType.includes('mcq') || providedType.includes('multiple')) {
                            return 'mcq';
                        }
                        if (providedType.includes('true') || providedType.includes('false') || providedType === 't/f' || providedType === 'tf') {
                            return 'true_false';
                        }
                        if (providedType.includes('short') || providedType.includes('answer')) {
                            return 'short_answer';
                        }
                    }
                }
                
                // Fallback detection based on content
                const questionText = (question.question || question.text || question.content || '').toLowerCase();
                const options = question.options || question.choices || question.answers || [];
                
                // Check for True/False questions by examining options
                if (Array.isArray(options) && options.length === 2) {
                    const normalizedOptions = options.map(opt => 
                        (typeof opt === 'string' ? opt : opt.text || '').toLowerCase().trim()
                    );
                    if (normalizedOptions.includes('true') && normalizedOptions.includes('false')) {
                        return 'true_false';
                    }
                }
                
                // Check for True/False in question text
                if (questionText.includes('true or false') || 
                    questionText.includes('true/false') ||
                    questionText.includes('(true or false)') ||
                    questionText.startsWith('t/f:')) {
                    return 'true_false';
                }
                
                // Check for MCQ questions (more than 2 options)
                if (Array.isArray(options) && options.length > 2) {
                    return 'mcq';
                }
                
                // Check for embedded options in question text
                if (questionText.includes('a)') && questionText.includes('b)')) {
                    if (questionText.includes('c)')) {
                        return 'mcq';
                    }
                    // Could be true/false with a) True b) False format
                    if (questionText.includes('true') && questionText.includes('false')) {
                        return 'true_false';
                    }
                    return 'mcq';
                }
                
                // If no options detected, it's a short answer
                return 'short_answer';
            },

            // Helper method to normalize options
            normalizeOptions: (options, questionType) => {
                // Handle null or undefined options
                if (options === null || options === undefined) {
                    options = [];
                }
                
                // For true/false questions, ensure we have standard options
                if (questionType === 'true_false') {
                    if (!Array.isArray(options) || options.length === 0) {
                        return ['True', 'False'];
                    }
                    // Normalize existing true/false options
                    return options.map(opt => {
                        const normalized = (typeof opt === 'string' ? opt : opt.text || opt.label || '').trim();
                        if (normalized.toLowerCase() === 'true') return 'True';
                        if (normalized.toLowerCase() === 'false') return 'False';
                        return normalized;
                    }).filter(opt => opt !== '');
                }
                
                // For short answer questions, options aren't needed
                if (questionType === 'short_answer') {
                    return [];
                }
                
                // For MCQ questions
                if (!Array.isArray(options)) {
                    return [];
                }
                
                return options.map((opt, index) => {
                    if (typeof opt === 'string') {
                        return opt.trim();
                    } else if (opt && typeof opt === 'object') {
                        return opt.text || opt.label || opt.option || opt.value || `Option ${index + 1}`;
                    }
                    return `Option ${index + 1}`;
                }).filter(opt => opt && opt.trim() !== '');
            },

            // Helper method to validate question structure
            isValidQuestion: (question) => {
                if (!question || typeof question !== 'object') {
                    return false;
                }
                
                const hasQuestionText = question.question && question.question.trim() !== '';
                const hasValidType = typeof question.type === 'string' && 
                                   ['mcq', 'true_false', 'short_answer'].includes(question.type);
                
                if (!hasQuestionText || !hasValidType) {
                    return false;
                }
                
                // Type-specific validation
                switch (question.type) {
                    case 'mcq':
                        // MCQ needs at least 2 options
                        return Array.isArray(question.options) && question.options.length >= 2;
                    
                    case 'true_false':
                        // True/False can auto-generate options if needed
                        return true;
                    
                    case 'short_answer':
                        // Short answer doesn't need options
                        return true;
                    
                    default:
                        return false;
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

            // Enhanced helper method to validate and normalize questions from backend
            validateAndNormalizeQuestionsFromBackend: (questions, rawContent) => {
                if (!Array.isArray(questions)) {
                    console.warn('Questions is not an array:', questions);
                    // Try to parse from rawContent if available
                    if (rawContent) {
                        return get().parseRawContentToQuestions(rawContent);
                    }
                    return [];
                }
                
                return questions.map((q, index) => {
                    if (!q || typeof q !== 'object') {
                        console.warn(`Question ${index} is not a valid object:`, q);
                        return null;
                    }
                    
                    // IMPROVEMENT: Added detailed logging for debugging
                    console.log(`Normalizing backend question ${index}:`, { raw: q });

                    // Extract embedded options if they exist in the question text
                    let questionText = q.question || q.text || q.content || q.questionText || '';
                    let extractedOptions = q.options || q.choices || q.answers || [];
                    
                    // Check if options are embedded in the question text
                    if ((!extractedOptions || extractedOptions.length === 0 || extractedOptions === null) && 
                        typeof questionText === 'string' && questionText.includes('A)')) {
                        const result = get().extractEmbeddedOptions(questionText);
                        questionText = result.cleanedText;
                        extractedOptions = result.options;
                        console.log(`Extracted options from backend question ${index}:`, extractedOptions);
                    }

                    // Detect the type using all available information including extracted options
                    const detectedType = get().detectQuestionType({
                        ...q,
                        question: questionText,
                        options: extractedOptions
                    });
                    
                    const normalized = {
                        id: q.id || `q_${index}`,
                        question: questionText,
                        type: detectedType,
                        options: get().normalizeOptions(extractedOptions, detectedType),
                        correctAnswer: q.correctAnswer || q.answer || q.correct_answer || '',
                        explanation: q.explanation || q.solution || '',
                        difficulty: q.difficulty || 'medium',
                        points: q.points || 1
                    };
                    
                    // Validate required fields
                    if (!normalized.question.trim()) {
                        console.warn(`Question ${index} has no question text:`, q);
                        return null;
                    }

                    console.log(`Result for backend question ${index}:`, { normalized: normalized });
                    
                    return normalized;
                }).filter(q => q !== null); // Remove invalid questions
            },

            // New method to parse raw content to questions (fallback)
            parseRawContentToQuestions: (rawContent) => {
                if (!rawContent || typeof rawContent !== 'string') {
                    return [];
                }

                const questions = [];
                const lines = rawContent.split('\n').filter(line => line.trim());
                
                let currentQuestion = null;
                let currentOptions = [];
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    
                    // Check if this is a new question (starts with a number)
                    if (/^\d+\./.test(line)) {
                        // Save previous question if exists
                        if (currentQuestion) {
                            questions.push({
                                ...currentQuestion,
                                options: currentOptions
                            });
                        }
                        
                        // Start new question
                        currentQuestion = {
                            question: line.replace(/^\d+\.\s*/, ''),
                            type: 'mcq', // Default type
                            correctAnswer: '',
                            explanation: ''
                        };
                        currentOptions = [];
                        
                    } else if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
                        // This is an option
                        const optionText = line.substring(2).trim();
                        if (optionText) {
                            currentOptions.push(optionText);
                        }
                        
                    } else if (line.startsWith('---') || line.startsWith('**Solutions**')) {
                        // Solutions section starts
                        break;
                    }
                }
                
                // Add the last question
                if (currentQuestion) {
                    questions.push({
                        ...currentQuestion,
                        options: currentOptions
                    });
                }
                
                // Determine question types and normalize
                return questions.map((q, index) => {
                    const questionText = q.question.toLowerCase();
                    
                    if (questionText.includes('true or false') || questionText.includes('true/false')) {
                        q.type = 'true_false';
                        q.options = ['True', 'False'];
                    } else if (q.options && q.options.length > 0) {
                        q.type = 'mcq';
                    } else {
                        q.type = 'short_answer';
                    }
                    
                    q.id = `q_${index}`;
                    return q;
                });
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