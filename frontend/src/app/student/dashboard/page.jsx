'use client'

import useAuthStore from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"


export default function StudentDashboard() {
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        redirect('/auth/login')
    }
    
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Dashboard</h1>
                    <p className="text-lg text-gray-600">Welcome, {user?.name}!</p>
                    <p className="text-sm text-gray-500 mt-2">Role: {user?.role}</p>
                    <p className="text-sm text-gray-500 mt-2">Grade: {user?.grade}</p>
                    <Button className={'mt-4'} onClick={() => {
                        handleLogout()
                    }}>Logout</Button>
                </div>
            </div>
        </div>
    )
}