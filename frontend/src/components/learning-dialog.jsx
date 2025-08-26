'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Heart,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Film,
  BookOpen,
  ImageIcon,
  Gamepad2,
  ExternalLink,
  Award,
  Target,
  Zap,
  Calendar,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import PPTXViewer from './pptx-viewer'
import useAuthStore from '@/store/useAuthStore'
import useProgressStore from '@/store/useProgressStore'
import { MarkdownStyles } from './chat/Markdown'

const gradients = {
  Math: 'from-yellow-300 via-orange-300 to-red-400',
  Science: 'from-green-300 via-blue-300 to-purple-400',
  English: 'from-pink-300 via-purple-300 to-indigo-400',
  History: 'from-amber-300 via-orange-400 to-red-400',
  Art: 'from-purple-300 via-pink-300 to-red-300',
  Geography: 'from-green-400 via-teal-400 to-blue-500',
  Physics: 'from-blue-400 via-indigo-400 to-purple-500',
  Chemistry: 'from-green-400 via-emerald-400 to-teal-500',
  Biology: 'from-green-300 via-lime-300 to-emerald-400',
  'Computer Science': 'from-gray-400 via-blue-400 to-indigo-500',
  'Social Studies': 'from-orange-300 via-red-300 to-pink-400',
  Music: 'from-purple-300 via-pink-300 to-red-300',
  'Physical Education': 'from-green-300 via-emerald-300 to-teal-400',
  'Foreign Languages': 'from-blue-300 via-indigo-300 to-purple-400',
  Business: 'from-gray-300 via-blue-300 to-indigo-400',
  Health: 'from-green-300 via-emerald-300 to-teal-400'
}

