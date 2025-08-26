'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from 'sonner';
import axios from "axios";
import useAuthStore from './useAuthStore';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useTeacherReportsStore = create(
    persist(
        (set, get) => ({
            // State
            reportData: null,
            isLoading: false,
            error: null,
            lastUpdated: null,

            // Set and clear error
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Actions
            fetchTeacherReports: async (teacherId) => {
                if (!teacherId) {
                    set({ error: 'Teacher ID is required' });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const response = await axiosInstance.get(`/api/progress/teacher/${teacherId}`);
                    
                    if (response.status === 200 && response.data.status === 'success') {
                        set({
                            reportData: response.data.data,
                            isLoading: false,
                            error: null,
                            lastUpdated: new Date().toISOString()
                        });
                        return response.data.data;
                    } else {
                        throw new Error(response.data.message || 'Failed to fetch reports');
                    }
                } catch (error) {
                    console.error('Error fetching teacher reports:', error);
                    
                    if (error.response?.status === 401) {
                        set({ 
                            error: 'Authentication required. Please log in again.',
                            isLoading: false 
                        });
                    } else {
                        set({
                            error: error.response?.data?.message || error.message || 'Failed to fetch reports',
                            isLoading: false
                        });
                    }
                    throw error;
                }
            },

            refreshReports: async () => {
                const { user } = useAuthStore.getState();
                if (user?._id) {
                    try {
                        await get().fetchTeacherReports(user._id);
                        toast.success('Reports refreshed successfully!');
                    } catch (error) {
                        toast.error('Failed to refresh reports');
                        throw error;
                    }
                } else {
                    toast.error('User not authenticated');
                }
            },

            clearReports: () => {
                set({
                    reportData: null,
                    isLoading: false,
                    error: null,
                    lastUpdated: null
                });
            },

            // Simple getters for the data
            getOverviewStats: () => {
                const { reportData } = get();
                return reportData?.overview || null;
            },

            getPerformanceDistribution: () => {
                const { reportData } = get();
                return reportData?.performance || null;
            },

            getTopPerformers: () => {
                const { reportData } = get();
                return reportData?.topPerformers || [];
            },

            getSubjectPerformance: () => {
                const { reportData } = get();
                return reportData?.subjects || [];
            },

            getStudentReports: () => {
                const { reportData } = get();
                return reportData?.studentReports || [];
            },

            getBehaviorAnalysis: () => {
                const { reportData } = get();
                return reportData?.behaviorAnalysis || null;
            },

            getAttendanceData: () => {
                const { reportData } = get();
                return reportData?.attendance || null;
            }
        }),
        {
            name: 'teacher-reports-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                reportData: state.reportData,
                lastUpdated: state.lastUpdated
            })
        }
    )
);

export default useTeacherReportsStore;
