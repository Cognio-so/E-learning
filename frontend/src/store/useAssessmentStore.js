'use client';
import { create } from "zustand";
import axios from "axios";
import PythonApi from "@/lib/PythonApi";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useAssessmentStore = create(
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
                const response = await PythonApi.generateAssessment(assessmentData);
                
                console.log('Python API assessment response:', response);
                
                let questions = [];
                let solutions = [];
                let rawContent = "";
                
                if (response && typeof response === 'object') {
                    if (response.assessment) {
                        rawContent = response.assessment;
                        const parsed = get().parseRawContentToQuestions(rawContent);
                        questions = parsed.questions;
                        solutions = parsed.solutions;
                    } else if (response.questions) {
                        questions = get().validateAndNormalizeQuestions(response.questions || []);
                        solutions = get().validateAndNormalizeSolutions(response.solutions || []);
                        rawContent = response.raw_content || response.rawContent || '';
                    } else {
                        rawContent = typeof response === 'string' ? response : JSON.stringify(response);
                        const parsed = get().parseRawContentToQuestions(rawContent);
                        questions = parsed.questions;
                        solutions = parsed.solutions;
                    }
                } else if (typeof response === 'string') {
                    try {
                        const parsed = JSON.parse(response);
                        if (parsed.assessment) {
                            rawContent = parsed.assessment;
                            const contentParsed = get().parseRawContentToQuestions(rawContent);
                            questions = contentParsed.questions;
                            solutions = contentParsed.solutions;
                        } else {
                            questions = get().validateAndNormalizeQuestions(parsed.questions || []);
                            solutions = get().validateAndNormalizeSolutions(parsed.solutions || []);
                            rawContent = parsed.raw_content || parsed.rawContent || response;
                        }
                    } catch (e) {
                        console.warn('Failed to parse response as JSON:', e);
                        rawContent = response;
                        const parsed = get().parseRawContentToQuestions(rawContent);
                        questions = parsed.questions;
                        solutions = parsed.solutions;
                    }
                }
                
                console.log('Extracted questions:', questions);
                console.log('Extracted solutions:', solutions);
                console.log('Extracted rawContent:', rawContent);
                
                if (!questions || questions.length === 0) {
                    throw new Error(`No valid questions received from the API. Expected questions array, got: ${JSON.stringify(response)}`);
                }
                
                const invalidQuestions = questions.filter(q => !get().isValidQuestion(q));
                if (invalidQuestions.length > 0) {
                    console.warn('Some questions have invalid structure:', invalidQuestions);
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

        // FIXED: Enhanced parsing method that properly handles both questions and solutions
        parseRawContentToQuestions: (rawContent) => {
            if (!rawContent || typeof rawContent !== 'string') {
                return { questions: [], solutions: [] };
            }

            console.log('Parsing raw content:', rawContent);
            
            const questions = [];
            const solutions = [];
            const lines = rawContent.split('\n').map(line => line.trim()).filter(line => line);
            
            let currentQuestion = null;
            let currentOptions = [];
            let inSolutionsSection = false;
            let questionIndex = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Check for solutions section markers (supports both English and Arabic)
                if (line.startsWith('---') || 
                    line.toLowerCase().includes('solutions') || 
                    line.toLowerCase().includes('answers') ||
                    line.includes('الحلول') ||
                    line.toLowerCase().includes('**solutions**') ||
                    line.toLowerCase().includes('**answers**')) {
                    
                    // Save current question before entering solutions
                    if (currentQuestion) {
                        const processedQuestion = get().processQuestion(currentQuestion, currentOptions, questionIndex);
                        if (processedQuestion) {
                            questions.push(processedQuestion);
                            questionIndex++;
                        }
                        currentQuestion = null;
                        currentOptions = [];
                    }
                    
                    inSolutionsSection = true;
                    console.log('Entered solutions section at line:', i);
                    continue;
                }
                
                if (inSolutionsSection) {
                    // Parse solutions - look for numbered answers
                    const solutionMatch = line.match(/^(\d+)\.?\s*(.+)$/);
                    if (solutionMatch) {
                        const solutionIndex = parseInt(solutionMatch[1]) - 1;
                        const solutionText = solutionMatch[2].trim();
                        
                        // Create solution object
                        const solution = {
                            id: `s_${solutionIndex}`,
                            questionId: `q_${solutionIndex}`,
                            questionNumber: solutionIndex + 1,
                            answer: solutionText,
                            solution: solutionText,
                            steps: [],
                            hints: []
                        };
                        
                        solutions[solutionIndex] = solution;
                        console.log(`Found solution ${solutionIndex + 1}:`, solutionText);
                    }
                } else {
                    // Parse questions section
                    const questionMatch = line.match(/^(\d+)\.?\s*(.+)$/);
                    if (questionMatch) {
                        // Save previous question
                        if (currentQuestion) {
                            const processedQuestion = get().processQuestion(currentQuestion, currentOptions, questionIndex);
                            if (processedQuestion) {
                                questions.push(processedQuestion);
                                questionIndex++;
                            }
                        }
                        
                        // Start new question
                        const questionText = questionMatch[2].trim();
                        currentQuestion = {
                            questionText: questionText,
                            originalIndex: questionIndex
                        };
                        currentOptions = [];
                        console.log(`Found question ${questionIndex + 1}:`, questionText);
                        
                    } else if (line.match(/^[A-D]\)\s*/)) {
                        // Parse options
                        const optionMatch = line.match(/^([A-D])\)\s*(.+)$/);
                        if (optionMatch && currentQuestion) {
                            const optionText = optionMatch[2].trim();
                            currentOptions.push(optionText);
                            console.log(`Found option ${optionMatch[1]}:`, optionText);
                        }
                    }
                }
            }
            
            // Save the last question
            if (currentQuestion && !inSolutionsSection) {
                const processedQuestion = get().processQuestion(currentQuestion, currentOptions, questionIndex);
                if (processedQuestion) {
                    questions.push(processedQuestion);
                }
            }
            
            // Ensure solutions array matches questions length
            while (solutions.length < questions.length) {
                const index = solutions.length;
                solutions.push({
                    id: `s_${index}`,
                    questionId: `q_${index}`,
                    questionNumber: index + 1,
                    answer: 'Not provided',
                    solution: 'Not provided',
                    steps: [],
                    hints: []
                });
            }
            
            console.log('Final parsed questions:', questions);
            console.log('Final parsed solutions:', solutions);
            
            return { questions, solutions };
        },

        // FIXED: New helper method to process individual questions
        processQuestion: (questionData, options, index) => {
            if (!questionData || !questionData.questionText) {
                return null;
            }

            const questionText = questionData.questionText.toLowerCase();
            let detectedType = 'short_answer';
            let processedOptions = [];

            // Enhanced question type detection
            if (options.length >= 2) {
                // Check if it's true/false based on options
                const normalizedOptions = options.map(opt => opt.toLowerCase().trim());
                const hasTrueFalse = normalizedOptions.some(opt => opt === 'true') && 
                                   normalizedOptions.some(opt => opt === 'false');
                
                if (hasTrueFalse || options.length === 2) {
                    detectedType = 'true_false';
                    processedOptions = ['True', 'False'];
                } else if (options.length > 2) {
                    detectedType = 'mcq';
                    processedOptions = options;
                }
            } else if (questionText.includes('true or false') || 
                      questionText.includes('true/false') ||
                      questionText.includes('t/f')) {
                detectedType = 'true_false';
                processedOptions = ['True', 'False'];
            } else if (questionText.includes('choose') || 
                      questionText.includes('select') ||
                      questionText.match(/\ba\)\s|\bb\)\s|\bc\)\s|\bd\)\s/)) {
                detectedType = 'mcq';
                processedOptions = options.length > 0 ? options : [];
            }

            const processedQuestion = {
                id: `q_${index}`,
                question: questionData.questionText,
                type: detectedType,
                options: processedOptions,
                correctAnswer: '',
                explanation: '',
                difficulty: 'medium',
                points: 1
            };

            console.log(`Processed question ${index + 1}:`, {
                type: detectedType,
                optionsCount: processedOptions.length,
                question: processedQuestion
            });

            return processedQuestion;
        },

        // FIXED: Enhanced question validation
        isValidQuestion: (question) => {
            if (!question || typeof question !== 'object') {
                return false;
            }
            
            const hasQuestionText = question.question && question.question.trim() !== '';
            const hasValidType = typeof question.type === 'string' && 
                               ['mcq', 'true_false', 'short_answer'].includes(question.type);
            
            if (!hasQuestionText || !hasValidType) {
                console.warn('Question validation failed:', {
                    hasQuestionText,
                    hasValidType,
                    type: question.type,
                    question: question.question
                });
                return false;
            }
            
            // Type-specific validation
            switch (question.type) {
                case 'mcq':
                    const isValidMcq = Array.isArray(question.options) && question.options.length >= 2;
                    if (!isValidMcq) {
                        console.warn('MCQ validation failed - insufficient options:', question.options);
                    }
                    return isValidMcq;
                
                case 'true_false':
                    return true; // Can auto-generate options
                
                case 'short_answer':
                    return true; // Doesn't need options
                
                default:
                    console.warn('Unknown question type:', question.type);
                    return false;
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
                
                console.log(`Normalizing question ${index}:`, { raw: q });

                let questionText = q.question || q.text || q.content || q.questionText || '';
                let extractedOptions = q.options || q.choices || q.answers || [];
                
                // Check if options are embedded in the question text
                if ((!extractedOptions || extractedOptions.length === 0) && 
                    typeof questionText === 'string' && questionText.includes('A)')) {
                    const result = get().extractEmbeddedOptions(questionText);
                    questionText = result.cleanedText;
                    extractedOptions = result.options;
                    console.log(`Extracted options from question ${index}:`, extractedOptions);
                }

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
                
                if (!normalized.question.trim()) {
                    console.warn(`Question ${index} has no question text:`, q);
                    return null;
                }

                console.log(`Result for question ${index}:`, { normalized: normalized });
                
                return normalized;
            }).filter(q => q !== null);
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
            
            const optionPattern = /([A-D])\)\s*([^A-D]*?)(?=\s*[A-D]\)|$)/gi;
            const matches = [...text.matchAll(optionPattern)];
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    const optionText = match[2].trim();
                    if (optionText) {
                        options.push(optionText);
                    }
                });
                
                const firstOptionIndex = text.search(/\s*A\)/i);
                if (firstOptionIndex > 0) {
                    cleanedText = text.substring(0, firstOptionIndex).trim();
                    cleanedText = cleanedText.replace(/^\d+\.\s*/, '');
                }
            }
            
            return { cleanedText, options };
        },

        // Helper method to detect question type
        detectQuestionType: (question) => {
            if (question.type || question.questionType) {
                const providedType = (question.type || question.questionType || '').toLowerCase().trim();
                
                if (providedType !== 'text') {
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
                if (questionText.includes('true') && questionText.includes('false')) {
                    return 'true_false';
                }
                return 'mcq';
            }
            
            return 'short_answer';
        },

        // Helper method to normalize options
        normalizeOptions: (options, questionType) => {
            if (options === null || options === undefined) {
                options = [];
            }
            
            if (questionType === 'true_false') {
                if (!Array.isArray(options) || options.length === 0) {
                    return ['True', 'False'];
                }
                return options.map(opt => {
                    const normalized = (typeof opt === 'string' ? opt : opt.text || opt.label || '').trim();
                    if (normalized.toLowerCase() === 'true') return 'True';
                    if (normalized.toLowerCase() === 'false') return 'False';
                    return normalized;
                }).filter(opt => opt !== '');
            }
            
            if (questionType === 'short_answer') {
                return [];
            }
            
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

        // Create new assessment
        createAssessment: async (assessmentData) => {
            set({ isSaving: true, error: null });
            try {
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
                    questions: assessmentData.questions || get().generatedQuestions || [],
                    solutions: assessmentData.solutions || get().generatedSolutions || [],
                    rawContent: assessmentData.rawContent || get().rawContent || '',
                    status: assessmentData.status || 'draft'
                };

                console.log('Sending assessment data:', saveData);

                const response = await axiosInstance.post("/api/assessment/create", saveData);
                
                if (response.status === 201) {
                    await get().fetchAssessments();
                    set({ isSaving: false });
                    return response.data.assessment;
                }
            } catch (error) {
                console.error('Create assessment error:', error);
                
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

        // Debug method
        debugAuthAndData: async () => {
            try {
                console.log('Testing authentication...');
                const response = await axiosInstance.get("/api/auth/user");
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

        // REMOVED: Deprecated methods replaced by improved parseRawContentToQuestions
    })
);

export default useAssessmentStore;