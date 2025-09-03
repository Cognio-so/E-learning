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
import useStudentStore from '@/store/useStudentStore';
import useProgressStore from '@/store/useProgressStore';
import useChatStore from '@/store/useChatStore';
import { toast } from 'sonner';

const AiTutor = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hi there! 👋 I'm your AI Tutor Buddy! I'm here to help you learn and understand your homework. What would you like to work on today?",
            timestamp: new Date(),
            avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]); // NEW: Track uploaded files
    const [isUploading, setIsUploading] = useState(false); // NEW: Upload loading state
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceWebSocket, setVoiceWebSocket] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const audioPlayerRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const hasErrorRef = useRef(false);  // Prevent duplicate error handling
    const nextStartTimeRef = useRef(0);  // For audio scheduling
    const audioBufferRef = useRef([]);  // Buffer for audio chunks
    const isPlayingRef = useRef(false);  // Track if audio is playing

    // Store hooks
    const { user } = useAuthStore();
    const { studentLessons, studentResources, fetchStudentData } = useStudentStore();
    const { progress, userProgress, learningStats, achievements, fetchUserProgress, fetchLearningStats, fetchAchievements } = useProgressStore();
    const { 
        saveChatSession, 
        fetchChatSessions, 
        chatSessions, 
        isLoading: chatLoading, 
        fetchChatSession, 
        currentSession,
        addMessageToCurrentSession,
        updateCurrentSessionMessages 
    } = useChatStore();

    // FIXED: Improved autoscrolling with proper timing
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    // FIXED: Scroll to bottom when messages change or loading state changes
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Initialize session and fetch student data
    useEffect(() => {
        if (user) {
            // Generate unique session ID
            setSessionId(`student_${user._id}_${Date.now()}`);
            
            // Fetch all student data
            const fetchData = async () => {
                try {
                    await Promise.all([
                        fetchStudentData(user._id),
                        fetchUserProgress(user._id),
                        fetchLearningStats(user._id),
                        fetchAchievements(user._id)
                    ]);
                } catch (error) {
                    console.error('Failed to fetch student data:', error);
                    toast.error('Failed to load your learning data');
                }
            };
            
            fetchData();
        }
    }, [user, fetchStudentData, fetchUserProgress, fetchLearningStats, fetchAchievements]);

    // Load chat sessions when user logs in
    useEffect(() => {
        if (user) {
            fetchChatSessions(user._id).catch(console.error);
        }
    }, [user, fetchChatSessions]);
    
    // Create refs for cleanup
    const voiceWebSocketRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    
    // Update refs when state changes
    useEffect(() => {
        voiceWebSocketRef.current = voiceWebSocket;
    }, [voiceWebSocket]);
    
    useEffect(() => {
        audioContextRef.current = audioContext;
    }, [audioContext]);
    
    useEffect(() => {
        mediaRecorderRef.current = mediaRecorder;
    }, [mediaRecorder]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clean up voice session on unmount
            if (voiceWebSocketRef.current && voiceWebSocketRef.current.readyState === WebSocket.OPEN) {
                try {
                    voiceWebSocketRef.current.send(JSON.stringify({ type: 'stop_session' }));
                    voiceWebSocketRef.current.close();
                } catch (error) {
                    console.error('Error cleaning up WebSocket:', error);
                }
            }
            
            // Clean up media stream
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            
            // Clean up audio context
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => console.error('Error closing AudioContext:', e));
            }
            
            // Clean up media recorder
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

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
            // Prepare comprehensive student data with proper formatting
            const studentData = {
                id: user._id,
                email: user.email,
                name: user.name || user.email,
                grade: user.grade || '8',
                progress: progress,
                // Fix: Extract achievements array from the object structure
                achievements: achievements && achievements.achievements ? achievements.achievements : [],
                learningStats: learningStats,
                assessments: studentResources.filter(r => r.resourceType === 'assessment'),
                lessons: studentLessons,
                resources: studentResources,
                analytics: userProgress
            };

            // Start streaming response
            const response = await PythonApi.startChatbotStream(
                sessionId,
                currentQuery,
                studentData,
                uploadedFiles, // Pass uploaded files for context
                messages.slice(1).map(msg => ({
                    role: msg.type === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                true // Always enable web search
            );

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
                avatar: <Sparkle className="w-4 h-4 text-yellow-500" />,
                isImageResponse: false // NEW: Track if this is an image response
            };

            // FIXED: Don't add AI response immediately - let loading indicator show first
            let isFirstChunk = true;
            let buffer = ''; // Buffer for incomplete JSON

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    buffer += chunk;
                    
                    // Split by lines and process each complete line
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonStr = line.slice(6);
                                
                                // Check if this is an image response
                                if (jsonStr.includes('__IMAGE_RESPONSE__')) {
                                    // Handle image response differently
                                    aiResponse.isImageResponse = true;
                                    
                                    // Extract the image content after the marker
                                    const imageContent = jsonStr.replace('__IMAGE_RESPONSE__', '');
                                    
                                    // Try to parse the JSON properly
                                    try {
                                        const data = JSON.parse(imageContent);
                                        if (data.content) {
                                            aiResponse.content = data.content;
                                        } else {
                                            aiResponse.content = imageContent;
                                        }
                                    } catch (parseError) {
                                        // If JSON parsing fails, use the raw content
                                        aiResponse.content = imageContent;
                                    }
                                    
                                    // Add the response immediately
                                    if (isFirstChunk) {
                                        setMessages(prev => [...prev, aiResponse]);
                                        isFirstChunk = false;
                                    } else {
                                        setMessages(prev => [...prev.slice(0, -1), { ...aiResponse }]);
                                    }
                                    continue;
                                }
                                
                                // Handle regular text chunks
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
                                console.error('Problematic line:', line);
                                // Continue processing other lines
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

        } catch (error) {
            console.error('Error in chatbot stream:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I'm sorry, I encountered an error while processing your request. Please try again.",
                timestamp: new Date(),
                avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error('Failed to get response from AI Tutor');
        } finally {
            setIsLoading(false);
        }

        // After successful response, save the chat session
        const sessionData = {
            sessionId,
            messages: messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content,
                isImageResponse: msg.isImageResponse || false,
                timestamp: msg.timestamp
            })),
            uploadedFiles: uploadedFiles.map(file => ({
                filename: file.name,
                originalName: file.name
            })),
            studentData: {
                grade: user.grade,
                subjects: user.subjects || [],
                progress: progress,
                achievements: achievements && achievements.achievements ? achievements.achievements : [],
                learningStats: learningStats
            },
            title: `Chat with ${user.name} - ${new Date().toLocaleDateString()}`
        };

        // Save chat session in background
        saveChatSession(sessionData).catch(console.error);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // NEW: Enhanced file upload handler
    const handleUpload = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true; // Allow multiple files
        fileInput.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp3,.mp4,.wav,.ogg,.webm,.zip,.rar,.7z,.tar,.gz,.bz2,.xlsx,.xls,.csv,.ppt,.pptx';
        fileInput.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            setIsUploading(true);
            try {
                // Upload files to backend
                const uploadResponse = await PythonApi.uploadDocumentsForChatbot(sessionId, files);
                
                if (uploadResponse.success) {
                    // Add files to local state
                    setUploadedFiles(prev => [...prev, ...files]);
                    
                    // Add success message to chat
                    const uploadMessage = {
                        id: Date.now(),
                        type: 'ai',
                        content: `✅ Successfully uploaded ${files.length} document(s)! I can now help you with questions about these files.`,
                        timestamp: new Date(),
                        avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
                    };
                    setMessages(prev => [...prev, uploadMessage]);
                    
                    toast.success(`Uploaded ${files.length} document(s) successfully!`);
                } else {
                    throw new Error(uploadResponse.message || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Failed to upload documents. Please try again.');
                
                // Add error message to chat
                const errorMessage = {
                    id: Date.now(),
                    type: 'ai',
                    content: "❌ Failed to upload your documents. Please try again or contact support if the problem persists.",
                    timestamp: new Date(),
                    avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
                };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsUploading(false);
            }
        };
        fileInput.click();
    };

    // NEW: Clear uploaded files
    const handleClearFiles = () => {
        setUploadedFiles([]);
        toast.info('Cleared uploaded documents');
        
        // Add info message to chat
        const clearMessage = {
            id: Date.now(),
            type: 'ai',
            content: "🗑️ Cleared all uploaded documents. You can upload new ones anytime!",
            timestamp: new Date(),
            avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
        };
        setMessages(prev => [...prev, clearMessage]);
    };

    // NEW: Real-time voice functionality with proper audio capture
    const startVoiceSession = async () => {
        if (!user || !sessionId) {
            toast.error('Please wait for session to initialize');
            return;
        }
        
        // Check if already active
        if (isVoiceActive) {
            console.log('Voice session already active');
            return;
        }
        
        // Reset error flag and audio scheduling for new session
        hasErrorRef.current = false;
        nextStartTimeRef.current = 0;
        
        try {
            // Initialize audio context
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            setAudioContext(audioCtx);
            
            // Resume audio context if suspended (for Chrome autoplay policy)
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
                console.log('Audio context resumed');
            }
            
            // Connect to voice WebSocket
            const ws = await PythonApi.startVoiceSession({
                id: user._id,
                email: user.email,
                name: user.name || user.email,
                grade: user.grade || '8',
                progress: progress,
                achievements: achievements && achievements.achievements ? achievements.achievements : [],
                learningStats: learningStats,
                assessments: studentResources.filter(r => r.resourceType === 'assessment'),
                lessons: studentLessons,
                resources: studentResources,
                analytics: userProgress
            });
            
            ws.onopen = async () => {
                console.log('Voice WebSocket connected');
                setVoiceWebSocket(ws);
                setIsVoiceActive(true);
                
                // Prepare comprehensive student context for personalized tutoring
                const studentContext = {
                    id: user._id,
                    email: user.email,
                    name: user.name || user.email,
                    grade: user.grade || '8',
                    
                    // Learning Progress
                    progress: progress,
                    learningStats: learningStats,
                    userProgress: userProgress,
                    
                    // Achievements and milestones
                    achievements: achievements && achievements.achievements ? achievements.achievements : [],
                    
                    // Academic Resources
                    subjects: user.subjects || ['General Studies', 'Mathematics', 'Science'],
                    lessons: studentLessons || [],
                    resources: studentResources || [],
                    assessments: studentResources ? studentResources.filter(r => r.resourceType === 'assessment') : [],
                    
                    // Current Learning Status
                    recentLessons: studentLessons ? studentLessons.slice(0, 5) : [],
                    incompleteAssessments: studentResources ? studentResources.filter(r => 
                        r.resourceType === 'assessment' && r.status !== 'completed'
                    ) : [],
                    
                    // Study patterns and preferences
                    studyPreferences: {
                        learningStyle: user.learningStyle || 'visual',
                        difficultyPreference: user.difficultyPreference || 'medium',
                        topicInterests: user.topicInterests || []
                    },
                    
                    // Current session context
                    pending_tasks: [
                        {"topic": "Help with homework and assignments", "status": "Active"},
                        {"topic": "Concept understanding and clarification", "status": "Available"},
                        {"topic": "Practice problems and exercises", "status": "Available"}
                    ],
                    
                    // Performance insights
                    performanceInsights: {
                        strongSubjects: learningStats?.strongSubjects || [],
                        needsImprovement: learningStats?.weakSubjects || [],
                        averageScore: learningStats?.averageScore || 'N/A',
                        studyTime: learningStats?.totalStudyTime || 'N/A',
                        lastActivity: learningStats?.lastActivity || new Date().toISOString()
                    }
                };

                // Start the real-time voice session with enhanced context
                ws.send(JSON.stringify({
                    type: 'start_session',
                    student_data: studentContext
                }));
                
                console.log('Sending enhanced student context:', studentContext);
                
                // Start capturing microphone audio
                await startMicrophoneCapture(ws);
                
                toast.success('Real-time voice session started');
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleVoiceMessage(data);
            };
            
            ws.onerror = (error) => {
                console.error('Voice WebSocket error:', error);
                
                // Only show error if we haven't already
                if (!hasErrorRef.current) {
                    hasErrorRef.current = true;
                    toast.error('Voice connection failed. Please try again.');
                }
                
                // Clean up without trying to send to closed WebSocket
                setVoiceWebSocket(null);
                setIsVoiceActive(false);
                setIsListening(false);
                stopMicrophoneCapture();
                
                // Clean up audio context
                if (audioCtx && audioCtx.state !== 'closed') {
                    audioCtx.close().catch(e => console.error('Error closing AudioContext:', e));
                }
                setAudioContext(null);
            };
            
            ws.onclose = (event) => {
                console.log('Voice WebSocket closed', event.code, event.reason);
                
                // Only show error if it was unexpected (not a normal close)
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
                
                // Clean up audio context
                if (audioCtx && audioCtx.state !== 'closed') {
                    audioCtx.close().catch(e => console.error('Error closing AudioContext:', e));
                }
                setAudioContext(null);
            };
            
        } catch (error) {
            console.error('Failed to start voice session:', error);
            
            // Only show error if we haven't already shown one
            if (!hasErrorRef.current) {
                hasErrorRef.current = true;
                toast.error('Failed to start voice session. Please check your microphone permissions.');
            }
            
            // Clean up
            setIsVoiceActive(false);
            setIsListening(false);
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close().catch(e => console.error('Error closing AudioContext:', e));
            }
            setAudioContext(null);
        }
    };

    // Start microphone capture and streaming (using modern approach)
    const startMicrophoneCapture = async (ws) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 24000,
                    channelCount: 1
                } 
            });
            
            mediaStreamRef.current = stream;
            
            // Use AudioContext for PCM processing
            const audioCtx = audioContext || new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const source = audioCtx.createMediaStreamSource(stream);
            
            // Create an analyser node as a modern alternative
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            
            // Create a buffer to capture audio
            const bufferLength = analyser.fftSize;
            const dataArray = new Float32Array(bufferLength);
            
            source.connect(analyser);
            
            // Process audio in chunks using setInterval instead of deprecated ScriptProcessor
            const processAudio = setInterval(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    clearInterval(processAudio);
                    return;
                }
                
                // Get time domain data
                analyser.getFloatTimeDomainData(dataArray);
                
                // Convert Float32Array to Int16Array (PCM16)
                const pcm16 = new Int16Array(dataArray.length);
                for (let i = 0; i < dataArray.length; i++) {
                    const s = Math.max(-1, Math.min(1, dataArray[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                
                // Convert to base64
                const uint8Array = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let i = 0; i < uint8Array.length; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                const base64Audio = btoa(binary);
                
                // Send to backend
                ws.send(JSON.stringify({
                    type: 'audio_chunk',
                    audio: base64Audio
                }));
            }, 100); // Send every 100ms
            
            // Store for cleanup
            mediaStreamRef.current.analyser = analyser;
            mediaStreamRef.current.source = source;
            mediaStreamRef.current.processInterval = processAudio;
            
            setIsListening(true);
            
        } catch (error) {
            console.error('Failed to start microphone:', error);
            
            // Only show error if we haven't already
            if (!hasErrorRef.current) {
                hasErrorRef.current = true;
                
                if (error.name === 'NotAllowedError') {
                    toast.error('Microphone access denied. Please allow microphone permissions.');
                } else if (error.name === 'NotFoundError') {
                    toast.error('No microphone found. Please connect a microphone.');
                } else {
                    toast.error('Failed to access microphone. Please check your settings.');
                }
            }
            
            // Stop the voice session since we can't capture audio
            stopVoiceSession();
        }
    };
    
    // Stop microphone capture
    const stopMicrophoneCapture = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setMediaRecorder(null);
        }
        
        if (mediaStreamRef.current) {
            // Clear interval if it exists
            if (mediaStreamRef.current.processInterval) {
                clearInterval(mediaStreamRef.current.processInterval);
                mediaStreamRef.current.processInterval = null;
            }
            
            // Disconnect audio nodes if they exist
            if (mediaStreamRef.current.analyser) {
                mediaStreamRef.current.analyser.disconnect();
                mediaStreamRef.current.analyser = null;
            }
            
            if (mediaStreamRef.current.source) {
                mediaStreamRef.current.source.disconnect();
                mediaStreamRef.current.source = null;
            }
            
            // Stop all tracks
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        setIsListening(false);
    };

    const stopVoiceSession = () => {
        // Check WebSocket state before sending
        if (voiceWebSocket && voiceWebSocket.readyState === WebSocket.OPEN) {
            try {
                voiceWebSocket.send(JSON.stringify({ type: 'stop_session' }));
                voiceWebSocket.close();
            } catch (error) {
                console.error('Error closing WebSocket:', error);
            }
        }
        setVoiceWebSocket(null);
        setIsVoiceActive(false);
        setIsListening(false);
        
        // Clean up audio streaming
        isStreamingRef.current = false;
        audioBufferRef.current = [];
        nextStartTimeRef.current = 0;
        
        // Stop all audio sources
        audioSourcesRef.current.forEach(source => {
            try {
                source.stop();
                source.disconnect();
            } catch (e) {
                // Source may already be stopped
            }
        });
        audioSourcesRef.current = [];
        
        // Clean up microphone
        stopMicrophoneCapture();
        
        // Don't close audio context - just suspend it for reuse
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.suspend().then(() => {
                console.log('Audio context suspended');
            }).catch(error => {
                console.error('Error suspending AudioContext:', error);
            });
        }
    };

    // Advanced audio streaming system with enhanced buffering and quality monitoring
    const audioSourcesRef = useRef([]);
    const isStreamingRef = useRef(false);
    const streamStartTimeRef = useRef(0);
    const audioQualityMetrics = useRef({
        chunksProcessed: 0,
        averageLatency: 0,
        dropouts: 0,
        bufferUnderruns: 0
    });

    const playAudioFromBase64 = async (base64Audio) => {
        // Ensure we have an audio context - reuse existing one
        let currentAudioContext = audioContext;
        if (!currentAudioContext || currentAudioContext.state === 'closed') {
            console.log('Creating audio context for playback');
            currentAudioContext = new (window.AudioContext || window.webkitAudioContext)({ 
                sampleRate: 24000,
                latencyHint: 'interactive' // Optimize for low latency
            });
            setAudioContext(currentAudioContext);
            
            // Reset timing when creating new context
            nextStartTimeRef.current = currentAudioContext.currentTime;
        }
        
        // Resume if suspended
        if (currentAudioContext.state === 'suspended') {
            await currentAudioContext.resume();
        }
        
        // Validate audio context state
        if (currentAudioContext.state === 'closed') {
            console.error('AudioContext is closed, cannot play audio');
            return;
        }
        
        try {
            // Validate base64 input
            if (!base64Audio || typeof base64Audio !== 'string') {
                console.warn('Invalid base64 audio data received');
                return;
            }
            
            // Convert base64 to ArrayBuffer with error handling
            let binaryString, bytes;
            try {
                binaryString = atob(base64Audio);
                bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
            } catch (decodeError) {
                console.error('Failed to decode base64 audio:', decodeError);
                return;
            }
            
            // Validate minimum audio chunk size (prevent micro-chunks)
            if (bytes.length < 960) { // 20ms at 24kHz, 16-bit = 960 bytes
                console.log('Audio chunk too small, skipping:', bytes.length);
                return;
            }
            
            // Create Int16Array from bytes (little-endian format)
            const pcm16 = new Int16Array(bytes.buffer);
            
            // Apply audio enhancement and normalization
            const float32 = new Float32Array(pcm16.length);
            let maxAmplitude = 0;
            
            // Convert PCM16 to Float32 and find max amplitude
            for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
                maxAmplitude = Math.max(maxAmplitude, Math.abs(float32[i]));
            }
            
            // Apply soft limiting and normalization if needed
            if (maxAmplitude > 0.95) {
                const compressionRatio = 0.9 / maxAmplitude;
                for (let i = 0; i < float32.length; i++) {
                    float32[i] *= compressionRatio;
                }
                console.log('Applied audio compression, ratio:', compressionRatio);
            }
            
            // Create audio buffer with validation
            if (float32.length === 0) {
                console.warn('Empty audio data, skipping');
                return;
            }
            
            const audioBuffer = currentAudioContext.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);
            
            // Quality metrics tracking
            audioQualityMetrics.current.chunksProcessed++;
            const receiveTime = currentAudioContext.currentTime;
            
            // Add to audio buffer queue with enhanced metadata
            audioBufferRef.current.push({
                buffer: audioBuffer,
                timestamp: receiveTime,
                duration: audioBuffer.duration,
                chunkId: audioQualityMetrics.current.chunksProcessed,
                size: bytes.length
            });
            
            // Better buffer management - trim when buffer gets too large
            if (audioBufferRef.current.length > 50) {
                const removedChunks = audioBufferRef.current.length - 25;
                audioBufferRef.current = audioBufferRef.current.slice(-25);
                audioQualityMetrics.current.dropouts += removedChunks;
                console.log(`Audio buffer trimmed: removed ${removedChunks} chunks, buffer size: ${audioBufferRef.current.length}`);
            }
            
            // Start processing queue if not already streaming
            if (!isStreamingRef.current) {
                processAudioStream(currentAudioContext);
            }
            
        } catch (error) {
            console.error('Failed to prepare audio:', error);
            audioQualityMetrics.current.dropouts++;
        }
    };

    // Enhanced audio stream processing with better timing
    const processAudioStream = (currentAudioContext) => {
        if (audioBufferRef.current.length === 0) {
            isStreamingRef.current = false;
            // Log quality metrics when stream ends
            if (audioQualityMetrics.current.chunksProcessed > 0) {
                console.log('Audio stream ended. Quality metrics:', audioQualityMetrics.current);
            }
            return;
        }
        
        isStreamingRef.current = true;
        
        // Get the next audio chunk
        const audioChunk = audioBufferRef.current.shift();
        
        // Validate audio context is still usable
        if (currentAudioContext.state === 'closed') {
            console.error('AudioContext closed during playback');
            isStreamingRef.current = false;
            return;
        }
        
        // Create audio source with error handling
        let source;
        try {
            source = currentAudioContext.createBufferSource();
            source.buffer = audioChunk.buffer;
            
            // Create gain node for volume control and fade effects
            const gainNode = currentAudioContext.createGain();
            source.connect(gainNode);
            gainNode.connect(currentAudioContext.destination);
            
            // Apply subtle fade-in to prevent clicks
            const now = currentAudioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + 0.003); // 3ms fade-in
            
        } catch (error) {
            console.error('Failed to create audio source:', error);
            audioQualityMetrics.current.dropouts++;
            // Continue with next chunk
            setTimeout(() => processAudioStream(currentAudioContext), 10);
            return;
        }
        
        // Better timing calculation
        const now = currentAudioContext.currentTime;
        
        // Reset timing if drift is too large or if this is the first chunk
        if (nextStartTimeRef.current === 0 || nextStartTimeRef.current > now + 0.5) {
            nextStartTimeRef.current = now + 0.01;
        }
        
        // Ensure smooth playback with minimal gaps
        const scheduledStartTime = Math.max(now + 0.005, nextStartTimeRef.current);
        
        // Start playing with error handling
        try {
            source.start(scheduledStartTime);
            
            // Update timing for next chunk - no gaps needed for continuous audio
            nextStartTimeRef.current = scheduledStartTime + audioChunk.duration;
            
        } catch (startError) {
            console.error('Failed to start audio source:', startError);
            audioQualityMetrics.current.dropouts++;
            // Continue with next chunk
            setTimeout(() => processAudioStream(currentAudioContext), 10);
            return;
        }
        
        // Enhanced source management
        audioSourcesRef.current.push({
            source: source,
            startTime: scheduledStartTime,
            endTime: scheduledStartTime + audioChunk.duration,
            chunkId: audioChunk.chunkId
        });
        
        // Cleanup old sources more aggressively
        const currentTime = currentAudioContext.currentTime;
        audioSourcesRef.current = audioSourcesRef.current.filter((sourceInfo, index) => {
            if (sourceInfo.endTime < currentTime - 0.5) {
                // Source has finished playing and is old enough to clean up
                try {
                    sourceInfo.source.disconnect();
                } catch (e) {
                    // Already disconnected
                }
                return false;
            }
            return true;
        });
        
        // Keep maximum of 10 active sources (reduced from 15)
        if (audioSourcesRef.current.length > 10) {
            const excess = audioSourcesRef.current.splice(0, audioSourcesRef.current.length - 10);
            excess.forEach(sourceInfo => {
                try {
                    sourceInfo.source.stop();
                    sourceInfo.source.disconnect();
                } catch (e) {
                    // Already stopped/disconnected
                }
            });
        }
        
        // Schedule next chunk processing immediately for continuous playback
        source.onended = () => {
            // Process next chunk immediately for seamless audio
            processAudioStream(currentAudioContext);
        };
        
        // Enhanced error handling
        source.onerror = (error) => {
            console.error('Audio source error:', error);
            audioQualityMetrics.current.dropouts++;
            // Continue with next chunk
            setTimeout(() => processAudioStream(currentAudioContext), 10);
        };
        
        // Detailed logging for debugging (only log every 20th chunk to reduce spam)
        if (audioChunk.chunkId % 20 === 0) {
            console.log('Audio stream status:', {
                chunkId: audioChunk.chunkId,
                duration: audioChunk.duration,
                startTime: scheduledStartTime,
                nextStartTime: nextStartTimeRef.current,
                queueLength: audioBufferRef.current.length,
                contextTime: currentAudioContext.currentTime,
                timingGap: scheduledStartTime - currentAudioContext.currentTime,
                activeSources: audioSourcesRef.current.length,
                qualityMetrics: audioQualityMetrics.current
            });
        }
    };

    const handleVoiceMessage = async (data) => {
        switch (data.type) {
            case 'session_started':
                toast.success('Ready for real-time conversation');
                setIsListening(true);
                // Reset all audio streaming state for new session
                nextStartTimeRef.current = 0;
                audioBufferRef.current = [];
                isPlayingRef.current = false;
                isStreamingRef.current = false;
                audioSourcesRef.current = [];
                streamStartTimeRef.current = 0;
                // Reset quality metrics for new session
                audioQualityMetrics.current = {
                    chunksProcessed: 0,
                    averageLatency: 0,
                    dropouts: 0,
                    bufferUnderruns: 0
                };
                console.log('Audio streaming state and quality metrics reset for new session');
                break;
            case 'session.created':
                console.log('OpenAI session created');
                break;
            case 'response.audio.delta':
                // Play audio response from OpenAI with enhanced processing
                const audioData = data.audio || data.delta;
                if (audioData) {
                    // Use non-blocking audio processing to prevent WebSocket delays
                    setTimeout(() => playAudioFromBase64(audioData), 0);
                } else {
                    console.warn('No audio data in response.audio.delta event');
                    audioQualityMetrics.current.dropouts++;
                }
                break;
            case 'input_audio_buffer.speech_started':
                console.log('Speech detected');
                break;
            case 'input_audio_buffer.speech_stopped':
                console.log('Speech ended');
                break;
            case 'conversation.item.input_audio_transcription.completed':
                if (data.transcript) {
                    setTranscription(data.transcript);
                }
                break;
            case 'conversation.item.create':
                // Handle tool calls if needed
                if (data.item?.tool_calls) {
                    for (const toolCall of data.item.tool_calls) {
                        if (toolCall.function?.name === 'web_search') {
                            try {
                                const args = JSON.parse(toolCall.function.arguments);
                                const searchResults = await performWebSearch(args.query);
                                
                                // Check WebSocket state before sending
                                if (voiceWebSocket && voiceWebSocket.readyState === WebSocket.OPEN) {
                                    voiceWebSocket.send(JSON.stringify({
                                        type: 'conversation.item.create',
                                        item: {
                                            type: 'function_call_output',
                                            call_id: toolCall.id,
                                            output: searchResults
                                        }
                                    }));
                                }
                            } catch (error) {
                                console.error('Web search failed:', error);
                            }
                        }
                    }
                }
                break;
            case 'response.done':
            case 'response.completed':
                console.log('OpenAI response completed');
                break;
            case 'function_call_request':
                // Handle function call request from backend
                if (data.function?.name === 'web_search') {
                    try {
                        const args = JSON.parse(data.function.arguments || '{}');
                        const searchResults = await performWebSearch(args.query);
                        
                        // Check WebSocket state before sending
                        if (voiceWebSocket && voiceWebSocket.readyState === WebSocket.OPEN) {
                            voiceWebSocket.send(JSON.stringify({
                                type: 'function_call_output',
                                call_id: data.function.call_id || data.function.id,
                                output: searchResults
                            }));
                        }
                    } catch (error) {
                        console.error('Function call failed:', error);
                    }
                }
                break;
            case 'error':
                console.error('Voice session error:', data);
                
                // Log the specific error details
                if (data.error) {
                    console.error('OpenAI Error Details:', {
                        type: data.error.type,
                        code: data.error.code,
                        message: data.error.message,
                        param: data.error.param,
                        event_id: data.event_id
                    });
                }
                
                // Only show error if we haven't already
                if (!hasErrorRef.current) {
                    hasErrorRef.current = true;
                    
                    // Extract error message from OpenAI error structure
                    let errorMessage = 'Voice session encountered an error';
                    if (data.error?.message) {
                        errorMessage = data.error.message;
                    } else if (data.message) {
                        errorMessage = data.message;
                    }
                    
                    toast.error(errorMessage);
                }
                
                // Don't stop session for recoverable errors
                if (data.error?.type === 'invalid_request_error' || data.error?.code === 'invalid_value') {
                    console.warn('Recoverable error, continuing session...');
                } else {
                    stopVoiceSession();
                }
                break;
        }
    };

    const toggleVoiceRecording = async () => {
        if (!isVoiceActive) {
            // Create audio context immediately on user interaction (for Chrome autoplay policy)
            if (!audioContext) {
                const newAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
                setAudioContext(newAudioContext);
                
                // Resume if needed
                if (newAudioContext.state === 'suspended') {
                    await newAudioContext.resume();
                    console.log('Audio context resumed after user interaction');
                }
            }
            
            startVoiceSession();
        } else {
            stopVoiceSession();
        }
    };

    const performWebSearch = async (query) => {
        try {
            const response = await PythonApi.runWebSearch({
                topic: query,
                gradeLevel: user.grade || '8',
                subject: 'General',
                contentType: 'articles',
                language: 'English',
                comprehension: 'intermediate',
                maxResults: 3
            });
            return response.content;
        } catch (error) {
            console.error('Web search failed:', error);
            return 'Web search failed';
        }
    };

    // Markdown styles for the chat messages
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

    // Enhanced image rendering component
    const ImageMessage = ({ content }) => {
        // Extract image URL from markdown
        const imageMatch = content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
        
        if (imageMatch) {
            const imageUrl = imageMatch[1];
            return (
                <div className="my-4 flex justify-center">
                    <img 
                        src={imageUrl}
                        alt="Generated image"
                        className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                        style={{ maxHeight: '400px' }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                            console.log('Image loaded successfully');
                        }}
                    />
                </div>
            );
        }
        
        // Fallback to markdown rendering
        return (
            <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    // Update the renderMessageContent function
    const renderMessageContent = (message) => {
        if (message.isImageResponse) {
            return <ImageMessage content={message.content} />;
        } else {
            return (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                        {message.content}
                    </ReactMarkdown>
                </div>
            );
        }
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
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    AI Tutor
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your personalized learning companion
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* NEW: Show uploaded files count */}
                            {uploadedFiles.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    📎 {uploadedFiles.length} file(s)
                                </Badge>
                            )}
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
                                    <ScrollArea ref={scrollAreaRef} className="h-full w-full">
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
                                                                {renderMessageContent(message)}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {/* FIXED: Single loading indicator with proper styling */}
                                            {isLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                                            <AvatarFallback className="text-lg">
                                                                <Sparkle className="w-4 h-4 text-yellow-500" />
                                                            </AvatarFallback>
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
                                        {/* FIXED: Proper scroll target */}
                                        <div ref={messagesEndRef} className="h-4" />
                                    </ScrollArea>
                                </div>

                                {/* Input Area - FIXED AT BOTTOM */}
                                <div className="p-2 flex-shrink-0">
                                    <div className="flex items-end space-x-3 w-full border-gray-200 dark:border-gray-700">
                                        <div className="flex-1">
                                            <Input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Ask me anything about your homework..."
                                                className="border bg-gray-50 dark:bg-gray-700 border-purple-500 dark:border-purple-500 rounded-2xl px-6 py-6 w-full text-black dark:text-white"
                                                disabled={isLoading || isUploading}
                                            />
                                        </div>
                                       <div className="flex items-center space-x-2">
                                        <Button 
                                        onClick={handleUpload}
                                        disabled={isLoading || isUploading}
                                        size="icon" 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl px-6 py-3 text-white dark:text-white"
                                        title="Upload documents"
                                        >
                                            {isUploading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <UploadCloud className="w-4 h-4" />
                                            )}
                                        </Button>
                                        
                                        {/* NEW: Clear files button */}
                                        {uploadedFiles.length > 0 && (
                                            <Button 
                                            onClick={handleClearFiles}
                                            disabled={isLoading || isUploading}
                                            size="icon" 
                                            variant="outline"
                                            className="rounded-2xl px-6 py-3"
                                            title="Clear uploaded files"
                                            >
                                                <File className="w-4 h-4" />
                                            </Button>
                                        )}
                                        
                                        <Button 
                                        onClick={toggleVoiceRecording}
                                        disabled={isLoading || isUploading}
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
                                            disabled={!inputValue.trim() || isLoading || isUploading}
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

export default AiTutor;