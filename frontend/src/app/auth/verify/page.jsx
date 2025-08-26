'use client'
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

// Component that uses useSearchParams
const VerifyEmailContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyEmail, isLoading, setIsLoading } = useAuthStore();
    const [isResending, setIsResending] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    
    const email = searchParams.get('email');
    const message = searchParams.get('message');

    const handleVerification = async (e) => {
        e.preventDefault();
        
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit verification code');
            return;
        }

        try {
            setIsLoading(true);
            const result = await verifyEmail(verificationCode);
            
            if (result.success) {
                setIsVerified(true);
                toast.success('Email verified successfully! Redirecting to login...');
                
                setTimeout(() => {
                    router.push('/auth/login?message=verified');
                }, 2000);
            }
        } catch (error) {
            console.error('Email verification failed:', error);
            const errorMsg = error.response?.data?.message || 'Email verification failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            // TODO: Implement resend verification API call
            toast.success('Verification email sent! Please check your inbox.');
        } catch (error) {
            toast.error('Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified successfully!</h2>
                        <p className="text-gray-600 mb-4">Your email has been verified. Please login to access your account.</p>
                        <div className="animate-pulse">
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md inline-block">
                                Redirecting to login...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
                <div className="text-center">
                    <Mail className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Verify your email</h2>
                    
                    {message === 'verify-email' && (
                        <p className="text-gray-600 mb-4 dark:text-white">
                            Registration successful! We've sent a 6-digit verification code to your email address.
                        </p>
                    )}
                    
                    {email && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 dark:bg-gray-800 dark:text-white dark:border-gray-700">
                            <p className="text-sm text-blue-800 dark:text-white">
                                <strong>Email sent to:</strong> {email}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleVerification} className="space-y-4">
                        <div>
                            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                                Verification Code
                            </label>
                            <Input
                                type="text"
                                id="verificationCode"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                className="text-center text-lg font-mono tracking-widest dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                maxLength={6}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button 
                            type="submit"
                            disabled={isLoading || verificationCode.length !== 6}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-purple-600 hover:dark:bg-purple-700 dark:text-white dark:border-gray-700 border-2 border-indigo-600 cursor-pointer"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </Button>
                    </form>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6 dark:bg-gray-800 dark:text-white dark:border-gray-700">
                        <p className="text-sm text-yellow-800 dark:text-white">
                            <strong>Didn't receive the email?</strong> Check your spam folder or try resending.
                        </p>
                    </div>

                    <div className="space-y-3 mt-4">
                        <Button 
                            onClick={handleResendVerification}
                            disabled={isResending}
                            variant="outline"
                            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        >
                            {isResending ? 'Sending...' : 'Resend verification email'}
                        </Button>
                        
                        <Link href="/auth/login">
                            <Button variant="outline" className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Loading fallback component
const VerifyEmailLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

// Main page component with Suspense boundary
const VerifyEmailPage = () => {
    return (
        <Suspense fallback={<VerifyEmailLoading />}>
            <VerifyEmailContent />
        </Suspense>
    );
};

export default VerifyEmailPage;