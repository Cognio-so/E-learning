"use client";

import { useState, useEffect, useMemo, useCallback, lazy, Suspense, useLayoutEffect } from "react";
import {
  PenTool,
  FileText,
  Sparkles,
  Download,
  Copy,
  Save,
  Settings,
  BookOpen,
  Clock,
  Target,
  Eye,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Check,
  Brain,
  PresentationIcon,
  HelpCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { subjects, grades, contentTypes } from "@/config/data";
import useContentStore from "@/store/useContentStore";
import useAuthStore from "@/store/useAuthStore";
import useLessonStore from "@/store/useLessonStore";
import useMediaStore from "@/store/useMediaStore";

// Import remarkGfm directly to avoid the preset error
import remarkGfm from "remark-gfm";

// Lazy load heavy components
const ReactMarkdown = lazy(() => import("react-markdown"));
const PPTXViewer = lazy(() => import("@/components/pptx-viewer").then(module => ({ default: module.default })));

// Import Markdown styles directly since it's a named export
import { MarkdownStyles } from "@/components/chat/Markdown";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

// Memoized content preview component
const ContentPreview = ({ content, contentType, onCopy, onExport, onSave, isCopied, isExported, isSaved, isSaving, onGenerateSlides }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    onCopy();
  }, [content, onCopy]);

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}-content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExport();
  }, [content, contentType, onExport]);

  return (
    <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xl gap-2">
          <span className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Content Preview
          </span>
          {content && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 text-xs">
                {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="h-9 text-xs">
                {isExported ? <Check className="h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                Export
              </Button>
              <Button 
                size="sm" 
                onClick={onSave} 
                disabled={isSaving}
                className="h-9 bg-green-600 hover:bg-green-700 text-xs"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : isSaved ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              {onGenerateSlides && (
                <Button
                  size="sm"
                  onClick={onGenerateSlides}
                  disabled={isSaving}
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  <PresentationIcon className="h-4 w-4 mr-1" />
                  Create Slides
                </Button>
              )}
            </div>
          )}
        </CardTitle>
        {content && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {contentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {content ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-[90vh] sm:max-h-[1000px] lg:max-h-[1200px] xl:max-h-[1400px] 2xl:max-h-[1600px] overflow-y-auto border min-h-[600px] w-full">
            <Suspense fallback={<LoadingFallback />}>
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                  {content}
                </ReactMarkdown>
              </div>
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Generate content to see the preview here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Memoized saved content item component
const SavedContentItem = ({ item, onView, onDelete, onEdit, onAddToLesson }) => {
  const handleView = useCallback(() => {
    onView(item);
  }, [item, onView]);

  const handleDelete = useCallback(() => {
    onDelete(item._id);
  }, [item._id, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(item);
  }, [item, onEdit]);

  const handleAddToLesson = useCallback(() => {
    onAddToLesson(item);
  }, [item, onAddToLesson]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {item.topic} - Grade {item.grade}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {item.subject}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {item.contentType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'AI Generated'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleView}>
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[1200px] max-w-[95vw] max-h-[90vh] lg:max-h-[95vh] xl:max-h-[98vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">{item.topic}</DialogTitle>
                  <DialogDescription>
                    {item.subject} - Grade {item.grade} - {new Date(item.createdAt).toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">
                      Objectives: <span className="font-normal">{item.objectives || 'None provided'}</span>
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg">Generated Content</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-[40vh] overflow-y-auto">
                      <Suspense fallback={<LoadingFallback />}>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                            {item.generatedContent}
                          </ReactMarkdown>
                        </div>
                      </Suspense>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
            >
              <PenTool className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToLesson}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

const ContentGeneratorPage = () => {
  // Content store
  const {
    savedContent,
    generatedContent,
    isLoading,
    isGenerating,
    isSaving,
    error,
    fetchSavedContent,
    generateContent,
    saveContent,
    deleteContent,
    setGeneratedContent,
    clearError,
    generateSlidesFromContent,
    clearGeneratedContent,
    updateContent,
  } = useContentStore();

  // Auth store
  const { isAuthenticated, user } = useAuthStore();

  // Lesson store
  const { createLesson } = useLessonStore();

  // Local state - Remove selectedGrade, use teacher's grade automatically
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [emotionalFlags, setEmotionalFlags] = useState("");
  const [adaptiveLevel, setAdaptiveLevel] = useState(false);
  const [includeAssessment, setIncludeAssessment] = useState(false);
  const [multimediaSuggestions, setMultimediaSuggestions] = useState(false);
  const [generateSlides, setGenerateSlides] = useState(false);
  const [instructionalDepth, setInstructionalDepth] = useState("standard");
  const [contentVersion, setContentVersion] = useState("standard");
  const [contentType, setContentType] = useState("lesson-plan");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [slideCount, setSlideCount] = useState(10);
  const [presentationResult, setPresentationResult] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedContentForLesson, setSelectedContentForLesson] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: '',
    contentIds: []
  });

  // Add this useEffect to monitor state changes
  useEffect(() => {
    console.log('presentationResult state changed:', presentationResult);
  }, [presentationResult]);

  // Memoized form data - Use teacher's grade automatically
  const formData = useMemo(() => ({
          subject: selectedSubject,
          topic,
          grade: user?.grade || '', // Automatically use teacher's grade
          objectives,
          emotionalFlags,
          adaptiveLevel,
          includeAssessment,
          multimediaSuggestions,
          generateSlides,
          language,
          instructionalDepth,
          contentVersion,
          contentType,
  }), [
    selectedSubject, topic, user?.grade, objectives, emotionalFlags,
    adaptiveLevel, includeAssessment, multimediaSuggestions, generateSlides,
    language, instructionalDepth, contentVersion, contentType
  ]);

  // Memoized validation - Remove grade validation since it's automatic
  const isFormValid = useMemo(() => {
    return selectedSubject && topic && contentType && user?.grade;
  }, [selectedSubject, topic, contentType, user?.grade]);

  // Memoized content type options
  const contentTypeOptions = useMemo(() => contentTypes, []);

  // Load saved content on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedContent();
    }
  }, [isAuthenticated, fetchSavedContent]);

  // Clear generated content on component mount to ensure clean initial state
  useEffect(() => {
    clearGeneratedContent();
  }, [clearGeneratedContent]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Memoized handlers
  const handleGenerate = useCallback(async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await generateContent(formData);
      toast.success('Content generated successfully using AI!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    }
  }, [isFormValid, formData, generateContent]);

  const handleCopy = useCallback(() => {
    toast.success('Content copied to clipboard!');
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, []);

  const handleExport = useCallback(() => {
    toast.success('Content exported successfully!');
    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
    }, 2000);
  }, []);

  const handleSave = useCallback(async (e) => {
    if (!generatedContent) {
      toast.error('No content to save');
      return;
    }
    e.preventDefault(); 
    
    // Create the content data directly from current state values
    const contentData = {
        subject: selectedSubject,
      topic: topic,
        grade: user?.grade, // Automatically use teacher's grade
      objectives: objectives,
      emotionalFlags: emotionalFlags,
      adaptiveLevel: adaptiveLevel,
      includeAssessment: includeAssessment,
      multimediaSuggestions: multimediaSuggestions,
      generateSlides: generateSlides,
      language: language,
      instructionalDepth: instructionalDepth,
      contentVersion: contentVersion,
      contentType: contentType,
      generatedContent: generatedContent
    };

    // Validate required fields before saving
    if (!contentData.subject || !contentData.topic || !contentData.grade) {
      toast.error('Please fill in all required fields (Subject, Topic) before saving');
      return;
    }
    
    try {
      await saveContent(contentData);
      toast.success('Content saved successfully!');
      setIsSaved(true);
      
      // Clear generated content from store
      clearGeneratedContent();
      
      // Reset all form fields to clean state
      setTopic("");
      setObjectives("");
      setEmotionalFlags("");
      setAdaptiveLevel(false);
      setIncludeAssessment(false);
      setMultimediaSuggestions(false);
      setGenerateSlides(false);
      setInstructionalDepth("standard");
      setContentVersion("standard");
      setContentType("lesson-plan");
      setLanguage('English');
      setShowAdvanced(false);
      
      // Reset UI states
      setIsCopied(false);
      setIsExported(false);
      
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save content');
    }
  }, [
    generatedContent, 
    selectedSubject, 
        topic,
    user?.grade, // Use teacher's grade
        objectives,
        emotionalFlags,
        adaptiveLevel,
        includeAssessment,
        multimediaSuggestions,
        generateSlides,
        language,
        instructionalDepth,
        contentVersion,
    contentType, 
    saveContent,
    clearGeneratedContent
  ]);

  const handleViewContent = useCallback((content) => {
    setGeneratedContent(content.generatedContent);
  }, [setGeneratedContent]);

  const handleDeleteContent = useCallback(async (contentId) => {
    try {
      await deleteContent(contentId);
        toast.success('Content deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete content');
    }
  }, [deleteContent]);

  const handleGenerateSlides = useCallback(async () => {
    if (!generatedContent) {
      toast.error('No content to generate slides from');
      return;
    }

    setIsGeneratingSlides(true);
    try {
      const slideData = {
        content: generatedContent,
        topic: topic,
        slideCount: slideCount,
        language: language
      };

      const result = await generateSlidesFromContent(slideData);
      console.log('Slide generation result:', result); // Debug log
      
      // Handle the exact response structure you're getting
      let presentation = null;
      
      if (result && result.presentation) {
        const presData = result.presentation;
        
        // Extract URL from the exact structure you're getting
        // The URL is in task_result.url or task_info.url
        const presentationUrl = presData.task_result?.url || presData.task_info?.url;
        const status = presData.task_status || 'SUCCESS';
        
        console.log('presData:', presData); // Debug the structure
        console.log('task_result:', presData.task_result); // Debug task_result
        console.log('task_info:', presData.task_info); // Debug task_info
        console.log('Extracted URL:', presentationUrl); // Debug extracted URL
        
        if (presentationUrl) {
          presentation = {
            presentationUrl: presentationUrl,
            downloadUrl: presentationUrl,
            slideCount: slideCount,
            status: status,
            taskId: presData.task_id
          };
          
          console.log('Extracted presentation data:', presentation);
        } else {
          console.error('No URL found in response structure:', presData);
        }
      }
      
      if (presentation && presentation.presentationUrl) {
        console.log('About to set presentation result:', presentation); // Debug before setting state
        setPresentationResult(presentation);
        console.log('State should now be updated'); // Debug after setting state
        toast.success('Slides generated successfully!');
      } else {
        console.error('No valid presentation data received:', result);
        toast.error('Failed to generate slides - no valid data received');
      }
    } catch (error) {
      console.error('Slide generation error:', error);
      toast.error('Failed to generate slides');
    } finally {
      setIsGeneratingSlides(false);
    }
  }, [generatedContent, topic, slideCount, language, generateSlidesFromContent]);

  const handleEditContent = (content) => {
    setEditingContent(content);
    setEditDialogOpen(true);
  };

  const handleUpdateContent = async () => {
    try {
      if (!editingContent?._id) {
        toast.error('Invalid content ID');
        return;
      }
      
      setIsUpdating(true);
      await updateContent(editingContent._id, editingContent);
      toast.success('Content updated successfully');
      setEditDialogOpen(false);
      setEditingContent(null);
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 404) {
        toast.error('Content not found. It may have been deleted.');
      } else {
        toast.error('Failed to update content');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToLesson = (content) => {
    setSelectedContentForLesson(content);
    setLessonData(prev => ({
      ...prev,
      contentIds: [content._id],
      title: content.topic || content.title || 'New Lesson',
      description: content.description || content.content || 'Lesson created from content',
      subject: content.subject,
      grade: user?.grade || content.grade,
      lessonType: 'content',
      duration: 60,
      difficulty: 'intermediate',
      objectives: content.objectives || '',
      status: 'active'
    }));
    setLessonDialogOpen(true);
  };

  const handleCreateLesson = async () => {
    try {
      // Validate lesson data
      if (!lessonData.title || !lessonData.description || !lessonData.subject || !lessonData.grade) {
        toast.error('Please fill in all required lesson fields');
        return;
      }

      // Validate that content exists
      if (!lessonData.contentIds || lessonData.contentIds.length === 0) {
        toast.error('No content selected for lesson');
        return;
      }

      await createLesson(lessonData);
      toast.success('Lesson created successfully with content!');
      setLessonDialogOpen(false);
      setSelectedContentForLesson(null);
      setLessonData({ 
        title: '', 
        description: '', 
        grade: '', 
        subject: '', 
        contentIds: [],
        lessonType: 'content',
        duration: 60,
        difficulty: 'intermediate',
        objectives: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Lesson creation error:', error);
      toast.error('Failed to create lesson');
    }
  };

  // Memoized saved content grid
  const savedContentGrid = useMemo(() => {
    if (isLoading) {
      return <LoadingFallback />;
    }

    if (!savedContent || savedContent.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No saved content available.</p>
          <p className="text-xs text-muted-foreground mt-1">Generate and save content to view it here!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedContent.map((item) => (
          <SavedContentItem
            key={item._id}
            item={item}
            onView={handleViewContent}
            onDelete={handleDeleteContent}
            onEdit={handleEditContent}
            onAddToLesson={handleAddToLesson}
          />
        ))}
      </div>
    );
  }, [savedContent, isLoading, handleViewContent, handleDeleteContent, handleEditContent, handleAddToLesson]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <Tabs defaultValue="generate" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12 p-1 bg-white dark:bg-slate-800 shadow-sm border">
            <TabsTrigger value="generate" className="h-8 sm:h-10 text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Generate Content</span>
              <span className="sm:hidden">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="h-8 sm:h-10 text-xs sm:text-sm font-medium">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Saved Content</span>
              <span className="sm:hidden">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                AI Content Generator
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 sm:mt-2">
                Create customized teaching materials with AI assistance
              </p>
            </div>

            {/* Form Section - Full Width */}
            <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mb-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Content Configuration</CardTitle>
                <CardDescription className="text-sm">
                  Configure your lesson details to generate personalized content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Content Type Selection */}
                <div>
                  <Label className="text-sm font-medium">Content Type *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                    {contentTypeOptions.map((type) => (
                      <div
                        key={type.id}
                        className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                          contentType === type.id 
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" 
                            : "border-border hover:border-violet-300 dark:hover:border-violet-700"
                        }`}
                        onClick={() => setContentType(type.id)}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${type.color} flex items-center justify-center flex-shrink-0`}>
                            <type.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{type.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {type.description}
                            </p>
                          </div>
                          {contentType === type.id && (
                            <CheckCircle className="h-4 w-4 text-violet-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">Grade</Label>
                    <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {user?.grade === 'K' ? 'Kindergarten' : `Grade ${user?.grade}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically set to your teaching grade
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm font-medium">Lesson Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Introduction to Fractions, Photosynthesis..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives" className="text-sm font-medium">
                    Learning Objectives (Optional)
                  </Label>
                  <Textarea
                    id="objectives"
                    placeholder="Describe what students should learn..."
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Separator />

                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center h-10 w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                </Button>
                
                {showAdvanced && (
                  <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/20">
                    <div className="space-y-2">
                      <Label htmlFor="emotionalFlags" className="text-sm font-medium">
                        Emotional Considerations (Optional)
                      </Label>
                      <Input
                        id="emotionalFlags"
                        placeholder="e.g., anxiety, low confidence"
                        value={emotionalFlags}
                        onChange={(e) => setEmotionalFlags(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select language..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Additional Options</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 p-2 rounded-lg border">
                          <Checkbox
                            id="adaptiveLevel"
                            checked={adaptiveLevel}
                            onCheckedChange={setAdaptiveLevel}
                          />
                          <Label htmlFor="adaptiveLevel" className="text-sm">Adaptive Difficulty</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 rounded-lg border">
                          <Checkbox
                            id="includeAssessment"
                            checked={includeAssessment}
                            onCheckedChange={setIncludeAssessment}
                          />
                          <Label htmlFor="includeAssessment" className="text-sm">Include Assessment</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 rounded-lg border">
                          <Checkbox
                            id="multimediaSuggestions"
                            checked={multimediaSuggestions}
                            onCheckedChange={setMultimediaSuggestions}
                          />
                          <Label htmlFor="multimediaSuggestions" className="text-sm">Multimedia Suggestions</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select language..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Arabic">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instructionalDepth" className="text-sm font-medium">Instructional Depth</Label>
                        <Select value={instructionalDepth} onValueChange={setInstructionalDepth}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select depth..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Basic</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="high">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contentVersion" className="text-sm font-medium">Content Version</Label>
                        <Select value={contentVersion} onValueChange={setContentVersion}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select version..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Simplified</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="high">Enriched</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid || isGenerating}
                    className="h-11 px-4 sm:px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm sm:text-base"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">Generating</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Generate Content</span>
                        <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section - Full Width Below Form */}
            {generatedContent && (
              <ContentPreview
                content={generatedContent}
                contentType={contentType}
                onCopy={handleCopy}
                onExport={handleExport}
                onSave={handleSave}
                isCopied={isCopied}
                isExported={isExported}
                isSaved={isSaved}
                isSaving={isSaving}
                onGenerateSlides={() => setSlideDialogOpen(true)} // Always show the button
              />
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Saved Content</CardTitle>
                <CardDescription>Your previously generated and saved materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedContentGrid}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          {!presentationResult ? (
            <>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-semibold">Generate PowerPoint Slides</DialogTitle>
                <DialogDescription>
                  Create a presentation from your generated content
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slideCount" className="text-sm font-medium">Number of Slides</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slideCount"
                      type="number"
                      value={slideCount}
                      onChange={(e) => setSlideCount(parseInt(e.target.value) || 10)}
                      min={5}
                      max={30}
                      className="h-11"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Recommended: 10-15 slides for optimal presentation</p>
                </div>
                <DialogFooter className="pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSlideDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateSlides} 
                    disabled={isGeneratingSlides}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isGeneratingSlides ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Slides'
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-semibold">Presentation Ready</DialogTitle>
                <DialogDescription>
                  Your presentation has been generated successfully
                </DialogDescription>
              </DialogHeader>
              <div className="p-0">
                {/* Debug: Log the props being passed to PPTXViewer */}
                {console.log('PPTXViewer props:', {
                  presentationUrl: presentationResult.presentationUrl,
                  downloadUrl: presentationResult.downloadUrl,
                  title: `${selectedSubject} - ${topic}`,
                  slideCount: presentationResult.slideCount || slideCount,
                  status: presentationResult.status || 'SUCCESS',
                  errorMessage: presentationResult.errorMessage
                })}
                
                <Suspense fallback={<LoadingFallback />}>
                  <PPTXViewer
                    presentationUrl={presentationResult.presentationUrl}
                    downloadUrl={presentationResult.downloadUrl}
                    title={`${selectedSubject} - ${topic}`}
                    slideCount={presentationResult.slideCount || slideCount}
                    status={presentationResult.status || 'SUCCESS'}
                    errorMessage={presentationResult.errorMessage}
                    onSave={async () => {
                      try {
                        // Save to media store instead of direct API call
                        const slideData = {
                          title: `${selectedSubject} - ${topic}`,
                          topic: topic,
                          slideCount: presentationResult.slideCount || slideCount,
                          language: language,
                          presentationUrl: presentationResult.presentationUrl,
                          downloadUrl: presentationResult.downloadUrl,
                          status: presentationResult.status || 'SUCCESS',
                          errorMessage: presentationResult.errorMessage,
                          contentType: 'presentation',
                          subject: selectedSubject,
                          grade: user?.grade
                        };
                        
                        // Use the media store to save the slide
                        const { saveSlide } = useMediaStore.getState();
                        if (saveSlide) {
                          await saveSlide(slideData);
                          toast.success('Presentation saved to library');
                          setSlideDialogOpen(false);
                        } else {
                          // Fallback to direct API call
                          const response = await fetch('/api/slides', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(slideData)
                          });
                          if (response.ok) {
                            toast.success('Presentation saved to library');
                            setSlideDialogOpen(false);
                          } else {
                            toast.error('Failed to save presentation');
                          }
                        }
                      } catch (error) {
                        console.error('Save error:', error);
                        toast.error('Failed to save presentation');
                      }
                    }}
                    isSaving={false}
                  />
                </Suspense>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Modify the content details and generated content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editSubject">Subject</Label>
                <Select value={editingContent?.subject || ''} onValueChange={(value) => setEditingContent(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
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
                <Label htmlFor="editGrade">Grade</Label>
                <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user?.grade === 'K' ? 'Kindergarten' : `Grade ${user?.grade}`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cannot be changed - set to your teaching grade
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="editTopic">Topic</Label>
              <Input
                id="editTopic"
                value={editingContent?.topic || ''}
                onChange={(e) => setEditingContent(prev => ({ ...prev, topic: e.target.value }))}
                className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="editContent">Generated Content</Label>
              <Textarea
                id="editContent"
                value={editingContent?.generatedContent || ''}
                onChange={(e) => setEditingContent(prev => ({ ...prev, generatedContent: e.target.value }))}
                rows={10}
                className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContent}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Content'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Create Lesson</DialogTitle>
            <DialogDescription>Add this content to a new lesson for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lessonTitle">Lesson Title</Label>
              <Input
                id="lessonTitle"
                value={lessonData.title}
                onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="lessonDescription">Description</Label>
              <Textarea
                id="lessonDescription"
                value={lessonData.description}
                onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 resize-none"
              />
            </div>
            <div>
              <Label htmlFor="lessonSubject">Subject</Label>
              <Select value={lessonData.subject} onValueChange={(value) => setLessonData(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
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
              <Label htmlFor="lessonGrade">Grade</Label>
              <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.grade === 'K' ? 'Kindergarten' : `Grade ${user?.grade}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically set to your teaching grade
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLesson}>
             {
              isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Lesson'
              )
             } 
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default ContentGeneratorPage;