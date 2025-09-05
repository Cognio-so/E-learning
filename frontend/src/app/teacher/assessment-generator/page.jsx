"use client"    

import { useState, useEffect } from "react";
import { Plus, Eye, Trash2, Wand2, Loader2, CheckCircle, AlertCircle, Brain, BookOpen, Target, PenTool, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import useAssessmentStore from "@/store/useAssessmentStore";
import useAuthStore from "@/store/useAuthStore";
import { subjects, grades } from "@/config/data";
import useLessonStore from "@/store/useLessonStore";

export default function AssessmentBuilderPage() {
  const [activeTab, setActiveTab] = useState("assessments");
  const [form, setForm] = useState({
    title: "",
    subject: "",
    grade: "",
    duration: "30",
    description: "",
    topic: "",
    difficulty: "Medium",
    learningObjectives: "",
    numQuestions: "10",
    questionTypes: { mcq: true, true_false: false, short_answer: false },
    anxietyTriggers: "",
    customPrompt: "",
    language: "English",
  });
  const [questionDistribution, setQuestionDistribution] = useState({
    mcq: 0,
    true_false: 0,
    short_answer: 0
  });

  // Add these state variables after the existing useState declarations (around line 40)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedAssessmentForLesson, setSelectedAssessmentForLesson] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewingAssessment, setPreviewingAssessment] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: '',
    assessmentIds: []
  });

  // Get store state and actions
  const {
    assessments,
    generatedQuestions,
    generatedSolutions,
    rawContent,
    isLoading,
    isGenerating,
    isSaving,
    error,
    fetchAssessments,
    generateAssessment,
    createAssessment,
    deleteAssessment,
    clearGeneratedContent,
    clearError,
    updateAssessment
  } = useAssessmentStore();

  // Get user from auth store
  const { user } = useAuthStore();

  const { createLesson } = useLessonStore();

  // Set teacher's grade automatically when component mounts
  useEffect(() => {
    if (user?.grade && !form.grade) {
      setForm(prev => ({ ...prev, grade: user.grade }));
    }
  }, [user?.grade, form.grade]);

  // Fetch assessments on component mount and when activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    if (activeTab === "assessments") {
      console.log('Fetching assessments...');
      fetchAssessments().catch(err => {
        console.error('Failed to fetch assessments:', err);
      });
    }
  }, [activeTab, fetchAssessments]);

  // Handle error display
  useEffect(() => {
    if (error) {
      console.log('Displaying error:', error);
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Debug: Log assessments when they change
  useEffect(() => {
    console.log('Assessments updated:', assessments);
  }, [assessments]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id) => {
    setForm(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [id]: !prev.questionTypes[id]
      }
    }));
  };

  const handleDistributionChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setQuestionDistribution(prev => ({
      ...prev,
      [type]: numValue
    }));
    
    // Update total questions
    const total = Object.entries({...questionDistribution, [type]: numValue})
      .reduce((sum, [_, count]) => sum + count, 0);
    
    setForm(prev => ({
      ...prev,
      numQuestions: total.toString()
    }));
  };

  const validateForm = () => {
    if (!form.title || !form.subject || !form.topic) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    const hasQuestionType = Object.values(form.questionTypes).some(type => type);
    if (!hasQuestionType) {
      toast.error("Please select at least one question type");
      return false;
    }
    
    return true;
  };

  // Update the handleGenerate function to better process the response
  const handleGenerate = async () => {
    if (!form.title || !form.subject || !form.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const assessmentData = {
        ...form,
        grade: user?.grade || form.grade, // Use teacher's grade automatically
        numQuestions: form.numQuestions
      };

      console.log('Sending assessment data:', assessmentData);
      const result = await generateAssessment(assessmentData);
      
      // Enhanced question validation and logging
      if (result && result.questions) {
        console.log('Generated questions result:', result);
        console.log('Questions count:', result.questions.length);
        console.log('Questions structure:', result.questions);
        
        // Validate question structure
        const validQuestions = result.questions.filter(q => 
          q && typeof q === 'object' && q.question && q.question.trim() !== ''
        );
        
        if (validQuestions.length === 0) {
          toast.error('Generated questions have invalid structure. Please try again.');
          return;
        }
        
        toast.success(`Generated ${validQuestions.length} valid questions successfully using AI!`);
      } else {
        toast.error('No questions were generated. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate questions');
    }
  };

  const handleSave = async (status) => {
    // Enhanced validation before saving
    const questionsToSave = generatedQuestions || [];
    const validQuestions = questionsToSave.filter(q => 
      q && typeof q === 'object' && q.question && q.question.trim() !== ''
    );
    
    if (validQuestions.length === 0) {
      toast.error('No valid questions to save. Please generate questions first.');
      return;
    }

    try {
      await createAssessment({
        ...form,
        grade: user?.grade || form.grade, // Use teacher's grade automatically
        status,
        questions: validQuestions, // Use validated questions
        solutions: generatedSolutions || [],
        rawContent: rawContent || '',
      });

      toast.success(`Assessment ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
      setActiveTab("assessments");
      
      // Reset form
      setForm({
        title: "",
        subject: "",
        grade: user?.grade || "", 
        duration: "30",
        description: "",
        topic: "",
        difficulty: "Medium",
        learningObjectives: "",
        numQuestions: "10",
        questionTypes: { mcq: true, true_false: false, short_answer: false },
        anxietyTriggers: "",
        customPrompt: "",
        language: "English",
      });
      setQuestionDistribution({
        mcq: 0,
        true_false: 0,
        short_answer: 0
      });
      clearGeneratedContent();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save assessment');
    }
  };
  
  const handleDelete = async (assessmentId) => {
    try {
      await deleteAssessment(assessmentId);
      toast.success('Assessment deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const handlePreviewAssessment = (assessment) => {
    setPreviewingAssessment(assessment);
    setPreviewDialogOpen(true);
  };

  // Update the handleEditAssessment function to properly populate all fields
  const handleEditAssessment = (assessment) => {
    // Ensure we're using the correct subject structure and populate all fields
    const assessmentToEdit = {
      ...assessment,
      _id: assessment._id,
      title: assessment.title || '',
      subject: assessment.subject || '', // Ensure subject is a string
      grade: user?.grade || assessment.grade || '', // Use teacher's grade
      topic: assessment.topic || '',
      description: assessment.description || '',
      duration: assessment.duration || '30',
      difficulty: assessment.difficulty || 'Medium',
      learningObjectives: assessment.learningObjectives || '',
      numQuestions: assessment.numQuestions || '10',
      questionTypes: assessment.questionTypes || { mcq: true, true_false: false, short_answer: false },
      anxietyTriggers: assessment.anxietyTriggers || '',
      customPrompt: assessment.customPrompt || '',
      language: assessment.language || 'English',
      questions: assessment.questions || [],
      solutions: assessment.solutions || [],
      status: assessment.status || 'draft'
    };
    
    console.log('Editing assessment:', assessmentToEdit);
    setEditingAssessment(assessmentToEdit);
    setEditDialogOpen(true);
  };

  // Update the edit dialog to show more fields and content
  const handleUpdateAssessment = async () => {
    try {
      if (!editingAssessment?._id) {
        toast.error('Invalid assessment ID');
        return;
      }

      // Validate required fields
      if (!editingAssessment.title || !editingAssessment.subject || !editingAssessment.topic) {
        toast.error('Please fill in all required fields (Title, Subject, Topic)');
        return;
      }
      
      console.log('Updating assessment:', editingAssessment);
      
      await updateAssessment(editingAssessment._id, editingAssessment);
      toast.success('Assessment updated successfully');
      setEditDialogOpen(false);
      setEditingAssessment(null);
      
      // Refresh the assessments list
      fetchAssessments();
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 404) {
        toast.error('Assessment not found. It may have been deleted.');
      } else {
        toast.error('Failed to update assessment');
      }
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

  const handleAddToLesson = (assessment) => {
    setSelectedAssessmentForLesson(assessment);
    setLessonData(prev => ({
      ...prev,
      assessmentIds: [assessment._id],
      title: assessment.title || 'New Assessment Lesson',
      description: assessment.description || `Lesson created from assessment: ${assessment.title}`,
      subject: assessment.subject,
      grade: user?.grade || assessment.grade,
      lessonType: 'assessment',
      duration: parseInt(assessment.duration) || 60,
      difficulty: mapDifficultyToLessonFormat(assessment.difficulty),
      objectives: assessment.learningObjectives || '',
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

      // Validate that assessment exists
      if (!lessonData.assessmentIds || lessonData.assessmentIds.length === 0) {
        toast.error('No assessment selected for lesson');
        return;
      }

      await createLesson(lessonData);
      toast.success('Lesson created successfully with assessment!');
      setLessonDialogOpen(false);
      setSelectedAssessmentForLesson(null);
      setLessonData({ 
        title: '', 
        description: '', 
        grade: '', 
        subject: '', 
        assessmentIds: [],
        lessonType: 'assessment',
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

  // Update the getQuestionTypeDisplay function to handle more cases
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header Section - Made responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Assessment Builder
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Create, manage, and deploy AI-powered assessments with Python backend integration.
            </p>
            {user?.grade && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Teaching Grade: {user.grade === 'K' ? 'Kindergarten' : `Grade ${user.grade}`}
              </p>
            )}
          </div>
          <Button 
            onClick={() => setActiveTab("builder")} 
            className="gap-2 h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Assessment</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12 p-1 bg-white dark:bg-slate-800 shadow-sm border">
            <TabsTrigger value="builder" className="h-8 sm:h-10 text-xs sm:text-sm font-medium">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">AI Assessment Builder</span>
              <span className="sm:hidden">Builder</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="h-8 sm:h-10 text-xs sm:text-sm font-medium">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Assessments ({assessments.length})</span>
              <span className="sm:hidden">Assessments ({assessments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4 sm:space-y-6">
            {/* Basic Information Card */}
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  1. Basic Information
                </CardTitle>
                <CardDescription>Set the core details for your AI-generated assessment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Assessment Title *</Label>
                    <Input 
                      id="title" 
                      value={form.title} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Algebra Basics Quiz" 
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                    <Select value={form.subject} onValueChange={(v) => handleSelectChange('subject', v)}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">Grade Level</Label>
                    <div className="h-10 sm:h-11 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {user?.grade === 'K' ? 'Kindergarten' : `Grade ${user?.grade}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically set to your teaching grade
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes) *</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      value={form.duration} 
                      onChange={handleInputChange} 
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description / Instructions</Label>
                  <Textarea 
                    id="description" 
                    value={form.description} 
                    onChange={handleInputChange} 
                    placeholder="Explain the rules, topics covered, etc." 
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Generation Settings Card */}
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                  2. AI Generation Settings
                </CardTitle>
                <CardDescription>Provide details for the AI to generate questions using advanced Python backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">Primary Topic *</Label>
                    <Input 
                      id="topic" 
                      value={form.topic} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Photosynthesis" 
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                    <Select value={form.difficulty} onValueChange={(v) => handleSelectChange('difficulty', v)}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learningObjectives" className="text-sm font-medium">Learning Objectives</Label>
                  <Textarea 
                    id="learningObjectives" 
                    value={form.learningObjectives} 
                    onChange={handleInputChange} 
                    placeholder="What should students know after taking this assessment?" 
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Question Types *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                      <Checkbox 
                        id="mcq" 
                        checked={form.questionTypes.mcq} 
                        onCheckedChange={() => handleCheckboxChange('mcq')} 
                      />
                      <Label htmlFor="mcq" className="text-sm">Multiple Choice</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                      <Checkbox 
                        id="true_false" 
                        checked={form.questionTypes.true_false} 
                        onCheckedChange={() => handleCheckboxChange('true_false')} 
                      />
                      <Label htmlFor="true_false" className="text-sm">True/False</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background sm:col-span-2 lg:col-span-1">
                      <Checkbox 
                        id="short_answer" 
                        checked={form.questionTypes.short_answer} 
                        onCheckedChange={() => handleCheckboxChange('short_answer')} 
                      />
                      <Label htmlFor="short_answer" className="text-sm">Short Answer</Label>
                    </div>
                  </div>
                </div>

                {Object.entries(form.questionTypes).some(([_, enabled]) => enabled) && (
                  <div className="mt-4 space-y-3">
                    <Label className="text-sm font-medium">Question Distribution</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {form.questionTypes.mcq && (
                        <div className="space-y-2">
                          <Label htmlFor="mcq-count" className="text-xs">Multiple Choice</Label>
                          <Input
                            id="mcq-count"
                            type="number"
                            min="0"
                            value={questionDistribution.mcq}
                            onChange={(e) => handleDistributionChange('mcq', e.target.value)}
                            className="h-9"
                          />
                        </div>
                      )}
                      {form.questionTypes.true_false && (
                        <div className="space-y-2">
                          <Label htmlFor="tf-count" className="text-xs">True/False</Label>
                          <Input
                            id="tf-count"
                            type="number"
                            min="0"
                            value={questionDistribution.true_false}
                            onChange={(e) => handleDistributionChange('true_false', e.target.value)}
                            className="h-9"
                          />
                        </div>
                      )}
                      {form.questionTypes.short_answer && (
                        <div className="space-y-2">
                          <Label htmlFor="sa-count" className="text-xs">Short Answer</Label>
                          <Input
                            id="sa-count"
                            type="number"
                            min="0"
                            value={questionDistribution.short_answer}
                            onChange={(e) => handleDistributionChange('short_answer', e.target.value)}
                            className="h-9"
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total questions: {Object.values(questionDistribution).reduce((sum, count) => sum + count, 0)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numQuestions" className="text-sm font-medium">Number of Questions</Label>
                    <Input 
                      id="numQuestions" 
                      type="number" 
                      value={form.numQuestions} 
                      onChange={handleInputChange} 
                      min="1"
                      max="50"
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anxietyTriggers" className="text-sm font-medium">Anxiety Considerations</Label>
                    <Input 
                      id="anxietyTriggers" 
                      value={form.anxietyTriggers} 
                      onChange={handleInputChange} 
                      placeholder="e.g., time pressure, complex wording" 
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrompt" className="text-sm font-medium"> Instructions (Optional)</Label>
                  <Textarea 
                    id="customPrompt" 
                    value={form.customPrompt} 
                    onChange={handleInputChange} 
                    placeholder="Any specific requirements or styles for the questions..." 
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                  <Select value={form.language} onValueChange={(v) => handleSelectChange('language', v)}>
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Generating Questions with AI...</span>
                      <span className="sm:hidden">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Generate Questions with AI</span>
                      <span className="sm:hidden">Generate</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Questions Review Card */}
            {Array.isArray(generatedQuestions) && generatedQuestions.length > 0 && (
              <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                    3. Review AI-Generated Questions ({generatedQuestions.length} Questions)
                  </CardTitle>
                  <CardDescription>Review the questions generated by our AI and save the assessment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Array.isArray(generatedQuestions) && generatedQuestions.map((q, index) => {
                      // Determine question type from various possible sources
                      const questionType = q.type || q.questionType || 'mixed';
                      const questionText = q.question || q.text || q.content || '';
                      const questionOptions = q.options || q.choices || q.answers || [];
                      const questionPoints = q.points || q.score || 1;
                      
                      return (
                        <div key={index} className="p-3 sm:p-4 border rounded-lg bg-muted/30">
                          <p className="font-semibold text-sm sm:text-base">
                            {index + 1}. ({getQuestionTypeDisplay(questionType)}) {questionText}
                          </p>
                          
                          {/* Display options for MCQ questions */}
                          {questionOptions && questionOptions.length > 0 && (
                            <ul className="list-disc pl-4 sm:pl-5 mt-2 space-y-1 text-sm">
                              {questionOptions.map((opt, i) => (
                                <li key={i} className="text-muted-foreground">
                                  {typeof opt === 'string' ? opt : opt.text || opt.option || opt}
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {/* Display points */}
                          <p className="text-xs text-muted-foreground mt-1">Points: {questionPoints}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {Array.isArray(generatedSolutions) && generatedSolutions.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg mb-3">Answer Key ({generatedSolutions.length} Solutions)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {generatedSolutions.map((solution, index) => (
                            <div key={index} className="p-2 text-xs sm:text-sm bg-green-50 dark:bg-green-950/30 rounded border">
                              <span className="font-semibold">{solution.questionNumber}.</span>{" "}
                              <span className="text-green-700 dark:text-green-300">{solution.answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator className="my-6" />
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button 
                      onClick={() => handleSave('draft')} 
                      disabled={isSaving}
                      className="flex-1 h-10 sm:h-12"
                      variant="outline"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save as Draft
                    </Button>
                    <Button 
                      onClick={() => handleSave('active')} 
                      disabled={isSaving}
                      className="flex-1 h-10 sm:h-12 bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Publish Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Assessments List */}
          <TabsContent value="assessments" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2 text-sm text-muted-foreground">Loading assessments...</p>
              </div>
            ) : assessments && assessments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assessments.map((assessment) => (
                  <Card key={assessment._id} className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-lg sm:text-xl">{assessment.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{assessment.subject}</Badge>
                            <Badge variant="outline" className="text-xs">{assessment.grade}</Badge>
                            <Badge variant={assessment.status === 'active' ? 'default' : assessment.status === 'draft' ? 'secondary' : 'outline'} className="text-xs">
                              {assessment.status}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              {assessment.questions?.length || 0} questions
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewAssessment(assessment)}
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAssessment(assessment)}
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <PenTool className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddToLesson(assessment)}
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => handleDelete(assessment._id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No assessments available.</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first assessment to get started!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Assessment Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Assessment</DialogTitle>
              <DialogDescription>Modify the assessment details and content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTitle">Title *</Label>
                  <Input
                    id="editTitle"
                    value={editingAssessment?.title || ''}
                    onChange={(e) => setEditingAssessment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Assessment title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="editSubject">Subject *</Label>
                  <Select value={editingAssessment?.subject || ''} onValueChange={(value) => setEditingAssessment(prev => ({ ...prev, subject: value }))}>
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
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTopic">Topic *</Label>
                  <Input
                    id="editTopic"
                    value={editingAssessment?.topic || ''}
                    onChange={(e) => setEditingAssessment(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Primary topic"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="editGrade">Grade</Label>
                  <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex items-center mt-2">
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
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingAssessment?.description || ''}
                  onChange={(e) => setEditingAssessment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Assessment description"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDifficulty">Difficulty</Label>
                  <Select value={editingAssessment?.difficulty || 'Medium'} onValueChange={(value) => setEditingAssessment(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDuration">Duration (minutes)</Label>
                  <Input
                    id="editDuration"
                    type="number"
                    value={editingAssessment?.duration || '30'}
                    onChange={(e) => setEditingAssessment(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editLearningObjectives">Learning Objectives</Label>
                <Textarea
                  id="editLearningObjectives"
                  value={editingAssessment?.learningObjectives || ''}
                  onChange={(e) => setEditingAssessment(prev => ({ ...prev, learningObjectives: e.target.value }))}
                  placeholder="What should students learn?"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="editAnxietyTriggers">Anxiety Considerations</Label>
                <Input
                  id="editAnxietyTriggers"
                  value={editingAssessment?.anxietyTriggers || ''}
                  onChange={(e) => setEditingAssessment(prev => ({ ...prev, anxietyTriggers: e.target.value }))}
                  placeholder="e.g., time pressure, complex wording"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="editCustomPrompt"> Instructions</Label>
                <Textarea
                  id="editCustomPrompt"
                  value={editingAssessment?.customPrompt || ''}
                  onChange={(e) => setEditingAssessment(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Any specific requirements..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="editLanguage">Language</Label>
                <Select value={editingAssessment?.language || 'English'} onValueChange={(value) => setEditingAssessment(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show questions count */}
              {editingAssessment?.questions && editingAssessment.questions.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    This assessment has {editingAssessment.questions.length} questions
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Questions and answers cannot be edited here. Use the assessment builder to regenerate questions.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAssessment}>
                {
                  isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Assessment'
                  )
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add to Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Lesson</DialogTitle>
              <DialogDescription>Add this assessment to a new lesson for students</DialogDescription>
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
                  className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="lessonSubject">Subject</Label>
                <Select value={lessonData.subject} onValueChange={(value) => setLessonData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue placeholder="Select subject" className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id} className="mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">{subject.title}</SelectItem>
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

        {/* Preview Assessment Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-[1200px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{previewingAssessment?.title}</DialogTitle>
              <DialogDescription>
                {previewingAssessment?.subject} - Grade {previewingAssessment?.grade} - {previewingAssessment?.createdAt ? new Date(previewingAssessment.createdAt).toLocaleDateString() : 'N/A'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">
                  Topic: <span className="font-normal">{previewingAssessment?.topic || 'None provided'}</span>
                </p>
                <p className="font-semibold mt-2">
                  Learning Objectives: <span className="font-normal">{previewingAssessment?.learningObjectives || 'None provided'}</span>
                </p>
                <p className="font-semibold mt-2">
                  Difficulty: <span className="font-normal">{previewingAssessment?.difficulty || 'Medium'}</span>
                </p>
                <p className="font-semibold mt-2">
                  Duration: <span className="font-normal">{previewingAssessment?.duration || '30'} minutes</span>
                </p>
                <p className="font-semibold mt-2">
                  Status: <span className="font-normal">{previewingAssessment?.status || 'Draft'}</span>
                </p>
                <p className="font-semibold mt-2">
                  Created At: <span className="font-normal">{previewingAssessment?.createdAt ? new Date(previewingAssessment.createdAt).toLocaleDateString() : 'N/A'}</span>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-3">Description</h4>
                <p className="text-sm text-muted-foreground">{previewingAssessment?.description || 'No description provided.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-3">Questions</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {previewingAssessment?.questions && previewingAssessment.questions.length > 0 ? (
                    previewingAssessment.questions.map((q, index) => (
                      <div key={index} className="p-3 sm:p-4 border rounded-lg bg-muted/30">
                        <p className="font-semibold text-sm sm:text-base">
                          {index + 1}. ({getQuestionTypeDisplay(q.type || q.questionType || 'mixed')}) {q.question || q.text || q.content || 'No question text provided.'}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <ul className="list-disc pl-4 sm:pl-5 mt-2 space-y-1 text-sm">
                            {q.options.map((opt, i) => (
                              <li key={i} className="text-muted-foreground">{typeof opt === 'string' ? opt : opt.text || opt.option || opt}</li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Points: {q.points || q.score || 1}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No questions generated for this assessment.</p>
                  )}
                </div>
              </div>
              {previewingAssessment?.solutions && previewingAssessment.solutions.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg mb-3">Answer Key ({previewingAssessment.solutions.length} Solutions)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {previewingAssessment.solutions.map((solution, index) => (
                        <div key={index} className="p-2 text-xs sm:text-sm bg-green-50 dark:bg-green-950/30 rounded border">
                          <span className="font-semibold">{solution.questionNumber}.</span>{" "}
                          <span className="text-green-700 dark:text-green-300">{solution.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPreviewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}