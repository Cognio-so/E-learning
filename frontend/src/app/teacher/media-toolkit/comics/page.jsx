'use client'
import React, { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CarouselWithControls } from "@/components/ui/carousel"
import { Eye, Download, Trash2, Save, Maximize2, BookOpen, Sparkles, Play, Pause, Grid, X } from "lucide-react"
import useMediaStore from "@/store/useMediaStore"
import useAuthStore from "@/store/useAuthStore" // Add this import
import { toast } from "sonner"

const ComicsCreator = () => {
  const {
    comics,
    startComicsStream,
    stopComicsStream,
    saveComic,
    deleteComic,
    setComicsState,
    downloadFile,
    formatTime,
    initializeComics // Add this
  } = useMediaStore()

  // Add auth store
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    instructions: "",
    gradeLevel: user?.grade || "", // Initialize with user's grade
    numPanels: 4,
    language: "English"
  })

  // Auto-set grade from user profile
  useEffect(() => {
    if (user?.grade) {
      setForm(prev => ({ ...prev, gradeLevel: user.grade }))
    }
  }, [user?.grade])

  // Initialize comics data from database
  useEffect(() => {
    initializeComics()
  }, [initializeComics])

  // Add debugging to see what's in the saved comics
  useEffect(() => {
    console.log('Saved comics data:', comics.saved)
  }, [comics.saved])

  const canGenerate = form.instructions && user?.grade && form.numPanels > 0

  const handleStartStream = async (e) => {
    e.preventDefault()
    
    // Add debugging
    console.log('Starting comic generation with form:', form)
    console.log('User grade:', user?.grade)
    console.log('Can generate:', canGenerate)
    
    try {
      await startComicsStream(form)
      toast.success("Comic generation started")
    } catch (error) {
      console.error("Failed to start comic generation", error)
      toast.error("Failed to start comic generation")
    } 
  }

  const handleStopStream = (e) => {
    e.preventDefault()
    try {
      stopComicsStream()
      toast.success("Comic generation stopped")
    } catch (error) {
      console.error("Failed to stop comic generation", error)
      toast.error("Failed to stop comic generation")
    }
  }

  const handleSaveComic = async () => {
    if (!comics?.images?.length) {
      toast.error('No comic to save')
      return
    }
    
    const payload = {
      instructions: form.instructions,
      subject: 'General', // You can add a subject field to the form if needed
      gradeLevel: form.gradeLevel,
      numPanels: form.numPanels,
      language: form.language,
      images: comics.images.map(i => i.url), // These are base64 data URLs
      comicType: 'educational'
    }
    
    try {
      await saveComic(payload)
      // Don't manually clear images here - the store will handle it
      toast.success('Comic saved successfully')
    } catch (error) {
      console.error('Failed to save comic', error)
      toast.error('Failed to save comic')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteComic(id)
      toast.success("Comic deleted successfully")
    } catch (error) {
      console.error("Failed to delete comic", error)
      toast.error("Failed to delete comic")
    }
  }

  const handleDownload = (url, filename = 'comic-panel.png') => {
    try {
      downloadFile(url, filename)
      toast.success("Comic downloaded successfully")
    } catch (error) {
      console.error("Failed to download comic", error)
      toast.error("Failed to download comic")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Comic Creator</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Create Educational Comics
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform educational content into engaging comic stories using AI. Perfect for visual learners and creative storytelling.
          </p>
        </div>

        {/* Generation Card */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Generate New Comic
            </CardTitle>
            <CardDescription>
              Describe your educational topic and let AI create a visual story
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Controls */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="instructions" className="text-sm font-medium">Topic & Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g., Create a fun comic explaining photosynthesis for 5th graders with plant characters"
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="gradeLevel" className="text-sm font-medium">Grade Level</Label>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Grade {user?.grade || 'Not set'}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Auto-detected from your profile
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="numPanels" className="text-sm font-medium">Panels</Label>
                    <Input
                      id="numPanels"
                      type="number"
                      min={1}
                      max={20}
                      value={form.numPanels}
                      onChange={(e) => setForm({ ...form, numPanels: parseInt(e.target.value || '0') })}
                      className="border-muted-foreground/20"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                  <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                    <SelectTrigger className="border-muted-foreground/20">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  {!comics.isGenerating ? (
                    <Button
                      onClick={handleStartStream}
                      disabled={!canGenerate}
                      className="flex-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:opacity-90 text-white shadow-lg"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Create Comic
                    </Button>
                  ) : (
                    <Button onClick={handleStopStream} variant="outline" className="flex-1" size="lg">
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Generation
                    </Button>
                  )}
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setComicsState({ liveViewerOpen: true })}
                    disabled={!comics?.images?.length}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Live Preview</Label>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleSaveComic} 
                      disabled={!comics?.images?.length}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="aspect-video rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 flex items-center justify-center overflow-hidden">
                  {comics?.images?.length > 0 ? (
                    <div className="w-full h-full p-4">
                      <CarouselWithControls
                        items={comics.images}
                        showIndicators={false}
                        renderItem={(p) => (
                          <div className="rounded-lg overflow-hidden bg-background h-full flex items-center justify-center">
                            <img src={p.url} alt={`Panel ${p.index}`} className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Comic panels will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Comics Gallery */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Your Comics Library
                  <Badge variant="secondary" className="ml-2">{comics.saved.length}</Badge>
                </CardTitle>
                <CardDescription>Manage and view your created comics</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComicsState({ viewMode: comics.viewMode === 'grid' ? 'list' : 'grid' })}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {comics.saved.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No comics yet</h3>
                <p className="text-muted-foreground mb-4">Create your first educational comic to get started</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${comics.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {comics.saved.map((item) => (
                  <div key={item._id} className="group relative">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
                      {/* Thumbnail */}
                      <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 relative">
                        {(item.imageUrls?.[0] || item.images?.[0]) ? (
                          <>
                            <img 
                              src={item.imageUrls?.[0] || item.images?.[0]} 
                              alt={item.instruction || item.instructions} 
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={() => { setComicsState({ previewComic: item, previewOpen: true }) }}
                          >
                            <Eye className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={() => item.images?.[0] && handleDownload(item.images[0], `${item.instructions.slice(0,20)}.png`)}
                          >
                            <Download className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>

                        {/* Panel Count Badge */}
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                            {item.numPanels} panels
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{item.instruction || item.instructions}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Grade {item.grade || item.gradeLevel}</span>
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Viewer Dialog */}
      <Dialog open={comics.liveViewerOpen} onOpenChange={(open) => setComicsState({ liveViewerOpen: open })}>
        <DialogContent className="w-[95vw] max-w-[1400px] h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Live Comic Viewer
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 p-6 overflow-hidden">
              {console.log('Comics images in modal:', comics?.images)}
              {console.log('Comics images length:', comics?.images?.length)}
              {console.log('Comics state:', comics)}
              {comics?.images?.length > 0 ? (
                <CarouselWithControls
                  key={`comics-${comics.images.length}-${Date.now()}`} // Add timestamp to force re-render
                  items={comics.images}
                  className="h-full"
                  renderItem={(p) => {
                    console.log('Rendering panel:', p);
                    return (
                      <div className="rounded-xl border overflow-hidden bg-white dark:bg-gray-800">
                        <img
                          src={p.url}
                          alt={`Comic Panel ${p.index}`}
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            console.error('Image failed to load:', p.url);
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', p.url);
                          }}
                        />
                      </div>
                    );
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400">Waiting for comic panels...</p>
                    <p className="text-xs text-gray-500">Images received: {comics?.images?.length || 0}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 pt-2 border-t">
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => comics?.images?.[0]?.url && handleDownload(comics.images[0].url, 'comic.png')} 
                  disabled={!comics?.images?.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download First
                </Button>
                <Button size="sm" onClick={handleSaveComic} disabled={!comics?.images?.length}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Comic
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={comics.previewOpen} onOpenChange={(open) => setComicsState({ previewOpen: open })}>
        <DialogContent className="w-[95vw] max-w-[1400px] h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Comic Preview
                  {comics.previewComic && (
                    <Badge variant="outline" className="ml-2">
                      Grade {comics.previewComic.gradeLevel}
                    </Badge>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {comics.previewComic && (
              <div className="flex-1 p-6 overflow-hidden">
                <CarouselWithControls
                  items={(comics.previewComic.imageUrls || comics.previewComic.images || []).map((url, i) => ({ url, index: i + 1 }))}
                  className="h-full"
                  renderItem={(p) => (
                    <div className="rounded-xl border overflow-hidden bg-gradient-to-br from-background to-muted/10 flex items-center justify-center h-[calc(85vh-200px)]">
                      <img 
                        src={p.url} 
                        alt={`Panel ${p.index}`} 
                        className="max-h-full max-w-full object-contain rounded-lg shadow-lg" 
                      />
                    </div>
                  )}
                />
              </div>
            )}
            
            {comics.previewComic && (
              <div className="p-6 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">{comics.previewComic.instruction || comics.previewComic.instructions}</p>
                    <p>{comics.previewComic.numPanels || (comics.previewComic.imageUrls?.length || comics.previewComic.images?.length || 0)} panels • Created {formatTime(comics.previewComic.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => comics.previewComic.images?.[0] && handleDownload(comics.previewComic.images[0], `${comics.previewComic.instructions.slice(0,20)}.png`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ComicsCreator