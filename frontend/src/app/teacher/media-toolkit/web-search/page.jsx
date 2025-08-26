'use client'
import React, { useEffect, useState, useCallback } from "react"
import { Eye, Download, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MarkdownStyles } from "@/components/chat/Markdown"
import useMediaStore from "@/store/useMediaStore"
import useAuthStore from "@/store/useAuthStore"
import { toast } from "sonner"
import { subjects } from "@/config/data"

const WebContentCurator = () => {
  const {
    webSearch,
    performWebSearch,
    saveWebSearch,
    deleteWebSearch,
    setWebSearchState,
    downloadMarkdown,
    formatTime,
    initializeWebSearch
  } = useMediaStore()

  // Add auth store
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    topic: "",
    subject: "",
    gradeLevel: user?.grade || "", // Initialize with user's grade
    contentType: "articles",
    language: "English",
    comprehension: "intermediate",
    maxResults: 10,
  })

  // Auto-set grade from user profile
  useEffect(() => {
    if (user?.grade) {
      setForm(prev => ({ ...prev, gradeLevel: user.grade }))
    }
  }, [user?.grade])

  // Initialize web search data from database
  useEffect(() => {
    initializeWebSearch()
  }, [initializeWebSearch])

  const handleGenerate = async () => {
    try {
      await performWebSearch(form)
    } catch (error) {
      console.error('Failed to perform web search', error)
      toast.error('Failed to perform web search')
    }
  }

  const handlePreview = (item) => {
    setWebSearchState({ previewItem: item, previewOpen: true })
  }

  const handleDelete = async (id) => {
    try {
      await deleteWebSearch(id)
    } catch (error) {
      console.error('Failed to delete web search', error)
      toast.error('Failed to delete web search')
    }
  }

  const handleDownloadMd = (content, filename = 'web-search.md') => {
    try {
      downloadMarkdown(content, filename)
      toast.success('Web search downloaded successfully')
    } catch (error) {
      console.error('Failed to download web search', error)
      toast.error('Failed to download web search')
    }
  }

  const handleSave = async () => {
    if (!webSearch.currentResults) {
      toast.error('No content to save')
      return
    }

    try {
      await saveWebSearch({
        ...form,
        searchResults: webSearch.currentResults
      })
      
      // Clear the current results after saving
      setWebSearchState({ currentResults: null })
      
      toast.success('Web search saved successfully')
    } catch (error) {
      console.error('Failed to save web search', error)
      toast.error('Failed to save web search')
    }
  }

  const handleDownloadCurrent = () => {
    if (!webSearch.currentResults) {
      toast.error('No content to download')
      return
    }
    handleDownloadMd(webSearch.currentResults, `${form.topic || 'web-search'}.md`)
  }

  const canGenerate = form.topic && form.subject && user?.grade


  return (
      <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Search Topic</Label>
              <Input
                id="topic"
                placeholder="Enter educational topic to search..."
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="mt-2"
              />
            </div>

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
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={form.contentType} onValueChange={(value) => setForm({ ...form, contentType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="articles">Articles & Blogs</SelectItem>
                  <SelectItem value="videos">Educational Videos</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                   
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comprehension">Comprehension</Label>
                <Select value={form.comprehension} onValueChange={(value) => setForm({ ...form, comprehension: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Comprehension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || webSearch.isGenerating}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 text-white"
          >
            {webSearch.isGenerating ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {webSearch.currentResults && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Content</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownloadCurrent}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-xl bg-background">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                  {webSearch.currentResults}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Saved Web Searches</h3>
          <Badge variant="secondary">{webSearch.saved.length}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {webSearch.saved.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="text-sm font-semibold line-clamp-2">{item.topic}</div>
              <div className="text-xs text-muted-foreground">{item.subject} • {item.contentType}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{formatTime(item.createdAt)}</div>
              <div className="mt-3 text-xs text-muted-foreground line-clamp-4">
                {item.searchResults?.slice(0, 220)}{item.searchResults?.length > 220 ? '…' : ''}
              </div>
              <div className="mt-3 flex items-center gap-2 justify-end">
                <Button size="icon" variant="outline" onClick={() => handlePreview(item)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => handleDownloadMd(item.searchResults || '', `${item.topic || 'web-search'}.md`)}><Download className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={webSearch.previewOpen} onOpenChange={(open) => setWebSearchState({ previewOpen: open })}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[1024px] max-h-[98vh] overflow-y-auto p-0">
          <div className="relative w-full min-h-[600px] sm:min-h-[700px] h-auto">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle>{webSearch.previewItem?.topic || 'Preview'}</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                  {webSearch.previewItem?.searchResults || ''}
                </ReactMarkdown>
              </div>
              <div className="text-xs text-muted-foreground pt-4 border-t">
                {webSearch.previewItem?.subject} • {webSearch.previewItem?.contentType} • {formatTime(webSearch.previewItem?.createdAt)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WebContentCurator