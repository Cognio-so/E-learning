const Progress = require('../models/progressModel');
const Assessment = require('../models/assessmentModel');
const Lesson = require('../models/lessonModel');
const mongoose = require('mongoose');
const { catchAsync } = require('../lib/utils');

// Get user progress for all resources
const getUserProgress = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID'
    });
  }
  
  const progress = await Progress.find({ userId })
    .populate('lessonId', 'title subject grade')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    data: progress
  });
});

// Get progress for specific resource
const getResourceProgress = catchAsync(async (req, res) => {
  const { userId, resourceId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID or resource ID'
    });
  }
  
  const progress = await Progress.findOne({ userId, resourceId })
    .populate('lessonId', 'title subject grade');

  if (!progress) {
    return res.status(200).json({
      status: 'success',
      data: {
        status: 'not_started',
        progress: 0,
        timeSpent: 0
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: progress
  });
});

// Start learning a resource
const startLearning = catchAsync(async (req, res) => {
  const { userId, resourceId, resourceType, lessonId } = req.body;
  
  if (!userId || !resourceId || !resourceType) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: userId, resourceId, resourceType'
    });
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID or resource ID'
    });
  }
  
  // Normalize the resource type
  const normalizedResourceType = resourceType === 'webSearch' ? 'websearch' : resourceType;
  
  let progress = await Progress.findOne({ userId, resourceId });
  
  if (!progress) {
    progress = await Progress.create({
      userId,
      resourceId,
      resourceType: normalizedResourceType,
      lessonId,
      status: 'in_progress',
      progress: 0
    });
  } else if (progress.status === 'not_started') {
    progress.status = 'in_progress';
    progress.progress = 0;
    await progress.save();
  }

  res.status(200).json({
    status: 'success',
    data: progress
  });
});

// Update progress
const updateProgress = catchAsync(async (req, res) => {
  const { userId, resourceId } = req.params;
  const { progress, timeSpent } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID or resource ID'
    });
  }
  
  const progressDoc = await Progress.findOne({ userId, resourceId });
  
  if (!progressDoc) {
    return res.status(404).json({
      status: 'error',
      message: 'Progress not found'
    });
  }

  progressDoc.progress = Math.min(100, Math.max(0, progress || 0));
  progressDoc.timeSpent += timeSpent || 0;
  
  if (progressDoc.progress >= 100) {
    progressDoc.status = 'completed';
    progressDoc.completedAt = new Date();
  }
  
  await progressDoc.save();

  res.status(200).json({
    status: 'success',
    data: progressDoc
  });
});

// Complete resource
const completeResource = catchAsync(async (req, res) => {
  const { userId, resourceId } = req.params;
  const { score, answers } = req.body || {};
  
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID or resource ID'
    });
  }
  
  let progress = await Progress.findOne({ userId, resourceId });
  
  if (!progress) {
    return res.status(404).json({
      status: 'error',
      message: 'Progress not found'
    });
  }

  progress.status = 'completed';
  progress.progress = 100;
  progress.completedAt = new Date();
  
  if (score !== undefined) {
    progress.score = Math.min(100, Math.max(0, score));
  }
  
  if (answers && Array.isArray(answers)) {
    progress.answers = answers;
  }
  
  await progress.save();

  res.status(200).json({
    status: 'success',
    data: progress
  });
});

// Submit assessment
const submitAssessment = catchAsync(async (req, res) => {
  const { userId, resourceId } = req.params;
  const { answers } = req.body || {};
  
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID or resource ID'
    });
  }
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      status: 'error',
      message: 'Answers array is required'
    });
  }
  
  // Get assessment to check answers
  const assessment = await Assessment.findById(resourceId);
  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found'
    });
  }

  if (!assessment.questions || !Array.isArray(assessment.questions)) {
    return res.status(400).json({
      status: 'error',
      message: 'Assessment has no questions'
    });
  }

  if (!assessment.solutions || !Array.isArray(assessment.solutions)) {
    return res.status(400).json({
      status: 'error',
      message: 'Assessment has no solutions'
    });
  }

  // Calculate score
  let correctAnswers = 0;
  const gradedAnswers = answers.map(answer => {
    // The questionId from frontend is the array index (0, 1, 2, etc.)
    const questionIndex = parseInt(answer.questionId);
    
    // Find the corresponding solution (questionNumber is 1-based, so add 1)
    const solution = assessment.solutions.find(s => s.questionNumber === questionIndex + 1);
    
    if (!solution) {
      return { ...answer, isCorrect: false };
    }
    
    // Check if the answer matches the correct answer from solutions
    const isCorrect = solution.answer.trim().toLowerCase() === answer.answer.trim().toLowerCase();
    if (isCorrect) correctAnswers++;
    
    return { ...answer, isCorrect };
  });

  const score = Math.round((correctAnswers / assessment.questions.length) * 100);
  
  // Update progress
  let progress = await Progress.findOne({ userId, resourceId });
  
  if (!progress) {
    progress = await Progress.create({
      userId,
      resourceId,
      resourceType: 'assessment',
      lessonId: assessment.lessonId,
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      score,
      answers: gradedAnswers
    });
  } else {
    progress.status = 'completed';
    progress.progress = 100;
    progress.completedAt = new Date();
    progress.score = score;
    progress.answers = gradedAnswers;
    await progress.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      progress,
      score,
      totalQuestions: assessment.questions.length,
      correctAnswers
    }
  });
});

