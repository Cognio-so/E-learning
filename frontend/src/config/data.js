// Icons
import { PenTool, FileText, HelpCircle, PresentationIcon } from 'lucide-react';

// Subjects
export const subjects = [
    { id: 'math', title: 'Math' },
    { id: 'science', title: 'Science' },
    { id: 'history', title: 'History' },
    { id: 'english', title: 'English' },
    { id: 'social-studies', title: 'Social Studies' },
    { id: 'physics', title: 'Physics' },
    { id: 'chemistry', title: 'Chemistry' },
    { id: 'biology', title: 'Biology' },
    { id: 'geography', title: 'Geography' },
    { id: 'art', title: 'Art' },
    { id: 'physical-education', title: 'Physical Education' },
    { id: 'computer-science', title: 'Computer Science' },
];

// Grades
export const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Content Types
export const contentTypes = [
    { id: 'lesson-plan', title: 'Lesson Plan', icon: PenTool, color: 'bg-blue-500', description: 'Create a lesson plan for a specific topic' },
    { id: 'worksheet', title: 'Worksheet', icon: FileText, color: 'bg-green-500', description: 'Create a worksheet for a specific topic' },
    { id: 'quiz', title: 'Quiz', icon: HelpCircle, color: 'bg-purple-500', description: 'Create a quiz for a specific topic' },
    { id: 'presentation', title: 'Presentation', icon: PresentationIcon, color: 'bg-orange-500', description: 'Create a presentation for a specific topic' },
];