const LearningDialog = ({ 
  isOpen, 
  onClose, 
  resource, 
  onComplete, 
  userProgress = 0,
  isCompleted = false 
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(userProgress)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completionTime, setCompletionTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [assessmentAnswers, setAssessmentAnswers] = useState({})
  const [shortAnswerInputs, setShortAnswerInputs] = useState({})
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [assessmentScore, setAssessmentScore] = useState(null)

  const { user } = useAuthStore()
  const { updateProgress, completeResource, submitAssessment } = useProgressStore()

  useEffect(() => {
    if (isOpen && resource) {
      setStartTime(Date.now())
      setProgress(userProgress)
      setCurrentStep(0)
      setIsPlaying(false)
      setAssessmentAnswers({})
      setShowResults(false)
      setAssessmentScore(null)
    }
  }, [isOpen, resource, userProgress])

  useEffect(() => {
    let interval
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        setCompletionTime(Date.now() - startTime)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, startTime])

  const getItemColor = (subject) => gradients[subject] || 'from-gray-300 to-gray-400'

  const getTotalSteps = () => {
    if (!resource) return 1
    
    switch (resource.resourceType) {
      case 'slide': 
        return resource.slides?.length || 1
      case 'video': 
        return 1
      case 'comic': 
        // Comics use imageUrls array - check if it exists and has content
        const comicImages = resource.imageUrls || resource.pages || resource.images || []
        console.log('Comic images found:', comicImages.length, comicImages) // Debug log
        return comicImages.length > 0 ? comicImages.length : 1
      case 'image': 
        return 1
      case 'content': 
        return resource.sections?.length || 1
      case 'assessment': 
        return resource.questions?.length || 1
      case 'webSearch':
        return 1
      default: 
        return 1
    }
  }

  const handleStartLearning = async () => {
    setIsPlaying(true)
    setStartTime(Date.now())
    
    // Calculate initial progress based on current step
    const totalSteps = getTotalSteps()
    const initialProgress = totalSteps > 1 ? Math.round((1 / totalSteps) * 100) : 10
    
    // Update progress to indicate learning has started
    if (user?._id && resource) {
      try {
        const resourceId = resource._id || resource.resourceId
        await updateProgress(user._id, resourceId, initialProgress, 0)
        setProgress(initialProgress)
      } catch (error) {
        console.warn('Failed to update progress:', error)
      }
    } else {
      setProgress(initialProgress)
    }
    
    // Fix title display - check all possible title fields
    const resourceTitle = resource.title || resource.name || resource.instruction || 'Learning Resource'
    toast.success(`Started learning ${resourceTitle}! 🚀`)
  }

  const handlePause = () => {
    setIsPlaying(false)
    toast.info('Learning paused. Take a break! ☕')
  }

  const handleNextStep = async () => {
    const totalSteps = getTotalSteps()
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      
      // Calculate new progress based on completed steps
      const newProgress = Math.min(100, Math.round(((newStep + 1) / totalSteps) * 100))
      setProgress(newProgress)
      
      // Update progress in backend
      if (user?._id && resource) {
        try {
          const resourceId = resource._id || resource.resourceId
          const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60) // minutes
          await updateProgress(user._id, resourceId, newProgress, timeSpent)
        } catch (error) {
          console.warn('Failed to update progress:', error)
        }
      }
    }
  }

  const handlePrevStep = () => {
    const totalSteps = getTotalSteps()
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      
      // Calculate new progress based on completed steps
      const newProgress = Math.max(0, Math.round(((newStep + 1) / totalSteps) * 100))
      setProgress(newProgress)
    }
  }

  const handleComplete = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      if (resource.resourceType === 'assessment') {
        // Prepare answers for submission
        const answers = Object.keys(assessmentAnswers).map(questionIndex => ({
          questionId: questionIndex,
          answer: assessmentAnswers[questionIndex]
        }))
        
        // Add short answer responses
        Object.keys(shortAnswerInputs).forEach(questionIndex => {
          const existingAnswer = answers.find(a => a.questionId === questionIndex)
          if (!existingAnswer && shortAnswerInputs[questionIndex]) {
            answers.push({
              questionId: questionIndex,
              answer: shortAnswerInputs[questionIndex]
            })
          }
        })
        
        console.log('Submitting assessment answers:', answers)
        
        // Use the progress store to submit assessment
        const result = await submitAssessment(user._id, resource._id, answers)
        console.log('Assessment result:', result)
        
        // Store results and show feedback
        setAssessmentResults(result)
        setShowResults(true)
        
        // Update progress store is already handled by submitAssessment
      } else {
        // For non-assessment resources, use the progress store
        await completeResource(user._id, resource._id)
      onClose()
      }
    } catch (error) {
      console.error('Error completing resource:', error)
      toast.error('Failed to complete resource. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssessmentAnswer = (questionIndex, answer) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleShortAnswerInput = (questionIndex, value) => {
    setShortAnswerInputs(prev => ({
      ...prev,
      [questionIndex]: value
    }))
    
    // Also update assessment answers for validation
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }))
  }

  const getQuestionTypeDisplay = (type) => {
    const types = {
      mcq: 'MCQ',
      multiple_choice: 'MCQ',
      true_false: 'T/F',
      truefalse: 'T/F',
      short_answer: 'Short Answer',
      shortanswer: 'Short Answer',
      long_answer: 'Long Answer',
      longanswer: 'Long Answer',
      mixed: 'Mixed'
    };
    return types[type?.toLowerCase()] || type || 'Mixed';
  };

  const getCorrectAnswer = (question, questionId) => {
    // Find the correct answer from the assessment solutions
    if (resource.solutions && resource.solutions.length > 0) {
      const solution = resource.solutions.find(s => s.questionNumber === parseInt(questionId) + 1)
      if (solution) {
        return solution.answer
      }
    }
    
    // Fallback: try to extract from question if it's MCQ
    if (question.question && question.question.includes('A)') && question.question.includes('B)')) {
      // This is a fallback - ideally solutions should be available
      return 'Answer not available'
    }
    
    return 'Answer not available'
  }

  const renderSlidesContent = () => {
    if (!resource.slides || resource.slides.length === 0) {
        return (
              <div className="aspect-video bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
              {resource.title || resource.name} - Slide {currentStep + 1}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {resource.description || resource.content || 'Interactive content and learning materials'}
                  </p>
                </div>
              </div>
      )
    }

    const currentSlide = resource.slides[currentStep]
    return (
      <div className="aspect-video bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {currentSlide?.fileUrl ? (
          <PPTXViewer fileUrl={currentSlide.fileUrl} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6">
              <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {currentSlide?.title || `Slide ${currentStep + 1}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentSlide?.content || resource.description || 'Slide content will appear here'}
              </p>
            </div>
          </div>
        )}
          </div>
        )
  }

  const renderVideoContent = () => {
        return (
      <div className="aspect-video bg-black rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden">
        {resource.videoUrl ? (
          <video 
            className="w-full h-full object-cover"
            controls
            autoPlay={isPlaying}
            muted={isMuted}
          >
            <source src={resource.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
                <div className="text-center text-white">
                  <Film className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">{resource.title || resource.name}</p>
                  <p className="text-sm text-gray-300">
              {resource.description || resource.content || 'Video content would play here'}
                  </p>
                </div>
        )}
          </div>
        )
  }

  const renderComicContent = () => {
    // Comics use imageUrls array from the backend model
    const comicImages = resource.imageUrls || resource.pages || resource.images || []
    const totalSteps = getTotalSteps()
    
    console.log('Rendering comic content:', {
      imageUrls: resource.imageUrls,
      pages: resource.pages,
      images: resource.images,
      comicImages,
      totalSteps,
      currentStep
    })
    
    if (comicImages.length === 0) {
        return (
              <div className="aspect-[4/3] bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-pink-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
              {resource.title || resource.name || resource.instruction} - Page {currentStep + 1}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {resource.description || resource.content || 'Engaging comic story and illustrations'}
            </p>
          </div>
        </div>
      )
    }

    const currentImage = comicImages[currentStep]
    return (
      <div className="aspect-[4/3] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {currentImage ? (
          <img 
            src={currentImage} 
            alt={`Comic page ${currentStep + 1} of ${totalSteps}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error('Failed to load comic image:', currentImage)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="h-full flex items-center justify-center" style={{ display: currentImage ? 'none' : 'flex' }}>
          <div className="text-center p-6">
            <BookOpen className="h-16 w-16 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Page {currentStep + 1} of {totalSteps}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {resource.description || resource.content || 'Comic page content will appear here'}
            </p>
              </div>
            </div>
          </div>
        )
  }

  const renderImageContent = () => {
        return (
      <div className="aspect-square bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {resource.imageUrl ? (
          <img 
            src={resource.imageUrl} 
            alt={resource.title || resource.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                {resource.title || resource.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {resource.description || resource.content || 'Interactive image with learning annotations'}
                  </p>
                </div>
              </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    if (!resource) return null

    // Debug log to see what we're working with
    console.log('Rendering content for resource:', {
      resourceType: resource.resourceType,
      type: resource.type,
      source: resource.source,
      title: resource.title,
      name: resource.name,
      content: resource.content,
      description: resource.description,
      generatedContent: resource.generatedContent,
      rawContent: resource.rawContent,
      doc: resource.doc
    })

    // Determine the actual resource type
    const actualResourceType = resource.resourceType || resource.type || resource.source || 'content'

    switch (actualResourceType) {
      case 'slide':
        return renderSlidesContent()
      case 'video':
        return renderVideoContent()
      case 'comic':
        return renderComicContent()
      case 'image':
        return renderImageContent()
      case 'content':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 min-h-[500px]">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {resource.title || resource.name || resource.instruction}
              </h4>
            </div>
            
            {/* Try multiple content fields */}
            {(() => {
              const content = resource.generatedContent || resource.content || resource.rawContent || resource.description || resource.text
              
              if (content) {
                return (
                  <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                      {content}
                    </ReactMarkdown>
                  </div>
                )
              }
              
              // Check if there are sections
              if (resource.sections && resource.sections.length > 0) {
                return (
                  <div className="space-y-6">
                    {resource.sections.map((section, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                          {section.title || `Section ${index + 1}`}
                        </h5>
                        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                            {section.content || section.text || section.description || ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
              
              // Check if there's a doc object with content
              if (resource.doc && resource.doc.generatedContent) {
                return (
                  <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                      {resource.doc.generatedContent}
                    </ReactMarkdown>
                  </div>
                )
              }
              
              // Fallback
              return (
                <div className="text-center text-gray-600 dark:text-gray-300">
                  <p className="text-lg mb-4">No content available for this resource.</p>
                  <p className="text-sm">Please check with your teacher for the learning materials.</p>
                </div>
              )
            })()}
          </div>
        )
      case 'assessment':
        return renderAssessmentContent()
      case 'webSearch':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 min-h-[500px]">
            <div className="text-center mb-6">
              <ExternalLink className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {resource.title || resource.name || resource.instruction}
              </h4>
            </div>
            
            {/* Web search results */}
            {(() => {
              const searchResults = resource.searchResults || resource.results || resource.doc?.searchResults || resource.doc?.results
              
              if (searchResults && searchResults.length > 0) {
                return (
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {result.title}
                          </a>
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{result.url}</p>
                        <p className="text-gray-700 dark:text-gray-300">{result.snippet}</p>
                      </div>
                    ))}
                  </div>
                )
              }
              
              // Check for content in doc object
              if (resource.doc && resource.doc.generatedContent) {
                return (
                  <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                      {resource.doc.generatedContent}
                    </ReactMarkdown>
                  </div>
                )
              }
              
              // Fallback
              return (
                <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                  {resource.description || resource.content || resource.doc?.description || 'Web search results and learning materials'}
                </div>
              )
            })()}
          </div>
        )
      default:
        // Try to render as content if we don't recognize the type
        console.log('Unknown resource type, trying to render as content:', actualResourceType)
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 min-h-[500px]">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {resource.title || resource.name || resource.instruction}
              </h4>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                {resource.generatedContent || resource.content || resource.rawContent || resource.description || resource.text || resource.doc?.generatedContent || resource.doc?.content || 'Content not available'}
              </ReactMarkdown>
            </div>
          </div>
        )
    }
  }

  const renderAssessmentContent = () => {
    if (showResults && assessmentResults) {
        return (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="text-center">
            <Award className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Assessment Complete! 🎉
                  </h4>
            <div className="text-4xl font-bold text-green-600 mb-4">
              {assessmentResults.score}%
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You got {assessmentResults.correctAnswers} out of {assessmentResults.totalQuestions} questions correct!
            </p>
            
            {/* Question-by-question feedback */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {assessmentResults.progress.answers.map((answer, index) => {
                const question = resource.questions[parseInt(answer.questionId)]
                const isCorrect = answer.isCorrect
                
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        Question {parseInt(answer.questionId) + 1}
                      </span>
                      <Badge className={`${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{question.question}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-600 mr-2">Your answer:</span>
                        <span className={`font-semibold ${
                          isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {answer.answer}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-600 mr-2">Correct answer:</span>
                          <span className="font-semibold text-green-700">
                            {getCorrectAnswer(question, answer.questionId)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                )
              })}
              </div>
            
            <Button 
              className="mt-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
              onClick={onClose}
            >
              Close Assessment
            </Button>
            </div>
          </div>
        )
    }

    if (!resource.questions || resource.questions.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center">
            <Gamepad2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Assessment Question {currentStep + 1}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {resource.description || resource.content || 'Interactive quiz and assessment questions'}
            </p>
          </div>
        </div>
      )
    }

    const currentQuestion = resource.questions[currentStep]
    
    // Debug log to see the actual question structure
    console.log('Current question data:', currentQuestion)
    
    // Parse options from question text if options array is empty
    let questionText = currentQuestion?.question || currentQuestion?.text || currentQuestion?.content || ''
    let questionOptions = currentQuestion?.options || currentQuestion?.choices || currentQuestion?.answers || []
    
    // Check if it's a True/False question
    const isTrueFalse = questionText.toLowerCase().includes('true or false') || 
                       questionText.toLowerCase().includes('true/false') ||
                       questionText.toLowerCase().startsWith('true or false')
    
    // If it's True/False, add True and False options
    if (isTrueFalse && questionOptions.length === 0) {
      questionOptions = ['True', 'False']
      // Remove "True or False:" from the question text
      questionText = questionText.replace(/^true or false:\s*/i, '').trim()
    }
    // If options array is empty but question contains options (A), B), C), D)), parse them
    else if (questionOptions.length === 0 && questionText.includes('A)') && questionText.includes('B)')) {
      // Split by A), B), C), D) to extract options
      const parts = questionText.split(/([A-D]\))/)
      const cleanParts = []
      const extractedOptions = []
      
      for (let i = 0; i < parts.length; i++) {
        if (/^[A-D]\)$/.test(parts[i])) {
          // This is an option marker (A), B), etc.)
          if (i + 1 < parts.length) {
            // Get the option text (everything until next option or end)
            let optionText = parts[i + 1].trim()
            // Remove any trailing text that might be part of next option
            optionText = optionText.replace(/\s*[A-D]\)\s*.*$/, '').trim()
            extractedOptions.push(optionText)
          }
        } else if (!/^[A-D]\)$/.test(parts[i - 1])) {
          // This is not an option, keep it as question text
          cleanParts.push(parts[i])
        }
      }
      
      questionOptions = extractedOptions
      questionText = cleanParts.join('').trim()
    }
    
    console.log('Parsed options:', questionOptions)
    console.log('Clean question text:', questionText)
    
    // Determine question type properly
    let questionType = 'mcq' // Default to MCQ
    if (isTrueFalse) {
      questionType = 'true_false'
    } else if (currentQuestion?.type && currentQuestion.type !== 'mixed') {
      questionType = currentQuestion.type
    } else if (currentQuestion?.questionType) {
      questionType = currentQuestion.questionType
    } else if (questionOptions.length > 0) {
      // If we have options, it's MCQ
      questionType = 'mcq'
    } else {
      questionType = 'short_answer'
    }
    
        return (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="text-center">
                  <Gamepad2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Question {currentStep + 1} of {resource.questions.length}
                  </h4>
          
          {/* Question Type Badge */}
          <div className="mb-4">
            <Badge className="bg-blue-100 text-blue-800 text-xs font-semibold">
              {getQuestionTypeDisplay(questionType)}
            </Badge>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-left">
            {questionText}
          </p>
          
          {/* MCQ options */}
          {questionType === 'mcq' && questionOptions && questionOptions.length > 0 && (
            <div className="space-y-3">
              {questionOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full justify-start text-left transition-all duration-200 ${
                    assessmentAnswers[currentStep] === option 
                      ? 'border-green-500 bg-green-50 text-green-800 hover:bg-green-100' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAssessmentAnswer(currentStep, option)}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {typeof option === 'string' ? option : option.text || option.option || option}
                </Button>
              ))}
            </div>
          )}
          
          {/* True/False options */}
          {questionType === 'true_false' && (
                  <div className="space-y-3">
              {['True', 'False'].map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                  className={`w-full justify-start text-left transition-all duration-200 ${
                    assessmentAnswers[currentStep] === option 
                      ? 'border-green-500 bg-green-50 text-green-800 hover:bg-green-100' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAssessmentAnswer(currentStep, option)}
                >
                  <span className="font-semibold mr-3">{option === 'True' ? 'A.' : 'B.'}</span>
                  {option}
                      </Button>
                    ))}
                  </div>
          )}
          
          {/* Short Answer input */}
          {questionType === 'short_answer' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="Type your answer here..."
                  value={shortAnswerInputs[currentStep] || ''}
                  onChange={(e) => handleShortAnswerInput(currentStep, e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500 text-left">
                Write your answer in the box above. Be as detailed as needed.
                </div>
              </div>
          )}
            </div>
          </div>
        )
  }

  const isCurrentQuestionAnswered = () => {
    const currentAnswer = assessmentAnswers[currentStep]
    if (currentAnswer) return true
    
    // For short answer, check if there's text in the input
    const shortAnswerText = shortAnswerInputs[currentStep]
    return shortAnswerText && shortAnswerText.trim().length > 0
  }

  if (!resource) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[1400px] max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getItemColor(resource.subject)} flex items-center justify-center text-white`}>
                {resource.resourceType === 'slide' && <FileText className="h-6 w-6" />}
                {resource.resourceType === 'video' && <Film className="h-6 w-6" />}
                {resource.resourceType === 'comic' && <BookOpen className="h-6 w-6" />}
                {resource.resourceType === 'image' && <ImageIcon className="h-6 w-6" />}
                {resource.resourceType === 'content' && <FileText className="h-6 w-6" />}
                {resource.resourceType === 'assessment' && <Gamepad2 className="h-6 w-6" />}
                {resource.resourceType === 'webSearch' && <ExternalLink className="h-6 w-6" />}
              </div>
              <div>
                <div className="text-2xl font-bold">{resource.title || resource.name || resource.instruction || 'Learning Resource'}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {resource.subject || 'General'} • {resource.resourceType || 'content'}
                </div>
              </div>
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Progress</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Step {currentStep + 1} of {getTotalSteps()}</span>
              <span>{Math.floor(completionTime / 1000 / 60)}m {Math.floor((completionTime / 1000) % 60)}s</span>
            </div>
          </div>

          {/* Content Area - Increased height */}
          <div className="min-h-[600px] max-h-[70vh] overflow-y-auto">
            {renderContent()}
          </div>

          {/* Navigation Controls */}
          {resource.resourceType !== 'assessment' && getTotalSteps() > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="rounded-xl"
              >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNextStep}
                disabled={currentStep >= getTotalSteps() - 1}
                className="rounded-xl"
              >
                Next
                  <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-xl"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="rounded-xl"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                className="rounded-xl"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="rounded-xl"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {/* For assessments - simple next/complete logic */}
            {resource.resourceType === 'assessment' && (
              <>
                {currentStep < getTotalSteps() - 1 && (
                  <Button 
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg"
                    onClick={handleNextStep}
                    disabled={!isCurrentQuestionAnswered()}
                  >
                    Next Question
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                
                {currentStep >= getTotalSteps() - 1 && (
                  <Button 
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                    onClick={handleComplete}
                    disabled={isLoading || !isCurrentQuestionAnswered()}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Submit Assessment
                  </Button>
                )}
              </>
            )}
            
            {/* For other resources - show complete button when content is viewed */}
            {resource.resourceType !== 'assessment' && (
              <>
                {!isPlaying && !isCompleted && (
              <Button 
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                onClick={handleStartLearning}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
            )}
            
                {/* Show complete button when learning has started or content has been viewed */}
                {(isPlaying || progress > 0 || isCompleted) && (
              <Button 
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                onClick={handleComplete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Complete Learning
              </Button>
            )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LearningDialog
