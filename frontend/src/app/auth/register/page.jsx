'use client'
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { grades } from "@/config/data";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
    const router = useRouter();
    const { register, isLoading, setIsLoading, isAuthenticated, user } = useAuthStore();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        grade: "",
        terms: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardUrl = user.role === 'student' 
                ? '/student/dashboard' 
                : user.role === 'teacher'
                ? '/teacher/dashboard'
                : '/admin/dashboard';
            router.push(dashboardUrl);
        }
    }, [isAuthenticated, user, router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.grade) {
            toast.error("All fields are required");
            return;
        }

        if (!formData.terms) {
            toast.error("Please accept the terms and conditions");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            setIsLoading(true);
            const result = await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                grade: formData.grade,
            });
            
            toast.success("Registration successful! Please check your email for verification.");
            
            // Redirect to verify-email page with email parameter
            router.push(`/auth/verify?email=${encodeURIComponent(formData.email.trim())}&message=verify-email`);
            
        } catch (error) {
            console.error("Registration failed:", error);
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Create Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Full Name
                        </label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700" 
                            placeholder="Enter your full name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700" 
                            placeholder="Enter your email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Grade
                        </label>
                        <select
                            id="grade"
                            name="grade"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                            value={formData.grade}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        >
                            <option value="">Select Grade</option>
                            {grades.map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password" 
                                name="password" 
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700" 
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1 dark:text-white">Must be at least 6 characters long</p>
                    </div>
                    
                    <div className="flex items-start">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            name="terms" 
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                            checked={formData.terms}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-white">
                            I agree to the{" "}
                            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                                Terms and Conditions
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={isLoading || !formData.terms}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-white">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;