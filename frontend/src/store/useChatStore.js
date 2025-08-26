'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useChatStore = create(
    persist(
        (set, get) => ({
            // State
            chatSessions: [],
            currentSession: null,
            isLoading: false,
            error: null,

            // Actions
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Fetch all chat sessions for a user
            fetchChatSessions: async (userId) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    const response = await axiosInstance.get(`/api/chat/sessions/${userId}`);
                    
                    if (response.data.success) {
                        set({ 
                            chatSessions: response.data.data,
                            isLoading: false 
                        });
                        return response.data.data;
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    console.error('Error fetching chat sessions:', error);
                    set({ 
                        error: error.response?.data?.message || error.message,
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Fetch a specific chat session
            fetchChatSession: async (sessionId) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    const response = await axiosInstance.get(`/api/chat/session/${sessionId}`);
                    
                    if (response.data.success) {
                        set({ 
                            currentSession: response.data.data,
                            isLoading: false 
                        });
                        return response.data.data;
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    console.error('Error fetching chat session:', error);
                    set({ 
                        error: error.response?.data?.message || error.message,
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Save or update chat session
            saveChatSession: async (sessionData) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    const response = await axiosInstance.post('/api/chat/session', sessionData);
                    
                    if (response.data.success) {
                        // Update the sessions list if this is a new session
                        const { sessionId, title } = response.data.data;
                        const existingSessionIndex = get().chatSessions.findIndex(
                            session => session.sessionId === sessionId
                        );
                        
                        if (existingSessionIndex === -1) {
                            // Add new session to the list
                            const newSession = {
                                sessionId,
                                title,
                                messageCount: sessionData.messages.length,
                                lastActivity: new Date(),
                                createdAt: new Date()
                            };
                            
                            set(state => ({
                                chatSessions: [newSession, ...state.chatSessions],
                                isLoading: false
                            }));
                        } else {
                            // Update existing session
                            set(state => ({
                                chatSessions: state.chatSessions.map((session, index) =>
                                    index === existingSessionIndex
                                        ? { ...session, lastActivity: new Date() }
                                        : session
                                ),
                                isLoading: false
                            }));
                        }
                        
                        return response.data.data;
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    console.error('Error saving chat session:', error);
                    set({ 
                        error: error.response?.data?.message || error.message,
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Update chat session title
            updateChatTitle: async (sessionId, title) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    const response = await axiosInstance.patch(`/api/chat/session/${sessionId}/title`, { title });
                    
                    if (response.data.success) {
                        // Update the session in the list
                        set(state => ({
                            chatSessions: state.chatSessions.map(session =>
                                session.sessionId === sessionId
                                    ? { ...session, title }
                                    : session
                            ),
                            isLoading: false
                        }));
                        
                        return response.data.data;
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    console.error('Error updating chat title:', error);
                    set({ 
                        error: error.response?.data?.message || error.message,
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Delete chat session
            deleteChatSession: async (sessionId) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    const response = await axiosInstance.delete(`/api/chat/session/${sessionId}`);
                    
                    if (response.data.success) {
                        // Remove from sessions list
                        set(state => ({
                            chatSessions: state.chatSessions.filter(
                                session => session.sessionId !== sessionId
                            ),
                            isLoading: false
                        }));
                        
                        // Clear current session if it's the deleted one
                        if (get().currentSession?.sessionId === sessionId) {
                            set({ currentSession: null });
                        }
                        
                        return true;
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    console.error('Error deleting chat session:', error);
                    set({ 
                        error: error.response?.data?.message || error.message,
                        isLoading: false 
                    });
                    throw error;
                }
            },

            // Clear current session
            clearCurrentSession: () => set({ currentSession: null }),

            // Add message to current session (for real-time updates)
            addMessageToCurrentSession: (message) => {
                set(state => ({
                    currentSession: state.currentSession
                        ? {
                            ...state.currentSession,
                            messages: [...state.currentSession.messages, message]
                        }
                        : null
                }));
            },

            // Update current session messages
            updateCurrentSessionMessages: (messages) => {
                set(state => ({
                    currentSession: state.currentSession
                        ? { ...state.currentSession, messages }
                        : null
                }));
            }
        }),
        {
            name: 'chat-store',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                chatSessions: state.chatSessions,
                currentSession: state.currentSession
            })
        }
    )
);

export default useChatStore;