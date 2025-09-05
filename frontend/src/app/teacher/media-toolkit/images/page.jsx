'use client'
import React, { useEffect, useState, useCallback } from "react"
import { Eye, Download, Trash2, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import useMediaStore from "@/store/useMediaStore"
import useAuthStore from "@/store/useAuthStore"
import { toast } from "sonner"
import { subjects } from "@/config/data"



const ImageGenerator = () => {
  const {
    images,
    generateImage,
    saveImage,
    deleteImage,
    setImagesState,
    downloadFile,
    formatTime,
    initializeImages
  } = useMediaStore()

  // Add auth store
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    topic: "",
    subject: "",
    gradeLevel: user?.grade || "", // Initialize with user's grade
    visualType: "",
    instructions: "",
    difficultyFlag: false,
    language: "English",
  })

  // Auto-set grade from user profile
  useEffect(() => {
    if (user?.grade) {
      setForm(prev => ({ ...prev, gradeLevel: user.grade }))
    }
  }, [user?.grade])

  // Initialize images data from database
  useEffect(() => {
    initializeImages()
  }, [initializeImages])

  const handleGenerate = async () => {
    try {
      await generateImage(form)
      toast.success("Image generated successfully")
    } catch (error) {
      console.error("Failed to generate image", error)
      toast.error("Failed to generate image")
    }
  }

  const handlePreview = (item) => {
    setImagesState({ previewItem: item, previewOpen: true })
  }

  const handleDelete = async (id) => {
    try {
      await deleteImage(id)
      toast.success("Image deleted successfully")
    } catch (error) {
      console.error("Failed to delete image", error)
      toast.error("Failed to delete image")
    }
  }

  const handleDownload = (url, filename = 'generated-image.png') => {
    try {
      downloadFile(url, filename)
      toast.success("Image downloaded successfully")
    } catch (error) {
      console.error("Failed to download image", error)
      toast.error("Failed to download image")
    }
  }

  const handleSave = async () => {
    if (!images.currentImage) {
      toast.error("No image to save")
      return
    }

    try {
      await saveImage({
        topic: form.topic,
        subject: form.subject,
        gradeLevel: form.gradeLevel,
        visualType: form.visualType,
        language: form.language,
        difficultyFlag: form.difficultyFlag,
        imageUrl: images.currentImage
      });
      
      // Clear the current image after saving
      setImagesState({ currentImage: null })
      
      toast.success('Image saved successfully')
    } catch (error) {
      console.error("Failed to save image", error);
      // Error handling is already done in the store
    }
  }

  const canGenerate = form.topic && form.subject && user?.grade && form.visualType

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                placeholder="e.g., Labeled diagram of the human heart"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Constraints or details to include in the image"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={form.subject} onValueChange={(value) => setForm({ ...form, subject: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mt-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Grade {user?.grade || 'Not set'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Auto-detected from your profile
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="visualType">Visual Type</Label>
              <Select value={form.visualType} onValueChange={(value) => setForm({ ...form, visualType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select visual type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div> 
              <Label htmlFor="language">Language</Label>
              <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || images.isGenerating}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:opacity-90 text-white"
          >
            {images.isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>

        {images.currentImage && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Image</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDownload(images.currentImage)} disabled={images.isSaving}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" onClick={handleSave} disabled={images.isSaving}>
                  {images.isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Image
                    </>
                  )}
                  
                </Button>
              </div>
            </div>
            
            <div className="rounded-xl border overflow-hidden">
              <img src={images.currentImage} alt="Generated" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Saved Images</h3>
          <Badge variant="secondary">{images.saved.length}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.saved.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted/50">
                <img src={item.imageUrl} alt={item.topic} className="h-full w-full object-cover" />
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => handlePreview(item)} className="rounded-full p-2 ">
                  <Eye className="h-4 w-4 cursor-pointer text-green-500" />
                </button>
                <button onClick={() => handleDownload(item.imageUrl, `${item.topic || 'image'}.png`)} className="rounded-full p-2 ">
                  <Download className="h-4 w-4 cursor-pointer text-blue-500" />
                </button>
                <button onClick={() => handleDelete(item._id)} className="rounded-full p-2 ">
                  <Trash2 className="h-4 w-4 cursor-pointer text-red-600" />
                </button>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold line-clamp-1">{item.topic}</div>
                <div className="text-xs text-muted-foreground">{item.subject} • {item.visualType}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{formatTime(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={images.previewOpen} onOpenChange={(open) => setImagesState({ previewOpen: open })}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{images.previewItem?.topic || 'Preview'}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg overflow-hidden">
            {images.previewItem && <img src={images.previewItem.imageUrl} alt={images.previewItem.topic} className="w-full h-auto" />}
          </div>
          <div className="text-sm text-muted-foreground">
            {images.previewItem?.subject} • {images.previewItem?.visualType} • {formatTime(images.previewItem?.createdAt)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ImageGenerator