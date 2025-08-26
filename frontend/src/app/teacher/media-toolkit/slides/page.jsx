'use client'

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCw, Languages, Image, Type, Save, PresentationIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import PPTXViewer from "@/components/pptx-viewer"
import useMediaStore from "@/store/useMediaStore"
import useAuthStore from "@/store/useAuthStore"

const SlidesGenerator = ({ setGeneratedContent }) => {
  const {
    slides,
    generatePresentation,
    savePresentation,
    deletePresentation,
    setSlidesState,
    formatTime,
    initializeSlides
  } = useMediaStore()

  // Add auth store
  const { user } = useAuthStore()

  // Form state
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState([10])
  const [includeImages, setIncludeImages] = useState(true)
  const [language, setLanguage] = useState('ENGLISH')
  const [verbosity, setVerbosity] = useState('standard')
  const [customInstructions, setCustomInstructions] = useState('')

  useEffect(() => {
    // Initialize saved presentations from database on component mount
    initializeSlides()
  }, [initializeSlides])

  const handleGenerate = async () => {
    if (!title.trim() || !topic.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const presentationData = {
        title: title.trim(),
        topic: topic.trim(),
        slideCount: slideCount[0],
        includeImages,
        language,
        verbosity,
        customInstructions: customInstructions.trim(),
        gradeLevel: user?.grade || '', // Use teacher's grade automatically
      }

      await generatePresentation(presentationData)
      
      // Update parent component if needed
      if (slides.currentPresentation && setGeneratedContent) {
        setGeneratedContent(prev => ({ ...prev, slides: slides.currentPresentation }))
      }
    } catch (error) {
      console.error('Failed to generate presentation', error)
      toast.error('Failed to generate presentation')
    }
  }

  const handleSave = async () => {
    if (!slides.currentPresentation) {
      toast.error('No presentation to save')
      return
    }

    try {
      const presentationData = {
        title,
        topic,
        customInstructions,
        slideCount: slides.currentPresentation.slideCount,
        language,
        includeImages,
        verbosity,
        gradeLevel: user?.grade || '', // Use teacher's grade automatically
        taskId: slides.currentPresentation.taskId,
        status: slides.currentPresentation.status,
        presentationUrl: slides.currentPresentation.presentationUrl || slides.currentPresentation.url || null,
        downloadUrl: slides.currentPresentation.downloadUrl || null,
        errorMessage: slides.currentPresentation.errorMessage || null
      }

      await savePresentation(presentationData)
      
      // Clear the current presentation after saving
      setSlidesState({ currentPresentation: null })
      
      toast.success('Presentation saved successfully')
    } catch (error) {
      console.error('Failed to save presentation', error)
      toast.error('Failed to save presentation')
    }
  }

  const handleDeletePresentation = async (presentationId) => {
    try {
      await deletePresentation(presentationId)
    } catch (error) {
      console.error('Failed to delete presentation', error)
      toast.error('Failed to delete presentation')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md ring-1 ring-black/5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Presentation Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter presentation title"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="topic" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Topic/Content *
              </Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe the main topic or content for your presentation"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="slideCount" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Number of Slides
              </Label>
              <Input
                id="slideCount"
                type="number"
                min={1}
                max={50}
                value={slideCount[0]}
                onChange={(e) => setSlideCount([parseInt(e.target.value) || 1])}
                placeholder="Enter number of slides"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Generate {slideCount[0]} slides for your presentation</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENGLISH">English</SelectItem>
                    <SelectItem value="ARABIC">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Verbosity
                </Label>
                <Select value={verbosity} onValueChange={setVerbosity}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="text-heavy">Text Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Label htmlFor="includeImages" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Include Stock Images
                </Label>
              </div>
              <Switch
                id="includeImages"
                checked={includeImages}
                onCheckedChange={setIncludeImages}
              />
            </div>

            <div>
              <Label htmlFor="customInstructions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Custom Instructions
              </Label>
              <Textarea
                id="customInstructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions (e.g., 'Focus on practical examples', 'Include case studies')"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={slides.isGenerating || !title.trim() || !topic.trim()}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md h-12"
        >
          {slides.isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Generating Your Presentation...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>
      </motion.div>

      {/* Generated Content Display */}
      {slides.currentPresentation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Presentation</h3>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            
            <PPTXViewer
              presentationUrl={slides.currentPresentation.task_result?.url || slides.currentPresentation.presentationUrl || slides.currentPresentation.url}
              downloadUrl={slides.currentPresentation.task_result?.url || slides.currentPresentation.downloadUrl}
              title={title}
              slideCount={slideCount[0]}
              status={slides.currentPresentation.task_status || slides.currentPresentation.status || 'SUCCESS'}
              errorMessage={slides.currentPresentation.task_result?.error || slides.currentPresentation.errorMessage}
              onSave={handleSave}
              isSaving={slides.isSaving}
            />
          </div>
        </motion.div>
      )}

      {/* Saved Presentations */}
      {slides.saved.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <PresentationIcon className="h-5 w-5" />
            Your Presentations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.saved.map((presentation) => (
              <Card 
                key={presentation._id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{presentation.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {presentation.topic}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>{presentation.slideCount} slides</span>
                    <span>{formatTime(presentation.createdAt)}</span>
                  </div>
                  
                  {presentation.status === 'SUCCESS' && presentation.presentationUrl && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(presentation.presentationUrl, '_blank')}
                        className="flex-1 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:text-white rounded-lg shadow-md "
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePresentation(presentation._id)}
                        className="flex-1 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:text-white rounded-lg shadow-md"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SlidesGenerator