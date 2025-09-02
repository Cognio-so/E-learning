'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

let refreshInterval = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

// Setup automatic token refresh and response interceptor
const setupTokenManagement = (refreshTokenFn, clearAuthFn) => {
    // Clear any existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }

    // Start automatic refresh every 10 minutes (before 15-minute expiry)
    refreshInterval = setInterval(async () => {
        try {
            await refreshTokenFn();
            console.log('✅ Auto-refresh successful');
        } catch (error) {
            console.log('❌ Auto-refresh failed, logging out');
            clearAuthFn();
        }
    }, 10 * 60 * 1000); // 10 minutes

    console.log('🔄 Token auto-refresh started (every 10 minutes)');
};

const clearTokenManagement = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log('🛑 Token auto-refresh stopped');
    }
};

// Response interceptor for handling 401s
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh')) {
            if (isRefreshing) {
                // Queue this request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Get fresh token
                await useAuthStore.getState().refreshToken();
                processQueue(null, true);
                
                // Retry original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().clearAuth();
                
                // Redirect to login if in browser
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            
            setUser: (user) => set({ user }),
            setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setIsLoading: (isLoading) => set({ isLoading }),

            clearAuth: () => {
                clearTokenManagement();
                set({ 
                    user: null, 
                    isAuthenticated: false, 
                    isLoading: false 
                });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                }
            },

            register: async (formData) => {
                set({ isLoading: true });
                try {
                    const response = await axiosInstance.post("/api/auth/register", formData);
                    if (response.status === 201) {
                        set({ 
                            user: null, 
                            isAuthenticated: false,
                            isLoading: false 
                        });
                        return response.data;
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            login: async (formData) => {
                set({ isLoading: true });
                try {
                    const response = await axiosInstance.post("/api/auth/login", formData);
                    if (response.status === 200) {
                        set({ 
                            user: response.data.user, 
                            isAuthenticated: true,
                            isLoading: false 
                        });
                        
                        // Start automatic token management
                        setupTokenManagement(get().refreshToken, get().clearAuth);
                        
                        return response.data;
                    }
                } catch (error) {
                    set({ isLoading: false });
                    // Handle specific error cases
                    if (error.response?.status === 400) {
                        throw error;
                    }
                    throw new Error('Network error. Please try again.');
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await axiosInstance.post("/api/auth/logout");
                } catch (error) {
                    console.error("Logout API failed:", error);
                } finally {
                    get().clearAuth();
                }
            },

            verifyEmail: async (code) => {
                set({ isLoading: true });
                try {
                    const response = await axiosInstance.get(`/api/auth/verify/${code}`);
                    if (response.status === 200) {
                        set({ 
                            user: null,
                            isAuthenticated: false,
                            isLoading: false 
                        });
                        return response.data;
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            getUser: async () => {
                if (get().isLoading) return;
                
                set({ isLoading: true });
                try {
                    const response = await axiosInstance.get("/api/auth/user");
                    if (response.status === 200) {
                        set({ 
                            user: response.data.user, 
                            isAuthenticated: true,
                            isLoading: false 
                        });
                        
                        // Ensure token management is running
                        if (!refreshInterval) {
                            setupTokenManagement(get().refreshToken, get().clearAuth);
                        }
                        
                        return response.data;
                    }
                } catch (error) {
                    set({ isLoading: false });
                    console.error('getUser error:', error.response?.status, error.response?.data);
                    
                    if (error.response?.status === 401) {
                        console.log('401 error - clearing auth');
                        get().clearAuth();
                        return null;
                    }
                    throw error;
                }
            },

            refreshToken: async () => {
                try {
                    const response = await axiosInstance.post(
                        "/api/auth/refresh",
                        {},
                        { 
                            timeout: 10000 // Add timeout
                        }
                    );
                    
                    if (response.status === 200) {
                        set({ 
                            user: response.data.user, 
                            isAuthenticated: true 
                        });
                        return response.data;
                    }
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    // Clear auth on refresh failure
                    get().clearAuth();
                    throw error;
                }
            },

            // Initialize auth on app start
            initializeAuth: async () => {
                const { isAuthenticated } = get();
                
                if (isAuthenticated) {
                    try {
                        // Try to get user data (validates current token)
                        await get().getUser();
                    } catch (error) {
                        // If getUser fails, try refresh
                        try {
                            await get().refreshToken();
                            await get().getUser();
                        } catch (refreshError) {
                            // Both failed, clear auth
                            get().clearAuth();
                        }
                    }
                }
            }
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                user: state.user,
                isAuthenticated: state.isAuthenticated 
            }),
            onRehydrateStorage: () => (state) => {
                // Auto-initialize when state is rehydrated
                if (state?.isAuthenticated) {
                    setTimeout(() => {
                        state.initializeAuth();
                    }, 100);    
                }
            },
        }
    )
);

export default useAuthStore;