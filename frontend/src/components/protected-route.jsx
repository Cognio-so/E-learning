'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, isLoading, getUser } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If not authenticated, try to get user data (this will validate cookies)
        if (!isAuthenticated) {
          await getUser()
        }
        
        setIsChecking(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsChecking(false)
        setRedirectPath('/auth/login')
        setShouldRedirect(true)
      }
    }

    checkAuth()
  }, [isAuthenticated, getUser])

  // Handle role-based redirects
  useEffect(() => {
    if (!isChecking && !isLoading && isAuthenticated && user && requiredRole) {
      if (user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        const path = user.role === 'admin' ? '/admin/dashboard' 
                   : user.role === 'teacher' ? '/teacher/dashboard'
                   : user.role === 'student' ? '/student/dashboard'
                   : '/auth/login'
        
        setRedirectPath(path)
        setShouldRedirect(true)
      }
    }
  }, [isChecking, isLoading, isAuthenticated, user, requiredRole])

  // Handle redirects
  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      router.push(redirectPath)
    }
  }, [shouldRedirect, redirectPath, router])

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or should redirect, don't render anything
  if (!isAuthenticated || shouldRedirect) {
    return null
  }

  return children
}
