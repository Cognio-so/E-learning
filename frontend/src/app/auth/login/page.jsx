'use client'
import { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const Login = () => {
    const { login, isLoading, setIsLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email.trim() || !formData.password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setIsLoading(true);
            const result = await login({
                email: formData.email.trim(),
                password: formData.password,
            });
            
            if (result.success) {
                toast.success("Login successful!");
                
                // Force a page refresh to ensure middleware picks up the new authentication state
                // This is necessary because middleware runs on the server side
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000); // Small delay to show the success message
            }
        } catch (error) {
            console.error("Login failed:", error);
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Sign In
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700" 
                            placeholder="Enter your password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-600 hover:dark:bg-purple-700 dark:text-white dark:border-gray-700 border-2 border-indigo-600 cursor-pointer" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-white">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;