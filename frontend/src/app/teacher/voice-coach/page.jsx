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

const VoiceCoach = () => {
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
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            timestamp: new Date(),
            avatar: <User className="w-4 h-4 text-purple-500" />
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                content: "That's a great question! Let me help you understand this better. Here's what I think...",
                timestamp: new Date(),
                avatar: <Sparkle className="w-4 h-4 text-yellow-500" />
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 2000);
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
                                                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                                                                        {message.content}
                                                                    </ReactMarkdown>
                                                                </div>
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
                                                placeholder="Ask me anything about your homework..."
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
                                        disabled={isLoading}
                                        size="icon" 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl px-6 py-3 text-white dark:text-white">
                                            <AudioLines className="w-4 h-4" />
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


        </div>
    );
};

export default VoiceCoach;