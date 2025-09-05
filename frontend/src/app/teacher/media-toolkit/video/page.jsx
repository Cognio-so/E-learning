'use client'
import React, { useState } from "react"
import { Video, RefreshCw, Volume2, Upload, FileText, User, Play, Download, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import useMediaStore from "@/store/useMediaStore"
import useAuthStore from "@/store/useAuthStore"
import { voiceIds, talkingImages } from "@/config/data"
import PythonApi from "@/lib/PythonApi"

const VideoCreator = ({ setGeneratedContent }) => {
  const { user } = useAuthStore()
  const { setVideoState, saveVideo } = useMediaStore()

  const [videoData, setVideoData] = useState({
    pptxFile: null,
    voiceId: "",
    talkingPhotoId: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [generatedVideo, setGeneratedVideo] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      setVideoData({...videoData, pptxFile: file})
      setUploadStatus(`Selected: ${file.name}`)
    } else {
      setUploadStatus("Please select a valid PowerPoint (.pptx) file")
    }
  }

  const handleGenerate = async () => {
    if (!videoData.pptxFile || !videoData.voiceId || !videoData.talkingPhotoId) {
      setUploadStatus("Please fill in all required fields")
      return
    }

    setIsGenerating(true)
    setUploadStatus("Creating video presentation...")

    try {
      const formData = new FormData()
      formData.append('pptx_file', videoData.pptxFile)
      formData.append('voice_id', videoData.voiceId)
      formData.append('talking_photo_id', videoData.talkingPhotoId)
      formData.append('title', videoData.pptxFile.name.replace('.pptx', ''))

      const result = await PythonApi.generateVideoPresentation({
        pptx_file: videoData.pptxFile,
        voice_id: videoData.voiceId,
        talking_photo_id: videoData.talkingPhotoId,
        title: videoData.pptxFile.name.replace('.pptx', '')
      })

      if (result && result.video_url) {
        const videoResult = {
          title: result.title || "Video Presentation Created",
          videoId: result.video_id,
          videoUrl: result.video_url,
          slidesCount: result.slides_count,
          preview: "AI-generated video presentation with slides and avatar",
          gradeLevel: user?.grade || '',
          type: 'video',
          createdAt: new Date().toISOString(),
          voiceId: videoData.voiceId,
          talkingPhotoId: videoData.talkingPhotoId,
          subject: "General", // You might want to add subject selection
          language: "English"
        }

        setGeneratedVideo(videoResult)
        setVideoState({ currentVideo: videoResult })
        
        if (setGeneratedContent) {
          setGeneratedContent(prev => ({
            ...prev,
            video: videoResult
          }))
        }

        setUploadStatus("Video presentation created successfully!")
      } else {
        setUploadStatus("Error: No video URL received from server")
      }
    } catch (error) {
      console.error('Video generation error:', error)
      setUploadStatus("Error: " + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedVideo) {
      setUploadStatus("No video to save")
      return
    }

    setIsSaving(true)
    setUploadStatus("Saving video...")

    try {
      await saveVideo({
        videoUrl: generatedVideo.videoUrl,
        voiceId: generatedVideo.voiceId,
        talkingPhotoId: generatedVideo.talkingPhotoId
      })
      setUploadStatus("Video saved successfully!")
      setGeneratedVideo(null) // Clear the generated video after saving
    } catch (error) {
      console.error('Save video error:', error)
      setUploadStatus("Error saving video: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    if (generatedVideo?.videoUrl) {
      const link = document.createElement('a')
      link.href = generatedVideo.videoUrl
      link.download = `${generatedVideo.title}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            PowerPoint to Video Presentation
          </CardTitle>
          <CardDescription>
            Upload a PowerPoint presentation and convert it to an AI-generated video with avatar and voice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* PPTX File Upload */}
              <div>
                <Label htmlFor="pptx-upload" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PowerPoint File (.pptx)
                </Label>
                <Input
                  id="pptx-upload"
                  type="file"
                  accept=".pptx"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                {uploadStatus && (
                  <p className="text-sm text-muted-foreground mt-1">{uploadStatus}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Voice and Avatar Selection in single row */}
              <div className="flex gap-4">
                {/* Voice ID Selection */}
                <div className="flex-1">
                  <Label htmlFor="voice-id" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Voice Selection
                  </Label>
                  <Select value={videoData.voiceId} onValueChange={(value) => setVideoData({...videoData, voiceId: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceIds.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name} ({voice.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Talking Photo ID Selection */}
                <div className="flex-1">
                  <Label htmlFor="talking-photo-id" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Avatar Selection
                  </Label>
                  <Select value={videoData.talkingPhotoId} onValueChange={(value) => setVideoData({...videoData, talkingPhotoId: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select avatar" />
                    </SelectTrigger>
                    <SelectContent>
                      {talkingImages.map((avatar) => (
                        <SelectItem key={avatar.talking_photo_id} value={avatar.talking_photo_id}>
                          {avatar.talking_photo_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={!videoData.pptxFile || !videoData.voiceId || !videoData.talkingPhotoId || isGenerating}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Video...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Create Video Presentation
                </>
              )}
            </Button>
          </div>

          {/* Video Player Section */}
          {generatedVideo && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Generated Video
                </CardTitle>
                <CardDescription>
                  Your AI-generated video presentation is ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-black rounded-xl shadow-lg overflow-hidden">
                  <video 
                    src={generatedVideo.videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay={false}
                    muted
                    poster=""
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedVideo.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {generatedVideo.slidesCount} slides • {generatedVideo.gradeLevel} grade level
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Video
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> This will convert your PowerPoint slides into a video presentation with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>AI-generated speaker notes for each slide</li>
              <li>Professional avatar presentation</li>
              <li>High-quality voice synthesis</li>
              <li>Slides as background images</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VideoCreator