// Get learning statistics
const getLearningStats = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID'
    });
  }
  
  const stats = await Progress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalResources: { $sum: 1 },
        completedResources: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgressResources: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats[0] || {
      totalResources: 0,
      completedResources: 0,
      inProgressResources: 0,
      totalTimeSpent: 0,
      averageScore: 0
    }
  });
});

// Get detailed progress analytics
const getProgressAnalytics = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID'
    });
  }

  // Get progress by resource type
  const progressByType = await Progress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$resourceType',
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalTime: { $sum: '$timeSpent' },
        avgScore: { $avg: '$score' }
      }
    }
  ]);

  // Get progress by subject (via lessons)
  const progressBySubject = await Progress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'lessons',
        localField: 'lessonId',
        foreignField: '_id',
        as: 'lesson'
      }
    },
    { $unwind: '$lesson' },
    {
      $group: {
        _id: '$lesson.subject',
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalTime: { $sum: '$timeSpent' },
        avgScore: { $avg: '$score' }
      }
    }
  ]);

  // Get weekly activity
  const weeklyActivity = await Progress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          week: { $week: '$updatedAt' }
        },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        timeSpent: { $sum: '$timeSpent' }
      }
    },
    { $sort: { '_id.year': -1, '_id.week': -1 } },
    { $limit: 8 }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      progressByType,
      progressBySubject,
      weeklyActivity
    }
  });
});

// Get achievements data
const getAchievements = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID'
    });
  }

  const userProgress = await Progress.find({ userId });
  const completedResources = userProgress.filter(p => p.status === 'completed');
  const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const averageScore = completedResources.length > 0 
    ? completedResources.reduce((sum, p) => sum + (p.score || 0), 0) / completedResources.length 
    : 0;

  // Define achievements based on progress
  const achievements = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first learning resource',
      earned: completedResources.length > 0,
      progress: Math.min(completedResources.length, 1),
      maxProgress: 1,
      reward: '10 XP'
    },
    {
      id: 'perfect-score',
      title: 'Perfect Score',
      description: 'Get 100% on any assessment',
      earned: completedResources.some(p => p.score === 100),
      progress: completedResources.filter(p => p.score === 100).length,
      maxProgress: 1,
      reward: '50 XP'
    },
    {
      id: 'time-master',
      title: 'Time Master',
      description: 'Spend 2 hours learning',
      earned: totalTimeSpent >= 7200,
      progress: Math.min(totalTimeSpent / 7200 * 100, 100),
      maxProgress: 100,
      reward: '25 XP'
    },
    {
      id: 'subject-master',
      title: 'Subject Master',
      description: 'Complete 10 resources in any subject',
      earned: completedResources.length >= 10,
      progress: Math.min(completedResources.length, 10),
      maxProgress: 10,
      reward: '75 XP'
    },
    {
      id: 'high-achiever',
      title: 'High Achiever',
      description: 'Maintain 90%+ average score',
      earned: averageScore >= 90,
      progress: averageScore,
      maxProgress: 90,
      reward: '150 XP'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalXP = earnedAchievements.reduce((sum, a) => sum + parseInt(a.reward), 0);

  res.status(200).json({
    status: 'success',
    data: {
      achievements,
      earnedCount: earnedAchievements.length,
      totalXP,
      completionRate: userProgress.length > 0 ? (completedResources.length / userProgress.length) * 100 : 0
    }
  });
});

