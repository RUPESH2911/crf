export interface Student {
  rollNumber: string;
  name: string;
  department: string;
  semester: number;
  courses: string[];
  hasSubmitted: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  semester: number;
  faculty: string[];
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  courses: string[];
}

export interface FeedbackQuestion {
  id: number;
  question: string;
}

export interface FeedbackSubmission {
  id: string;
  studentRoll: string;
  courseId: string;
  facultyId: string;
  ratings: number[];
  timestamp: Date;
}

export interface FeedbackEvent {
  id: string;
  title: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}