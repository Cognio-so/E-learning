"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Send,
    Bot,
    MessageCircle,
    Settings,
    Brain,
    Sparkle,
    Sparkles,
    User,
    AudioLines,
    File,
    UploadCloud,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PythonApi from '@/lib/PythonApi';
import useAuthStore from '@/store/useAuthStore';
import useTeacherReportsStore from '@/store/useTeacherReportsStore';
import useContentStore from '@/store/useContentStore';
import useAssessmentStore from '@/store/useAssessmentStore';
import useMediaStore from '@/store/useMediaStore';
import useProgressStore from '@/store/useProgressStore';
import useFeedbackStore from '@/store/useFeedbackStore';
import { toast } from 'sonner';
import { MarkdownStyles } from '@/components/chat/Markdown';
import { AIMarkdown } from "@/components/ui/ai-markdown"

const VoiceCoach = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hi there! 👋 I'm your AI Teaching Assistant! I'm here to help you analyze student performance, improve your teaching strategies, and enhance your lesson plans. What would you like to work on today?",
            timestamp: new Date(),
            avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceWebSocket, setVoiceWebSocket] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const messagesEndRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const hasErrorRef = useRef(false);

    // Store hooks - Fix the media store function names (remove non-existent functions)
    const { user } = useAuthStore();
    const { 
        reportData,
        fetchTeacherReports 
    } = useTeacherReportsStore();
    const { 
        savedContent, 
        fetchSavedContent 
    } = useContentStore();
    const { 
        assessments, 
        fetchAssessments 
    } = useAssessmentStore();
    const { 
        comics, 
        images, 
        slides, 
        webSearch,
        // REMOVE: video - this doesn't exist in backend
        initializeComics,
        initializeImages,
        initializeSlides,
        initializeWebSearch
        // REMOVE: initializeVideo - this function doesn't exist
    } = useMediaStore();
    const { 
        progress, 
        fetchUserProgress 
    } = useProgressStore();
    const { 
        userFeedback,
        getUserFeedback
    } = useFeedbackStore();

    // Initialize session and fetch ALL teacher data
    useEffect(() => {
        if (user) {
            setSessionId(`teacher_${user._id}_${Date.now()}`);
            
            // Fetch all teacher data from various stores - REMOVE non-existent functions
            const fetchAllTeacherData = async () => {
                try {
                    await Promise.all([
                        fetchTeacherReports(user._id),
                        fetchSavedContent(),
                        fetchAssessments(),
                        fetchUserProgress(user._id),
                        getUserFeedback(user._id),
                        // Initialize media data - use only existing functions
                        initializeComics(),
                        initializeImages(),
                        initializeSlides(),
                        initializeWebSearch()
                        // REMOVE: initializeVideo() - this function doesn't exist
                    ]);
                    console.log('All teacher data fetched successfully');
                } catch (error) {
                    console.error('Failed to fetch teacher data:', error);
                    toast.error('Failed to load some teaching data');
                }
            };
            
            fetchAllTeacherData();
        }
    }, [user, fetchTeacherReports, fetchSavedContent, fetchAssessments, fetchUserProgress, getUserFeedback, initializeComics, initializeImages, initializeSlides, initializeWebSearch]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || !user || !sessionId) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            timestamp: new Date(),
            avatar: <User className="w-4 h-4 text-purple-500" />
        };

        setMessages(prev => [...prev, userMessage]);
        const currentQuery = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            // Prepare comprehensive teacher data from ALL stores with CORRECT data structure
            const teacherData = {
                teacherName: user.name || user.email,
                teacherId: user._id,
                
                // Student Reports and Performance - Extract better data
                students: reportData?.studentReports || [],
                studentPerformance: reportData?.performance || {},
                studentOverview: reportData?.overview || {},
                topPerformers: reportData?.topPerformers || [],
                subjectPerformance: reportData?.subjects || [],
                behaviorAnalysis: reportData?.behaviorAnalysis || {},
                attendanceData: reportData?.attendance || {},
                
                // Generated Content - Extract better titles and details
                content: savedContent?.map(item => ({
                    id: item._id || item.id,
                    title: item.title || item.topic || 'Untitled Content',
                    type: item.contentType || 'Unknown',
                    subject: item.subject || 'General',
                    grade: item.grade || 'All Grades',
                    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
                    description: item.generatedContent?.substring(0, 100) + '...' || 'No description',
                    objectives: item.objectives || 'No objectives specified'
                })) || [],
                contentCount: savedContent?.length || 0,
                
                // Assessments - Extract better details
                assessments: assessments?.map(assessment => ({
                    id: assessment._id || assessment.id,
                    title: assessment.test_title || assessment.title || 'Untitled Assessment',
                    subject: assessment.subject || 'General',
                    grade: assessment.grade_level || assessment.grade || 'All Grades',
                    type: assessment.assessment_type || assessment.type || 'Mixed',
                    questionCount: assessment.number_of_questions || assessment.questionCount || 0,
                    difficulty: assessment.difficulty_level || assessment.difficulty || 'Medium',
                    createdAt: assessment.createdAt || assessment.created_at || new Date().toISOString()
                })) || [],
                assessmentCount: assessments?.length || 0,
                
                // Media Toolkit - Extract better details (REMOVE video - it doesn't exist)
                mediaToolkit: {
                    comics: comics?.saved?.map(comic => ({
                        id: comic._id || comic.id,
                        title: comic.instruction || comic.title || 'Untitled Comic',
                        topic: comic.topic || comic.subject || 'General Topic',
                        type: comic.comicType || 'Educational',
                        panels: comic.imageUrls?.length || 0,
                        language: comic.language || 'English',
                        createdAt: comic.createdAt || comic.created_at || new Date().toISOString()
                    })) || [],
                    images: images?.saved?.map(image => ({
                        id: image._id || image.id,
                        title: image.topic || image.title || 'Untitled Image',
                        subject: image.subject || 'General',
                        type: image.visualType || 'Image',
                        difficulty: image.visualLevel || 'Standard',
                        language: image.language || 'English',
                        createdAt: image.createdAt || image.created_at || new Date().toISOString()
                    })) || [],
                    slides: slides?.saved?.map(slide => ({
                        id: slide._id || slide.id,
                        title: slide.title || 'Untitled Presentation',
                        topic: slide.topic || 'General Topic',
                        subject: slide.subject || 'General',
                        slideCount: slide.slideCount || 0,
                        verbosity: slide.verbosity || 'Standard',
                        language: slide.language || 'English',
                        createdAt: slide.createdAt || slide.created_at || new Date().toISOString()
                    })) || [],
                    webSearch: webSearch?.saved?.map(search => ({
                        id: search._id || search.id,
                        topic: search.searchTopic || search.topic || 'General Search',
                        subject: search.subject || 'General',
                        contentType: search.contentType || 'Articles',
                        comprehension: search.comprehensionLevel || 'Intermediate',
                        language: search.language || 'English',
                        createdAt: search.createdAt || search.created_at || new Date().toISOString()
                    })) || []
                    // REMOVE: video - this doesn't exist in backend
                },
                mediaCount: {
                    comics: comics?.saved?.length || 0,
                    images: images?.saved?.length || 0,
                    slides: slides?.saved?.length || 0,
                    webSearch: webSearch?.saved?.length || 0
                    // REMOVE: video count - this doesn't exist
                },
                
                // Progress and Analytics - Extract better data
                progress: progress || {},
                feedback: userFeedback?.map(feedback => ({
                    id: feedback._id || feedback.id,
                    resourceId: feedback.resourceId || feedback.resource_id,
                    rating: feedback.rating || 0,
                    comment: feedback.comment || feedback.feedback || 'No comment',
                    createdAt: feedback.createdAt || feedback.created_at || new Date().toISOString()
                })) || [],
                feedbackCount: userFeedback?.length || 0,
                
                // Learning Analytics - Calculate better metrics
                learningAnalytics: {
                    totalStudents: reportData?.studentReports?.length || 0,
                    totalContent: (savedContent?.length || 0) + (assessments?.length || 0),
                    totalMedia: (comics?.saved?.length || 0) + (images?.saved?.length || 0) + (slides?.saved?.length || 0) + (webSearch?.saved?.length || 0),
                    averagePerformance: reportData?.performance?.average || 'N/A',
                    completionRate: progress?.completionRate || progress?.completion_rate || 'N/A',
                    lastActivity: new Date().toISOString(),
                    // Add more detailed analytics
                    contentBreakdown: {
                        lessons: savedContent?.filter(c => c.contentType === 'lesson plan')?.length || 0,
                        worksheets: savedContent?.filter(c => c.contentType === 'worksheet')?.length || 0,
                        presentations: savedContent?.filter(c => c.contentType === 'presentation')?.length || 0,
                        quizzes: savedContent?.filter(c => c.contentType === 'quiz')?.length || 0
                    },
                    assessmentBreakdown: {
                        mcq: assessments?.filter(a => a.assessment_type === 'MCQ')?.length || 0,
                        trueFalse: assessments?.filter(a => a.assessment_type === 'True or False')?.length || 0,
                        shortAnswer: assessments?.filter(a => a.assessment_type === 'Short Answer')?.length || 0,
                        mixed: assessments?.filter(a => a.assessment_type === 'Mixed')?.length || 0
                    },
                    mediaBreakdown: {
                        comics: comics?.saved?.length || 0,
                        images: images?.saved?.length || 0,
                        slides: slides?.saved?.length || 0,
                        webSearch: webSearch?.saved?.length || 0
                    }
                }
            };

            console.log('Sending comprehensive teacher data with enhanced details:', teacherData);

            // Start streaming response using teacher voice chat endpoint
            const response = await PythonApi.startTeacherVoiceChat(teacherData, sessionId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                content: '',
                timestamp: new Date(),
                avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
            };

            let isFirstChunk = true;
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    buffer += chunk;
                    
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonStr = line.slice(6);
                                const data = JSON.parse(jsonStr);
                                
                                if (data.type === 'text_chunk') {
                                    if (isFirstChunk) {
            setMessages(prev => [...prev, aiResponse]);
                                        isFirstChunk = false;
                                    }
                                    
                                    aiResponse.content += data.content;
                                    setMessages(prev => [...prev.slice(0, -1), { ...aiResponse }]);
                                } else if (data.type === 'done') {
                                    break;
                                } else if (data.type === 'error') {
                                    throw new Error(data.message);
                                }
                            } catch (parseError) {
                                console.error('Error parsing SSE data:', parseError);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

        } catch (error) {
            console.error('Error in teacher voice chat:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I'm sorry, I encountered an error while processing your request. Please try again.",
                timestamp: new Date(),
                avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error('Failed to get response from AI Teaching Assistant');
        } finally {
            setIsLoading(false);
        }
    };



    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleUpload = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp3,.mp4,.wav,.ogg,.webm,.zip,.rar,.7z,.tar,.gz,.bz2,.xlsx,.xls,.csv,.ppt,.pptx';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            console.log(file);
        };
        fileInput.click();
    };



   

    // Real-time voice functionality for teachers
    const startVoiceSession = async () => {
        if (!user || !sessionId) {
            toast.error('Please wait for session to initialize');
            return;
        }
        
        if (isVoiceActive) {
            console.log('Voice session already active');
            return;
        }
        
        hasErrorRef.current = false;
        
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            setAudioContext(audioCtx);
            
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
            
            // Prepare comprehensive teacher data for voice session - Use the same enhanced data structure
            const teacherData = {
                teacherName: user.name || user.email,
                teacherId: user._id,
                
                // Student Reports and Performance
                students: reportData?.studentReports || [],
                studentPerformance: reportData?.performance || {},
                studentOverview: reportData?.overview || {},
                topPerformers: reportData?.topPerformers || [],
                subjectPerformance: reportData?.subjects || [],
                behaviorAnalysis: reportData?.behaviorAnalysis || {},
                attendanceData: reportData?.attendance || {},
                
                // Generated Content - Use enhanced data structure
                content: savedContent?.map(item => ({
                    id: item._id || item.id,
                    title: item.title || item.topic || 'Untitled Content',
                    type: item.contentType || 'Unknown',
                    subject: item.subject || 'General',
                    grade: item.grade || 'All Grades',
                    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
                    description: item.generatedContent?.substring(0, 100) + '...' || 'No description',
                    objectives: item.objectives || 'No objectives specified'
                })) || [],
                contentCount: savedContent?.length || 0,
                
                // Assessments - Use enhanced data structure
                assessments: assessments?.map(assessment => ({
                    id: assessment._id || assessment.id,
                    title: assessment.test_title || assessment.title || 'Untitled Assessment',
                    subject: assessment.subject || 'General',
                    grade: assessment.grade_level || assessment.grade || 'All Grades',
                    type: assessment.assessment_type || assessment.type || 'Mixed',
                    questionCount: assessment.number_of_questions || assessment.questionCount || 0,
                    difficulty: assessment.difficulty_level || assessment.difficulty || 'Medium',
                    createdAt: assessment.createdAt || assessment.created_at || new Date().toISOString()
                })) || [],
                assessmentCount: assessments?.length || 0,
                
                // Media Toolkit - Use enhanced data structure (REMOVE video)
                mediaToolkit: {
                    comics: comics?.saved?.map(comic => ({
                        id: comic._id || comic.id,
                        title: comic.instruction || comic.title || 'Untitled Comic',
                        topic: comic.topic || comic.subject || 'General Topic',
                        type: comic.comicType || 'Educational',
                        panels: comic.imageUrls?.length || 0,
                        language: comic.language || 'English',
                        createdAt: comic.createdAt || comic.created_at || new Date().toISOString()
                    })) || [],
                    images: images?.saved?.map(image => ({
                        id: image._id || image.id,
                        title: image.topic || image.title || 'Untitled Image',
                        subject: image.subject || 'General',
                        type: image.visualType || 'Image',
                        difficulty: image.visualLevel || 'Standard',
                        language: image.language || 'English',
                        createdAt: image.createdAt || image.created_at || new Date().toISOString()
                    })) || [],
                    slides: slides?.saved?.map(slide => ({
                        id: slide._id || slide.id,
                        title: slide.title || 'Untitled Presentation',
                        topic: slide.topic || 'General Topic',
                        subject: slide.subject || 'General',
                        slideCount: slide.slideCount || 0,
                        verbosity: slide.verbosity || 'Standard',
                        language: slide.language || 'English',
                        createdAt: slide.createdAt || slide.created_at || new Date().toISOString()
                    })) || [],
                    webSearch: webSearch?.saved?.map(search => ({
                        id: search._id || search.id,
                        topic: search.searchTopic || search.topic || 'General Search',
                        subject: search.subject || 'General',
                        contentType: search.contentType || 'Articles',
                        comprehension: search.comprehensionLevel || 'Intermediate',
                        language: search.language || 'English',
                        createdAt: search.createdAt || search.created_at || new Date().toISOString()
                    })) || []
                },
                mediaCount: {
                    comics: comics?.saved?.length || 0,
                    images: images?.saved?.length || 0,
                    slides: slides?.saved?.length || 0,
                    webSearch: webSearch?.saved?.length || 0
                },
                
                // Progress and Analytics
                progress: progress || {},
                feedback: userFeedback?.map(feedback => ({
                    id: feedback._id || feedback.id,
                    resourceId: feedback.resourceId || feedback.resource_id,
                    rating: feedback.rating || 0,
                    comment: feedback.comment || feedback.feedback || 'No comment',
                    createdAt: feedback.createdAt || feedback.created_at || new Date().toISOString()
                })) || [],
                feedbackCount: userFeedback?.length || 0,
                
                // Learning Analytics
                learningAnalytics: {
                    totalStudents: reportData?.studentReports?.length || 0,
                    totalContent: (savedContent?.length || 0) + (assessments?.length || 0),
                    totalMedia: (comics?.saved?.length || 0) + (images?.saved?.length || 0) + (slides?.saved?.length || 0) + (webSearch?.saved?.length || 0),
                    averagePerformance: reportData?.performance?.average || 'N/A',
                    completionRate: progress?.completionRate || progress?.completion_rate || 'N/A',
                    lastActivity: new Date().toISOString(),
                    contentBreakdown: {
                        lessons: savedContent?.filter(c => c.contentType === 'lesson plan')?.length || 0,
                        worksheets: savedContent?.filter(c => c.contentType === 'worksheet')?.length || 0,
                        presentations: savedContent?.filter(c => c.contentType === 'presentation')?.length || 0,
                        quizzes: savedContent?.filter(c => c.contentType === 'quiz')?.length || 0
                    },
                    assessmentBreakdown: {
                        mcq: assessments?.filter(a => a.assessment_type === 'MCQ')?.length || 0,
                        trueFalse: assessments?.filter(a => a.assessment_type === 'True or False')?.length || 0,
                        shortAnswer: assessments?.filter(a => a.assessment_type === 'Short Answer')?.length || 0,
                        mixed: assessments?.filter(a => a.assessment_type === 'Mixed')?.length || 0
                    },
                    mediaBreakdown: {
                        comics: comics?.saved?.length || 0,
                        images: images?.saved?.length || 0,
                        slides: slides?.saved?.length || 0,
                        webSearch: webSearch?.saved?.length || 0
                    }
                }
            };

            console.log('Starting voice session with enhanced teacher data:', teacherData);
            
            // Connect to teacher voice WebSocket
            const ws = await PythonApi.startTeacherVoiceSession(teacherData);
            
            ws.onopen = async () => {
                console.log('Teacher Voice WebSocket connected');
                setVoiceWebSocket(ws);
                setIsVoiceActive(true);
                
                // Send teacher data to start session
                ws.send(JSON.stringify({
                    type: 'start_session',
                    teacher_data: teacherData
                }));
                
                await startMicrophoneCapture(ws);
                toast.success('Real-time voice session started');
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleVoiceMessage(data);
            };
            
            ws.onerror = (error) => {
                console.error('Teacher Voice WebSocket error:', error);
                if (!hasErrorRef.current) {
                    hasErrorRef.current = true;
                    toast.error('Voice connection failed. Please try again.');
                }
                setVoiceWebSocket(null);
                setIsVoiceActive(false);
                setIsListening(false);
                stopMicrophoneCapture();
                if (audioCtx && audioCtx.state !== 'closed') {
                    audioCtx.close().catch(e => console.error('Error closing AudioContext:', e));
                }
                setAudioContext(null);
            };
            
            ws.onclose = (event) => {
                console.log('Teacher Voice WebSocket closed', event.code, event.reason);
                if (event.code !== 1000 && !hasErrorRef.current) {
                    hasErrorRef.current = true;
                    if (event.code === 1006) {
                        toast.error('Voice connection lost. Check your internet connection.');
                    }
                }
                setVoiceWebSocket(null);
                setIsVoiceActive(false);
                setIsListening(false);
                stopMicrophoneCapture();
                if (audioCtx && audioCtx.state !== 'closed') {
                    audioCtx.close().catch(e => console.error('Error closing AudioContext:', e));
                }
                setAudioContext(null);
            };
            
        } catch (error) {
            console.error('Failed to start teacher voice session:', error);
            if (!hasErrorRef.current) {
                hasErrorRef.current = true;
                toast.error('Failed to start voice session. Please check your microphone permissions.');
            }
            setIsVoiceActive(false);
            setIsListening(false);
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close().catch(e => console.error('Error closing AudioContext:', e));
            }
            setAudioContext(null);
        }
    };

    // ... existing code for microphone capture and voice handling ...

    const toggleVoiceRecording = async () => {
        if (!isVoiceActive) {
            if (!audioContext) {
                const newAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
                setAudioContext(newAudioContext);
                
                if (newAudioContext.state === 'suspended') {
                    await newAudioContext.resume();
                }
            }
            startVoiceSession();
        } else {
            stopVoiceSession();
        }
    };

    const stopVoiceSession = () => {
        if (voiceWebSocket) {
            voiceWebSocket.close();
            setVoiceWebSocket(null);
            setIsVoiceActive(false);
            setIsListening(false);
            stopMicrophoneCapture();
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close().catch(e => console.error('Error closing AudioContext:', e));
            }
            setAudioContext(null);
            toast.info('Voice session stopped.');
        }
    };

    const startMicrophoneCapture = async (ws) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(audioContext.destination);
            setIsListening(true);
            console.log('Microphone capture started');

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'transcription') {
                    setTranscription(data.content);
                }
            };

        } catch (error) {
            console.error('Error starting microphone capture:', error);
            toast.error('Failed to access microphone. Please check permissions.');
            setIsListening(false);
        }
    };

    const stopMicrophoneCapture = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
            setIsListening(false);
            console.log('Microphone capture stopped');
        }
    };

    const handleVoiceMessage = (data) => {
        if (data.type === 'transcription') {
            setTranscription(data.content);
        }
    };

    const MarkdownStyles = {
        h1: ({ node, ...props }) => (
            <h1 className="text-lg font-bold mb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
            <h2 className="text-base font-semibold mb-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
            <h3 className="text-sm font-semibold mb-1" {...props} />
        ),
        p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0" {...props} />
        ),
        ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => <li {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        code: ({ node, inline, ...props }) => (
            inline ?
                <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props} /> :
                <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto" {...props} />
        ),
        pre: ({ node, ...props }) => (
            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto mb-2" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-2" {...props} />
        ),
        // NEW: Enhanced image handling
        img: ({ node, ...props }) => (
            <div className="my-4 flex justify-center">
                <img 
                    {...props} 
                    className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                    style={{ maxHeight: '400px' }}
                    onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        ),
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md"
            >
                <div className="w-full px-2 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                    <Sparkle className="w-5 h-5 text-white" />
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    AI Tutor
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your friendly learning companion
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                Online
                            </Badge>
                            <Button variant="ghost" size="icon">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="w-full px-4 py-6">
                <div className="w-full">
                    {/* Main Chat Area */}
                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg h-[610px] flex flex-col">
                               

                                {/* Messages Area - FIXED HEIGHT AND SCROLLABLE */}
                                <div className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-full w-full">
                                        <div className="p-4 space-y-2 min-h-full">
                                            <AnimatePresence>
                                                {messages.map((message) => (
                                                    <motion.div
                                                        key={message.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'}`}>
                                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                                <AvatarFallback className="text-lg">
                                                                    {message.avatar}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className={`rounded-2xl px-3 py-2 ${message.type === 'user'
                                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white dark:bg-gradient-to-r dark:from-purple-900/30 dark:to-pink-900/30 dark:text-white'
                                                                }`}>
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                                                                        {message.content}
                                                                    </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {isLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                                            <Sparkle className="w-4 h-4 text-yellow-500" />
                                                        </Avatar>
                                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                                                            <div className="flex space-x-1">
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                                />
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                                />
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                        <div ref={messagesEndRef} />
                                    </ScrollArea>
                                </div>

                                {/* Input Area - FIXED AT BOTTOM */}
                                <div className="p-2 flex-shrink-0">
                                    <div className="flex items-end space-x-3 w-full border-gray-200 dark:border-gray-700  ">
                                        <div className="flex-1">
                                            <Input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Ask me about student performance, teaching strategies, or lesson planning..."
                                                className="border bg-gray-50 dark:bg-gray-700 border-purple-500 dark:border-purple-500 rounded-2xl px-6 py-6 w-full text-black dark:text-white"
                                                disabled={isLoading}
                                            />
                                        </div>
                                       <div className="flex items-center space-x-2">
                                        <Button 
                                        onClick={handleUpload}
                                        disabled={isLoading}
                                        size="icon" 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl px-6 py-3 text-white dark:text-white"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                        onClick={toggleVoiceRecording}
                                        disabled={isLoading}
                                        size="icon" 
                                        className={`rounded-2xl px-6 py-3 ${
                                            isVoiceActive 
                                                ? 'bg-red-500 hover:bg-red-600' 
                                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                        } text-white dark:text-white`}
                                        title={isVoiceActive ? 'Stop voice session' : 'Start real-time voice session'}
                                    >
                                        {isVoiceActive ? (
                                            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                                        ) : (
                                            <AudioLines className="w-4 h-4" />
                                        )}
                                        </Button>
                                       <Button
                                            onClick={handleSendMessage}
                                            disabled={!inputValue.trim() || isLoading}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl px-6 py-3 text-white dark:text-white"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                       </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Voice Status Bar */}
            {isVoiceActive && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Voice {isListening ? 'Listening' : 'Active'}
                            </span>
                        </div>
                        <Button
                            onClick={stopVoiceSession}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                        >
                            Stop Voice
                        </Button>
                    </div>
                    {transcription && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>You said:</strong> {transcription}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VoiceCoach;