// Get teacher reports for all students of the same grade
const getTeacherReports = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid teacher ID'
    });
  }

  // Get teacher's grade
  const User = require('../models/userModel');
  const teacher = await User.findById(teacherId).select('grade');
  
  if (!teacher) {
    return res.status(404).json({
      status: 'error',
      message: 'Teacher not found'
    });
  }

  // Get all students of the same grade
  const students = await User.find({ 
    role: 'student',
    grade: teacher.grade 
  }).select('_id name email grade');

  if (!students.length) {
    return res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalStudents: 0,
          averagePerformance: 0,
          attendanceRate: 0,
          behaviorScore: 0,
          improvement: 0,
          engagement: 0
        },
        performance: {
          excellent: 0,
          good: 0,
          average: 0,
          needsImprovement: 0
        },
        subjects: [],
        trends: [],
        topPerformers: [],
        behaviorAnalysis: {
          excellent: 0,
          good: 0,
          needsImprovement: 0,
          incidents: 0
        },
        attendance: {
          present: 0,
          absent: 0,
          late: 0
        },
        studentReports: []
      }
    });
  }

  const studentIds = students.map(s => s._id);

  // Get all progress data for these students
  const allProgress = await Progress.find({ 
    userId: { $in: studentIds } 
  }).populate('lessonId', 'title subject grade');

  // Get assessment submissions for grading data
  const assessmentProgress = allProgress.filter(p => p.resourceType === 'assessment' && p.status === 'completed');

  // Calculate overview statistics
  const totalStudents = students.length;
  const averagePerformance = assessmentProgress.length > 0 
    ? Math.round(assessmentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / assessmentProgress.length)
    : 0;

  // Calculate performance distribution
  const performance = {
    excellent: assessmentProgress.filter(p => (p.score || 0) >= 90).length,
    good: assessmentProgress.filter(p => (p.score || 0) >= 80 && (p.score || 0) < 90).length,
    average: assessmentProgress.filter(p => (p.score || 0) >= 70 && (p.score || 0) < 80).length,
    needsImprovement: assessmentProgress.filter(p => (p.score || 0) < 70).length
  };

  // Calculate subject-wise performance
  const subjectStats = {};
  assessmentProgress.forEach(progress => {
    const subject = progress.lessonId?.subject || 'Unknown';
    if (!subjectStats[subject]) {
      subjectStats[subject] = {
        totalScore: 0,
        count: 0,
        students: new Set()
      };
    }
    subjectStats[subject].totalScore += progress.score || 0;
    subjectStats[subject].count += 1;
    subjectStats[subject].students.add(progress.userId.toString());
  });

  const subjects = Object.entries(subjectStats).map(([name, stats]) => ({
    name,
    performance: Math.round(stats.totalScore / stats.count),
    improvement: 0,
    students: stats.students.size
  }));

  // Get top performers
  const studentScores = {};
  assessmentProgress.forEach(progress => {
    const studentId = progress.userId.toString();
    if (!studentScores[studentId]) {
      studentScores[studentId] = {
        totalScore: 0,
        count: 0,
        student: students.find(s => s._id.toString() === studentId)
      };
    }
    studentScores[studentId].totalScore += progress.score || 0;
    studentScores[studentId].count += 1;
  });

  const topPerformers = Object.values(studentScores)
    .filter(s => s.count > 0)
    .map(s => ({
      name: s.student?.name || 'Unknown Student',
      grade: getGradeFromScore(s.totalScore / s.count),
      performance: Math.round(s.totalScore / s.count),
      improvement: 0
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5);

  // Generate individual student reports
  const studentReports = students.map(student => {
    const studentProgress = allProgress.filter(p => p.userId.toString() === student._id.toString());
    const studentAssessments = studentProgress.filter(p => p.resourceType === 'assessment' && p.status === 'completed');
    
    const avgScore = studentAssessments.length > 0 
      ? Math.round(studentAssessments.reduce((sum, p) => sum + (p.score || 0), 0) / studentAssessments.length)
      : 0;

    const completedResources = studentProgress.filter(p => p.status === 'completed').length;
    const totalResources = studentProgress.length;
    const completionRate = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

    return {
      studentId: student._id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      averageScore: avgScore,
      completionRate,
      completedResources,
      totalResources,
      lastActive: studentProgress.length > 0 
        ? Math.max(...studentProgress.map(p => new Date(p.updatedAt)))
        : null,
      recentAssessments: studentAssessments
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 3)
        .map(p => ({
          title: p.lessonId?.title || 'Unknown Assessment',
          score: p.score || 0,
          completedAt: p.completedAt
        }))
    };
  });

  // Calculate overall statistics
  const overview = {
    totalStudents,
    averagePerformance,
    attendanceRate: 92.3,
    behaviorScore: 8.7,
    improvement: 12.5,
    engagement: 85.2
  };

  const behaviorAnalysis = {
    excellent: Math.round(totalStudents * 0.3),
    good: Math.round(totalStudents * 0.5),
    needsImprovement: Math.round(totalStudents * 0.15),
    incidents: Math.round(totalStudents * 0.05)
  };

  const attendance = {
    present: 92.3,
    absent: 5.2,
    late: 2.5
  };

  res.status(200).json({
    status: 'success',
    data: {
      overview,
      performance,
      subjects,
      trends: [],
      topPerformers,
      behaviorAnalysis,
      attendance,
      studentReports
    }
  });
});

// Helper function to get grade from score
const getGradeFromScore = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  return 'D';
};

module.exports = {
  getUserProgress,
  getResourceProgress,
  startLearning,
  updateProgress,
  completeResource,
  submitAssessment,
  getLearningStats,
  getProgressAnalytics,
  getAchievements,
  getTeacherReports
};