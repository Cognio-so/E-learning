'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star, MessageSquare, Target, Zap, Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import useFeedbackStore from '@/store/useFeedbackStore'
import useAuthStore from '@/store/useAuthStore' // Add this to get current user

const FeedbackDialog = ({ 
  isOpen, 
  onClose, 
  resource, 
  lesson 
}) => {
  const [rating, setRating] = useState(0)
  const [difficulty, setDifficulty] = useState('moderate')
  const [helpfulness, setHelpfulness] = useState('helpful')
  const [engagement, setEngagement] = useState('interesting')
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { submitFeedback, userFeedback } = useFeedbackStore()
  const { user } = useAuthStore() // Add this to get current user

  // Check if user has already provided feedback
  useEffect(() => {
    // Check for resource feedback first, then lesson feedback
    if (resource && userFeedback.length > 0) {
      const existingFeedback = userFeedback.find(f => f.resourceId === resource._id)
      if (existingFeedback) {
        setRating(existingFeedback.rating)
        setDifficulty(existingFeedback.difficulty)
        setHelpfulness(existingFeedback.helpfulness)
        setEngagement(existingFeedback.engagement)
        setComment(existingFeedback.comment || '')
        setTags(existingFeedback.tags || [])
        setIsAnonymous(existingFeedback.isAnonymous || false)
      }
    } else if (lesson && userFeedback.length > 0) {
      // Check for lesson feedback
      const existingFeedback = userFeedback.find(f => f.lessonId === lesson._id)
      if (existingFeedback) {
        setRating(existingFeedback.rating)
        setDifficulty(existingFeedback.difficulty)
        setHelpfulness(existingFeedback.helpfulness)
        setEngagement(existingFeedback.engagement)
        setComment(existingFeedback.comment || '')
        setTags(existingFeedback.tags || [])
        setIsAnonymous(existingFeedback.isAnonymous || false)
      }
    }
  }, [resource, lesson, userFeedback])

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    if (!user?._id) {
      toast.error('Please log in to submit feedback')
      return
    }

    setIsSubmitting(true)
    try {
      const feedbackData = {
        userId: user._id, // Always use current user's ID
        resourceId: resource?._id || lesson?._id, // Use lesson ID if no resource
        resourceType: resource?.resourceType || 'lesson', // Default to lesson if no resource
        lessonId: lesson?._id,
        rating,
        difficulty,
        helpfulness,
        engagement,
        comment: comment.trim(),
        tags,
        isAnonymous
      }

      console.log('Submitting feedback data:', feedbackData) // Debug log

      await submitFeedback(feedbackData)
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagToggle = (tag) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const availableTags = [
    'clear_explanation',
    'good_examples', 
    'needs_improvement',
    'too_fast',
    'too_slow',
    'confusing',
    'engaging',
    'practical',
    'theoretical'
  ]

  const tagLabels = {
    clear_explanation: 'Clear Explanation',
    good_examples: 'Good Examples',
    needs_improvement: 'Needs Improvement',
    too_fast: 'Too Fast',
    too_slow: 'Too Slow',
    confusing: 'Confusing',
    engaging: 'Engaging',
    practical: 'Practical',
    theoretical: 'Theoretical'
  }

  // Update the title and description to handle both resource and lesson
  const title = resource?.title || resource?.name || lesson?.title || 'Unknown'
  const description = resource?.description || lesson?.description || ''

  if (!resource && !lesson) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Help us improve by sharing your thoughts on "{title}"
            {description && ` - ${description}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 dark:text-white">
              How would you rate this content? *
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                    star <= rating 
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
          </div>

          {/* Difficulty Section */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 dark:text-white">
              How difficult was this content? *
            </Label>
            <RadioGroup value={difficulty} onValueChange={setDifficulty} className="grid grid-cols-5 gap-3">
              {[
                { value: 'very_easy', label: 'Very Easy', icon: '😊' },
                { value: 'easy', label: 'Easy', icon: '🙂' },
                { value: 'moderate', label: 'Moderate', icon: '😐' },
                { value: 'hard', label: 'Hard', icon: '😟' },
                { value: 'very_hard', label: 'Very Hard', icon: '😰' }
              ].map((option) => (
                <div key={option.value} className="flex flex-col items-center">
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <Label 
                    htmlFor={option.value} 
                    className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      difficulty === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className="text-xs text-center font-medium">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Helpfulness Section */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 dark:text-white">
              How helpful was this content? *
            </Label>
            <RadioGroup value={helpfulness} onValueChange={setHelpfulness} className="grid grid-cols-5 gap-3">
              {[
                { value: 'not_helpful', label: 'Not Helpful', icon: '❌' },
                { value: 'somewhat_helpful', label: 'Somewhat', icon: '🤔' },
                { value: 'helpful', label: 'Helpful', icon: '👍' },
                { value: 'very_helpful', label: 'Very Helpful', icon: '🎯' },
                { value: 'extremely_helpful', label: 'Extremely', icon: '🚀' }
              ].map((option) => (
                <div key={option.value} className="flex flex-col items-center">
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <Label 
                    htmlFor={option.value} 
                    className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      helpfulness === option.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className="text-xs text-center font-medium">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Engagement Section */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 dark:text-white">
              How engaging was this content? *
            </Label>
            <RadioGroup value={engagement} onValueChange={setEngagement} className="grid grid-cols-5 gap-3">
              {[
                { value: 'boring', label: 'Boring', icon: '😴' },
                { value: 'somewhat_interesting', label: 'Somewhat', icon: '🤷' },
                { value: 'interesting', label: 'Interesting', icon: '🤔' },
                { value: 'very_interesting', label: 'Very Interesting', icon: '😮' },
                { value: 'exciting', label: 'Exciting', icon: '🤩' }
              ].map((option) => (
                <div key={option.value} className="flex flex-col items-center">
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <Label 
                    htmlFor={option.value} 
                    className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      engagement === option.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className="text-xs text-center font-medium">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 dark:text-white">
              Select tags that apply (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    tags.includes(tag) 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-blue-50 dark:hover:bg-blue-950'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tagLabels[tag]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 dark:text-white">
              Additional comments (optional)
            </Label>
            <Textarea
              placeholder="Share your thoughts, suggestions, or any specific feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="anonymous" className="text-sm text-gray-600 dark:text-gray-300">
              Submit feedback anonymously
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackDialog
