"use client";

import { useEffect, useMemo, useState } from "react";
import { Wand2, Upload, Plus, BarChart3, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownStyles } from "@/components/chat/Markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useMediaStore from "@/store/useMediaStore";
import useContentStore from "@/store/useContentStore";
import useAssessmentStore from "@/store/useAssessmentStore";
import useLessonStore from "@/store/useLessonStore";
import { toast } from "sonner";
import PPTXViewer from "@/components/pptx-viewer";
import { subjects, grades } from "@/config/data";

export default function TeacherLibrary() {
  const [q, setQ] = useState("");
  // removed type dropdown → using tabs instead
  const [subject, setSubject] = useState("All");
  // removed grade filter

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeType, setActiveType] = useState("All");
  const [preview, setPreview] = useState(null); // holds normalized resource { type, doc, ... }
  // Add lesson dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedResourceForLesson, setSelectedResourceForLesson] = useState(null);

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    grade: '',
    subjects: [],
    lessonType: 'mixed'
  });

  // Get all store functions
  const { 
    images, 
    comics, 
    slides, 
    webSearch, 
    deleteImage, 
    deleteComic, 
    deletePresentation, 
    deleteWebSearch,
    downloadFile,
    formatTime,
    fetchImages,
    fetchComics,
    fetchSlides,
    fetchWebSearches,
    saveImage
  } = useMediaStore();

  const {
    savedContent,
    fetchSavedContent,
    deleteContent
  } = useContentStore();

  const {
    assessments,
    fetchAssessments,
    deleteAssessment
  } = useAssessmentStore();

  // Add lesson store
  const { createLesson, addResourceToLesson, isLoading } = useLessonStore();

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      try {
        // Fetch data from all stores
        const [contentData, imageData, comicData, webData, slideData, assessmentData] = await Promise.allSettled([
          fetchSavedContent(),
          fetchImages(),
          fetchComics(),
          fetchWebSearches(),
          fetchSlides(),
          fetchAssessments(),
        ]);

        const out = [];

        // Content → Lesson/Worksheet/Video/Quiz depending on contentType
        if (contentData.status === "fulfilled" && Array.isArray(contentData.value)) {
          out.push(
            ...contentData.value.map((item) => {
              const t = normalizeType(item.contentType);
              return {
                id: item._id,
                title: item.topic || "Untitled",
                type: t,
                subject: item.subject || "All",
                grade: normalizeGrade(item.grade),
                duration: "-",
                usage: 0,
                tags: cleanTags([
                  t,
                  item.instructionalDepth,
                  item.adaptiveLevel ? "Adaptive" : null,
                  item.includeAssessment ? "Includes Assessment" : null,
                  item.multimediaSuggestions ? "Multimedia" : null,
                  item.emotionalFlags ? `Emotion: ${item.emotionalFlags}` : null,
                ]),
                createdAt: item.createdAt,
                doc: item,
                source: "content",
              };
            })
          );
        }

        // Images → Image (from media store)
        if (imageData.status === "fulfilled" && Array.isArray(imageData.value)) {
          out.push(
            ...imageData.value.map((i) => ({
              id: i._id,
              title: i.topic || "Generated Image",
              type: "Image",
              subject: i.subject || "All",
              grade: normalizeGrade(i.grade),
              duration: "-",
              usage: 0,
              tags: cleanTags([
                i.visualType,
                i.visualLevel && i.visualLevel !== "false" ? i.visualLevel : null,
                i.language,
                i.status,
              ]),
              createdAt: i.createdAt,
              doc: i,
              source: "image",
            }))
          );
        }

        // Comics → Comic (from media store)
        if (comicData.status === "fulfilled" && Array.isArray(comicData.value)) {
          out.push(
            ...comicData.value.map((c) => ({
              id: c._id,
              title: `Comic: ${truncate(c.instruction || "Story", 40)}`,
              type: "Comic",
              subject: c.subject || "All",
              grade: normalizeGrade(c.grade),
              duration: "-",
              usage: 0,
              tags: cleanTags([c.comicType, c.language]),
              createdAt: c.createdAt,
              doc: c,
              source: "comic",
            }))
          );
        }

        // Web Search → Web Search (from media store)
        if (webData.status === "fulfilled" && Array.isArray(webData.value)) {
          out.push(
            ...webData.value.map((w) => ({
              id: w._id,
              title: w.searchTopic || "Web Search",
              type: "Web Search",
              subject: w.subject || "All",
              grade: normalizeGrade(w.grade),
              duration: "-",
              usage: 0,
              tags: cleanTags([w.contentType, w.comprehensionLevel, w.language]),
              createdAt: w.createdAt,
              doc: w,
              source: "web",
            }))
          );
        }

        // Slides → Slide (from media store)
        if (slideData.status === "fulfilled" && Array.isArray(slideData.value)) {
          out.push(
            ...slideData.value.map((s) => ({
              id: s._id,
              title: s.title || s.topic || "Untitled Presentation",
              type: "Slide",
              subject: s.subject || "All",
              grade: normalizeGrade(s.grade),
              duration: s.slideCount ? `${s.slideCount} slides` : "-",
              usage: 0,
              tags: cleanTags([
                s.language,
                s.verbosity,
                s.status,
                s.stockImage ? "With Images" : "No Images"
              ]),
              createdAt: s.createdAt,
              doc: s,
              source: "slide",
            }))
          );
        }

        // Assessments → Quiz (from assessment store)
        if (assessmentData.status === "fulfilled" && Array.isArray(assessmentData.value)) {
          out.push(
            ...assessmentData.value.map((a) => ({
              id: a._id,
              title: a.title || "Assessment",
              type: "Quiz",
              subject: a.subject || "All",
              grade: normalizeGrade(a.grade),
              duration: a.duration ? `${a.duration} min` : "-",
              usage: 0,
              tags: cleanTags([a.status, Array.isArray(a.questions) ? `${a.questions.length} questions` : null]),
              createdAt: a.createdAt,
              doc: a,
              source: "assessment",
            }))
          );
        }

        if (!cancelled) {
          out.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setResources(out);
        }
      } catch (error) {
        console.error('Error loading resources:', error);
        if (!cancelled) setResources([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamic filter options from real data
  const allTypes = useMemo(
    () => ["All", ...uniq(resources.map((r) => r.type)).sort()],
    [resources]
  );
  
  // Use predefined subjects and grades from data.js
  const subjectOptions = useMemo(
    () => ["All", ...subjects.map(s => s.title)],
    []
  );
  
  // Removed gradeOptions

  // Apply text/subject filters first (removed grade filter)
  const baseFiltered = resources.filter((r) => {
    const byQ = q
      ? r.title.toLowerCase().includes(q.toLowerCase()) ||
        (Array.isArray(r.tags) && r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())))
      : true;
    const bySubject = subject === "All" ? true : r.subject === subject;
    return byQ && bySubject;
  });

  // Handle delete operations
  const handleDelete = async (resource) => {
    try {
      switch (resource.source) {
        case 'content':
          await deleteContent(resource.id);
          break;
        case 'image':
          await deleteImage(resource.id);
          break;
        case 'comic':
          await deleteComic(resource.id);
          break;
        case 'slide':
          await deletePresentation(resource.id);
          break;
        case 'web':
          await deleteWebSearch(resource.id);
          break;
        case 'assessment':
          await deleteAssessment(resource.id);
          break;
        default:
          toast.error('Delete not implemented for this resource type');
          return;
      }
      
      // Remove from local state
      setResources(prev => prev.filter(r => r.id !== resource.id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  // Handle download operations
  const handleDownload = (resource) => {
    try {
      switch (resource.source) {
        case 'image':
          if (resource.doc.imageUrl) {
            downloadFile(resource.doc.imageUrl, `${resource.title}.png`);
          } else {
            toast.error('No image URL available');
          }
          break;
        case 'slide':
          if (resource.doc.downloadUrl) {
            downloadFile(resource.doc.downloadUrl, `${resource.title}.pptx`);
          } else if (resource.doc.presentationUrl) {
            downloadFile(resource.doc.presentationUrl, `${resource.title}.pptx`);
          } else {
            toast.error('No download URL available');
          }
          break;
        case 'content':
          if (resource.doc.generatedContent) {
            const blob = new Blob([resource.doc.generatedContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            downloadFile(url, `${resource.title}.md`);
            URL.revokeObjectURL(url);
          } else {
            toast.error('No content available for download');
          }
          break;
        default:
          toast.error('Download not available for this resource type');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    }
  };

  // Add this helper function to map difficulty values
  const mapDifficultyToLessonFormat = (difficulty) => {
    const difficultyMap = {
      'Easy': 'beginner',
      'Medium': 'intermediate', 
      'Hard': 'advanced',
      'easy': 'beginner',
      'medium': 'intermediate',
      'hard': 'advanced',
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    };
    return difficultyMap[difficulty] || 'intermediate';
  };

  // Handle add to lesson
  const handleAddToLesson = (resource) => {
    setSelectedResourceForLesson(resource);
    
    // Determine the appropriate resource IDs based on resource type
    const resourceIds = {};
    const resourceType = getResourceTypeForLesson(resource.source);
    resourceIds[`${resourceType}Ids`] = [resource.id];
    
    setLessonData({
      title: resource.title || 'New Lesson',
      description: resource.description || `Lesson created from ${resource.type}: ${resource.title}`,
      subject: resource.subject,
      grade: resource.grade || user?.grade,
      lessonType: getLessonTypeFromResource(resource),
      duration: 60,
      difficulty: mapDifficultyToLessonFormat(resource.difficulty),
      objectives: resource.learningObjectives || resource.objectives || '',
      status: 'active',
      ...resourceIds // Spread the appropriate resource IDs
    });
    setLessonDialogOpen(true);
  };

  // Get lesson type from resource
  const getLessonTypeFromResource = (resource) => {
    switch (resource.source) {
      case 'assessment':
        return 'assessment';
      case 'content':
        return 'content';
      case 'image':
      case 'comic':
      case 'slide':
      case 'web':
        return 'media';
      default:
        return 'mixed';
    }
  };

  // Handle create lesson with resource
  const handleCreateLessonWithResource = async () => {
    try {
      // Validate lesson data
      if (!lessonData.title || !lessonData.description || !lessonData.subject || !lessonData.grade) {
        toast.error('Please fill in all required lesson fields');
        return;
      }

      // Validate that at least one resource is selected
      const hasResources = lessonData.contentIds?.length > 0 ||
                          lessonData.assessmentIds?.length > 0 ||
                          lessonData.imageIds?.length > 0 ||
                          lessonData.comicIds?.length > 0 ||
                          lessonData.slideIds?.length > 0 ||
                          lessonData.webSearchIds?.length > 0;

      if (!hasResources) {
        toast.error('No resource selected for lesson');
        return;
      }

      await createLesson(lessonData);
      toast.success('Lesson created successfully with resource!');
      setLessonDialogOpen(false);
      setSelectedResourceForLesson(null);
      setLessonData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        lessonType: 'mixed',
        duration: 60,
        difficulty: 'intermediate',
        objectives: '',
        status: 'active',
        contentIds: [],
        assessmentIds: [],
        imageIds: [],
        comicIds: [],
        slideIds: [],
        webSearchIds: []
      });
    } catch (error) {
      console.error('Error creating lesson with resource:', error);
      toast.error('Failed to create lesson');
    }
  };

  // Get resource type for lesson API
  const getResourceTypeForLesson = (source) => {
    switch (source) {
      case 'assessment':
        return 'assessment';
      case 'content':
        return 'content';
      case 'image':
        return 'image';
      case 'comic':
        return 'comic';
      case 'slide':
        return 'slide';
      case 'web':
        return 'webSearch';
      default:
        return 'content';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-fuchsia-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Teaching Library
            </h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
              Curate lessons, slides, images, quizzes, comics, and web findings in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white shadow-lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <UploadDialog />
            </Dialog>
          </div>
        </div>

        {/* Search + Filters */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                  <p className="text-lg text-gray-400 dark:text-white font-semibold">Search Resources</p>
                <Search className="absolute left-3 top-2/3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search resources, tags, keywords…"
                  className="pl-10 bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 h-10 w-full"
                />
              </div>
              <div className="flex items-end">
                <FilterSelect label="Subject" value={subject} onValueChange={setSubject} options={subjectOptions} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type Tabs */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 lg:p-6">
            <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
              <TabsList className="flex w-full overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-700 p-1 scrollbar-hide">
                {allTypes.map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="flex-shrink-0 px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap rounded-md transition-all duration-200"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* All */}
              <TabsContent value="All" className="mt-6">
                <TypeSection
                  list={baseFiltered}
                  loading={loading}
                  onPreview={setPreview}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onAddToLesson={handleAddToLesson}
                />
              </TabsContent>

              {/* One content grid per type */}
              {allTypes
                .filter((t) => t !== "All")
                .map((t) => (
                  <TabsContent key={t} value={t} className="mt-6">
                    <TypeSection
                      list={baseFiltered.filter((r) => r.type === t)}
                      loading={loading}
                      onPreview={setPreview}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onAddToLesson={handleAddToLesson}
                    />
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="sm:max-w-[90vw] md:max-w-[1024px] max-h-[98vh] overflow-y-auto p-0">
            <div className="relative w-full min-h-[600px] sm:min-h-[700px] h-auto">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-xl">{preview?.title}</DialogTitle>
                <DialogDescription>
                  {preview?.type} • {preview?.subject} • {preview?.grade}
                </DialogDescription>
              </DialogHeader>
              
              <div className="px-6 pb-6 space-y-6">
                {/* Use PPTXViewer for slides */}
                {preview?.source === 'slide' && (
                  <PPTXViewer
                    presentationUrl={preview?.doc?.presentationUrl}
                    downloadUrl={preview?.doc?.downloadUrl}
                    title={preview?.title}
                    slideCount={preview?.doc?.slideCount}
                    status={preview?.doc?.status || 'SUCCESS'}
                    errorMessage={preview?.doc?.errorMessage}
                    onSave={null} // No save function needed in library view
                    isSaving={false}
                  />
                )}
                
                {/* Image preview */}
                {preview?.source === 'image' && preview?.doc?.imageUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={preview.doc.imageUrl} 
                      alt={preview.title}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                {/* Comic preview */}
                {preview?.source === 'comic' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Comic Panels</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {preview?.doc?.instruction || preview?.doc?.instructions || 'Comic story'}
                      </p>
                    </div>
                    
                    {/* Comic panels grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(preview?.doc?.imageUrls || preview?.doc?.images || []).map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Panel ${index + 1}`}
                            className="w-full h-auto rounded-lg border shadow-md hover:shadow-lg transition-shadow"
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Panel {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Comic details */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {preview?.doc?.comicType || 'Story'}
                        </div>
                        <div>
                          <span className="font-medium">Language:</span> {preview?.doc?.language || 'English'}
                        </div>
                        <div>
                          <span className="font-medium">Panels:</span> {preview?.doc?.imageUrls?.length || preview?.doc?.images?.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(preview?.doc?.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Content preview */}
                {preview?.source === 'content' && preview?.doc?.generatedContent && (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                      {preview.doc.generatedContent}
                    </ReactMarkdown>
                  </div>
                )}
                
                {/* Web search results */}
                {preview?.source === 'web' && preview?.doc?.searchResults && (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                      {preview.doc.searchResults}
                    </ReactMarkdown>
                  </div>
                )}
                
                {/* Assessment preview */}
                {preview?.source === 'assessment' && preview?.doc?.questions && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Assessment Questions</h3>
                    {preview.doc.questions.map((question, index) => (
                      <div key={index} className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                        <p className="font-medium mb-3 text-lg">Question {index + 1}:</p>
                        <p className="text-base mb-4">{question.question}</p>
                        {question.options && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Options:</p>
                            <ul className="list-disc list-inside text-base space-y-1">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex}>{option}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {preview?.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add to Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Lesson with Resource</DialogTitle>
              <DialogDescription>
                Create a new lesson with: {selectedResourceForLesson?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Lesson Title *</label>
                <Input
                  value={lessonData.title}
                  onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title"
                  className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  value={lessonData.description}
                  onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter lesson description"
                  className="w-full p-2 border rounded-md bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject *</label>
                  <Select 
                    value={lessonData.subject || ''} 
                    onValueChange={(value) => setLessonData(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.title}>
                  {subject.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade *</label>
          <Input
            value={lessonData.grade}
            onChange={(e) => setLessonData(prev => ({ ...prev, grade: e.target.value }))}
            placeholder="Grade"
            className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Lesson Type</label>
          <Select value={lessonData.lessonType} onValueChange={(value) => setLessonData(prev => ({ ...prev, lessonType: value }))}>
            <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assessment">Assessment-based</SelectItem>
              <SelectItem value="content">Content-based</SelectItem>
              <SelectItem value="media">Media-based</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select 
            value={lessonData.difficulty} 
            onValueChange={(value) => setLessonData(prev => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Duration (minutes)</label>
        <Input
          type="number"
          value={lessonData.duration}
          onChange={(e) => setLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
          placeholder="60"
          className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Learning Objectives</label>
        <textarea
          value={lessonData.objectives}
          onChange={(e) => setLessonData(prev => ({ ...prev, objectives: e.target.value }))}
          placeholder="Enter learning objectives"
          className="w-full p-2 border rounded-md bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600"
          rows={2}
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleCreateLessonWithResource}
        className="bg-gradient-to-r from-pink-500 to-violet-500 text-white"
      >
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

function FilterSelect({ label, value, onValueChange, options }) {
  return (
    <div className="flex flex-col space-y-2 w-full sm:w-[200px]">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 h-10 w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TypeSection({ list, loading, onPreview, onDelete, onDownload, onAddToLesson }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-white/60 dark:bg-gray-800/60 animate-pulse">
            <CardContent className="p-4 lg:p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!list.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resources found</h3>
        <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filters.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {list.map((r) => (
        <ResourceCard 
          key={r.id} 
          r={r} 
          onPreview={() => onPreview(r)}
          onAddToLesson={() => onAddToLesson(r)}
        />
      ))}
    </div>
  );
}

function ResourceCard({ r, onPreview, onAddToLesson }) {
  return (
    <Card className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="h-32 bg-gradient-to-br from-rose-100 via-fuchsia-100 to-indigo-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative">
        <div className="absolute top-3 left-3">
          <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-medium">
            {r.type}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80 text-xs">
            {r.subject}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 lg:p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base line-clamp-2 mb-1">
              {r.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {r.duration} • {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {(r.tags || []).slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </Badge>
            ))}
            {(r.tags || []).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(r.tags || []).length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-3 w-3" />
              <span>Used {r.usage || 0} times</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 px-3"
                onClick={onPreview}
              >
                Preview
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 px-3 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                onClick={onAddToLesson}
              >
                Add to Lesson
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewBody({ r }) {
  const t = r.type;
  const doc = r.doc || {};
  if (t === "Slide") {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {doc.status ? `Status: ${doc.status}` : null}
        </div>
        <div className="flex gap-2">
          {doc.presentationUrl && (
            <Button asChild className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">
              <a href={doc.presentationUrl} target="_blank" rel="noreferrer">Open presentation</a>
            </Button>
          )}
          {doc.downloadUrl && (
            <Button variant="secondary" asChild>
              <a href={doc.downloadUrl} target="_blank" rel="noreferrer">Download</a>
            </Button>
          )}
        </div>
      </div>
    );
  }
  if (t === "Image") {
    const handleSaveImage = async () => {
      try {
        await saveImage({
          topic: r.title,
          subject: r.subject,
          gradeLevel: r.grade,
          visualType: doc.visualType || "image",
          language: doc.language || "English",
          difficultyFlag: doc.visualLevel || false,
          imageUrl: doc.imageUrl
        });
        toast.success("Image saved successfully");
      } catch (error) {
        console.error("Failed to save image:", error);
        toast.error("Failed to save image");
      }
    };

    return (
      <div className="space-y-2 h-full overflow-auto">
        {doc.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.imageUrl} alt={r.title} className="w-full rounded-lg border" />
        ) : (
          <div className="text-sm text-muted-foreground">No image available.</div>
        )}
        <div className="text-xs text-muted-foreground">{doc.instructions}</div>
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadFile(doc.imageUrl, `${r.title || 'image'}.png`)}
            className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 dark:from-blue-500/20 dark:to-blue-500/20 text-foreground dark:border-gray-600"
          >
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveImage}
            className="bg-gradient-to-r from-green-500/10 to-green-500/10 dark:from-green-500/20 dark:to-green-500/20 text-foreground dark:border-gray-600"
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
  if (t === "Comic") {
    const images = doc.images || (Array.isArray(doc.panels) ? doc.panels.map((p) => p.imageUrl) : []);
    return images.length ? (
      <div className="grid grid-cols-2 gap-2 h-full overflow-auto">
        {images.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={url} alt={`Panel ${i + 1}`} className="w-full rounded-md border" />
        ))}
      </div>
    ) : (
      <div className="text-sm text-muted-foreground">No panels available.</div>
    );
  }
  if (t === "Web Search") {
    return (
      <div className="prose dark:prose-invert h-full overflow-auto border rounded-md p-4 dark:border-gray-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
          {doc.searchResults || "No search results content."}
        </ReactMarkdown>
      </div>
    );
  }
  if (t === "Quiz") {
    const qs = Array.isArray(doc.questions) ? doc.questions : [];
    return (
      <div className="space-y-3 h-full overflow-auto">
        {qs.length ? (
          qs.map((q, i) => (
            <div key={i} className="rounded-md border p-3 dark:border-gray-600 dark:bg-gray-800">
              <div className="text-sm font-medium">{i + 1}. {q.question}</div>
              {Array.isArray(q.options) && q.options.length ? (
                <ul className="mt-2 text-sm list-disc pl-5">
                  {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                </ul>
              ) : null}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No questions found.</div>
        )}
      </div>
    );
  }
  // Default (content/lesson/worksheet/video etc.)
  return (
    <div className="prose dark:prose-invert h-full overflow-auto border rounded-md p-4 dark:border-gray-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
        {doc.generatedContent || "No preview available."}
      </ReactMarkdown>
    </div>
  );
}

function MiniUsage({ value }) {
  const v = Math.max(0, Math.min(100, (value / 200) * 100));
  return (
    <span className="inline-flex h-1 w-16 overflow-hidden rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
      <span className="bg-gradient-to-r from-pink-500 to-violet-500" style={{ width: `${v}%` }} />
    </span>
  );
}

/* helpers */
function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}
function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function normalizeType(t) {
  if (!t) return "Lesson";
  const s = String(t).toLowerCase();
  if (s.startsWith("slide") || s.startsWith("present")) return "Slide";
  if (s.includes("quiz") || s.includes("assessment")) return "Quiz";
  if (s.includes("worksheet")) return "Worksheet";
  if (s.includes("video")) return "Video";
  if (s.includes("lesson")) return "Lesson";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function normalizeGrade(g) {
  if (!g) return "";
  const s = String(g).trim();
  if (!s) return "";
  if (s.toLowerCase() === "all") return "";
  return s;
}
function cleanTags(tags) {
  return uniq(tags.map((t) => (t ? String(t) : null)));
}
function sortGrades(a, b) {
  const na = Number(a),
    nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}

/* Upload dialog (unchanged stub) */
function UploadDialog() {
  return (
    <DialogContent className="sm:max-w-[90vw] md:max-w-[1024px] max-h-[98vh] overflow-y-auto p-0">
      <div className="relative w-full min-h-[600px] sm:min-h-[700px] h-auto">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Upload resource</DialogTitle>
          <DialogDescription>Add a new item to your library.</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <LabeledInput label="Title" placeholder="e.g., Forces and Motion Lab" />
            <LabeledInput label="Type" placeholder="Lesson, Slide, Video…" />
            <LabeledInput label="Subject" placeholder="Science, Math, …" />
            <LabeledInput label="Grade" placeholder="6, 7, 8…" />
          </div>
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground dark:border-gray-600">
            Drag & drop files here, or click to browse
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" className="bg-white/70 dark:bg-gray-800/70 dark:border-gray-600 border-0 shadow-sm">
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">Upload</Button>
          </DialogFooter>
        </div>
      </div>
    </DialogContent>
  );
}
function LabeledInput({ label, placeholder }) {
  return (
    <label className="text-xs">
      <div className="mb-1 text-muted-foreground">{label}</div>
      <Input placeholder={placeholder} className="bg-white/70 dark:bg-gray-800/70 dark:border-gray-600 border-0 shadow-sm" />
    </label>
  );
}