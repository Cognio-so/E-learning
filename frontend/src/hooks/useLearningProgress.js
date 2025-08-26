'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import useAuthStore from '@/store/useAuthStore'
import useProgressStore from '@/store/useProgressStore'

export const useLearningProgress = () => {
  const [currentResource, setCurrentResource] = useState(null)
  const [isLearningDialogOpen, setIsLearningDialogOpen] = useState(false)
  const [userProgress, setUserProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const { user } = useAuthStore()
  const { startLearning, updateProgress, completeResource, fetchUserProgress } = useProgressStore()

  const handleStartLearning = async (resource) => {
    if (!user?._id) {
      toast.error('Please log in to continue learning')
      return
    }

    try {
      // Check if user has progress for this resource
      const progress = await fetchUserProgress(user._id)
      const resourceProgress = progress?.find(p => p.resourceId === resource._id || p.resourceId === resource.resourceId)
      
      setUserProgress(resourceProgress?.progress || 0)
      setIsCompleted(resourceProgress?.status === 'completed' || false)
      setCurrentResource(resource)
      setIsLearningDialogOpen(true)

      // Start learning session - handle API error gracefully
      try {
        // Use the correct resource ID (prefer _id if available, fallback to resourceId)
        const resourceId = resource._id || resource.resourceId
        
        await startLearning(
          user._id,
          resourceId,
          resource.resourceType || resource.type || 'content',
          resource.lessonId || resource.courseId || null
        )
      } catch (apiError) {
        // If API fails, still open the dialog but show a warning
        console.warn('API call failed, but continuing with local learning session:', apiError)
        toast.warning('Learning session started locally (offline mode)')
      }

      toast.success(`Started learning ${resource.title || resource.name}! 🚀`)
    } catch (error) {
      console.error('Error starting learning:', error)
      toast.error('Failed to start learning')
    }
  }

  const handleCompleteLearning = async (completionData) => {
    if (!user?._id || !currentResource) return

    try {
      // Update progress in store
      try {
        const resourceId = currentResource._id || currentResource.resourceId
        
        // First update progress
        await updateProgress(
          user._id, 
          resourceId, 
          100, 
          completionData.timeSpent
        )
        
        // Then complete the resource
        await completeResource(user._id, resourceId)
      } catch (apiError) {
        // If API fails, still mark as completed locally
        console.warn('Progress update failed, but marking as completed locally:', apiError)
        toast.warning('Progress saved locally (offline mode)')
      }

      setIsCompleted(true)
      setUserProgress(100)
      
      // Show achievement notification
      toast.success(`🎉 Achievement Unlocked! You completed ${currentResource.title || currentResource.name}!`)
      
      // Close dialog
      setIsLearningDialogOpen(false)
      setCurrentResource(null)
      
      // Call the completion callback with resource title
      if (onComplete) {
        onComplete({
          ...completionData,
          resourceTitle: currentResource.title || currentResource.name
        })
      }
    } catch (error) {
      console.error('Error completing learning:', error)
      toast.error('Failed to complete learning')
    }
  }

  const handleCloseLearning = () => {
    setIsLearningDialogOpen(false)
    setCurrentResource(null)
  }

  return {
    currentResource,
    isLearningDialogOpen,
    userProgress,
    isCompleted,
    handleStartLearning,
    handleCompleteLearning,
    handleCloseLearning
  }
}
