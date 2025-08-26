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
import { useSearchParams } from 'next/navigation';

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
                                        disabled={isLoading}
                                        size="icon" 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl px-6 py-3 text-white dark:text-white">
                                            <AudioLines className="w-4 h-4" />
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
        </div>
    );
};

export default AiTutor;