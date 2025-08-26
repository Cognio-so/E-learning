'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardUrl = user.role === 'student' 
                ? '/student/dashboard' 
                : '/teacher/dashboard';
            router.replace(dashboardUrl);
        } else {
            router.replace('/auth/login');
        }
    }, [user, isAuthenticated, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Redirecting to dashboard...</span>
            </div>
        </div>
    );
}
