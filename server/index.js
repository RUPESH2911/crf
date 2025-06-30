import express from 'express';
import cors from 'cors';
import multer from 'multer';
import xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// In-memory data storage
let students = new Map(); // rollNumber -> student data
let courses = new Map(); // courseId -> course data
let faculty = new Map(); // facultyId -> faculty data
let feedbacks = new Map(); // feedbackId -> feedback data
let feedbackEvent = { id: '1', title: 'Feedback Collection', isActive: false };

// Initialize with sample data
const initializeData = () => {
  // Sample faculty
  const sampleFaculty = [
    { id: 'fac1', name: 'Dr. Smith', department: 'CSE', email: 'smith@college.edu' },
    { id: 'fac2', name: 'Prof. Johnson', department: 'CSE', email: 'johnson@college.edu' },
    { id: 'fac3', name: 'Dr. Williams', department: 'ECE', email: 'williams@college.edu' },
    { id: 'fac4', name: 'Prof. Brown', department: 'MECH', email: 'brown@college.edu' }
  ];

  sampleFaculty.forEach(fac => faculty.set(fac.id, fac));

  // Sample courses
  const sampleCourses = [
    {
      id: 'course1',
      code: 'CSE501',
      title: 'Software Engineering',
      department: 'CSE',
      semester: 5,
      faculty: ['fac1', 'fac2']
    },
    {
      id: 'course2',
      code: 'CSE502',
      title: 'Database Management Systems',
      department: 'CSE',
      semester: 5,
      faculty: ['fac1']
    },
    {
      id: 'course3',
      code: 'ECE401',
      title: 'Digital Signal Processing',
      department: 'ECE',
      semester: 4,
      faculty: ['fac3']
    }
  ];

  sampleCourses.forEach(course => courses.set(course.id, course));

  // Sample students
  const sampleStudents = [
    {
      rollNumber: '71812301001',
      name: 'John Doe',
      department: 'CSE',
      semester: 5,
      courses: ['course1', 'course2'],
      hasSubmitted: false,
      password: 'student123'
    },
    {
      rollNumber: '71812301002',
      name: 'Jane Smith',
      department: 'CSE',
      semester: 5,
      courses: ['course1', 'course2'],
      hasSubmitted: false,
      password: 'student123'
    }
  ];

  sampleStudents.forEach(student => students.set(student.rollNumber, student));
};

initializeData();

// Helper functions
const getFacultyNames = (facultyIds) => {
  return facultyIds.map(id => faculty.get(id)?.name).filter(Boolean);
};

const getCoursesWithFacultyNames = (courseIds) => {
  return courseIds.map(courseId => {
    const course = courses.get(courseId);
    if (!course) return null;
    return {
      ...course,
      facultyNames: getFacultyNames(course.faculty),
      hasSubmitted: false // This will be updated based on actual submissions
    };
  }).filter(Boolean);
};

// Student APIs
app.post('/api/student/login', (req, res) => {
  const { rollNumber, password } = req.body;
  
  const student = students.get(rollNumber);
  if (!student) {
    return res.json({ success: false, message: 'Student not found' });
  }
  
  if (student.password !== password) {
    return res.json({ success: false, message: 'Invalid password' });
  }
  
  res.json({ success: true, message: 'Login successful' });
});

app.get('/api/student/courses/:rollNumber', (req, res) => {
  const { rollNumber } = req.params;
  const student = students.get(rollNumber);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  const studentCourses = getCoursesWithFacultyNames(student.courses);
  
  // Check if student has submitted feedback for each course
  studentCourses.forEach(course => {
    const hasSubmitted = Array.from(feedbacks.values()).some(
      feedback => feedback.studentRoll === rollNumber && feedback.courseId === course.id
    );
    course.hasSubmitted = hasSubmitted;
  });
  
  res.json({
    student: {
      rollNumber: student.rollNumber,
      name: student.name,
      department: student.department,
      semester: student.semester
    },
    courses: studentCourses
  });
});

app.post('/api/student/feedback', (req, res) => {
  const { studentRoll, courseId, facultyName, ratings } = req.body;
  
  // Find faculty ID by name
  const facultyMember = Array.from(faculty.values()).find(f => f.name === facultyName);
  if (!facultyMember) {
    return res.status(400).json({ error: 'Faculty not found' });
  }
  
  const feedbackId = uuidv4();
  const feedback = {
    id: feedbackId,
    studentRoll,
    courseId,
    facultyId: facultyMember.id,
    facultyName,
    ratings,
    timestamp: new Date()
  };
  
  feedbacks.set(feedbackId, feedback);
  
  // Mark student as having submitted feedback
  const student = students.get(studentRoll);
  if (student) {
    student.hasSubmitted = true;
  }
  
  res.json({ success: true, message: 'Feedback submitted successfully' });
});

// Admin APIs
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'admin-token-123' });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/admin/event', (req, res) => {
  res.json(feedbackEvent);
});

app.post('/api/admin/event/toggle', (req, res) => {
  feedbackEvent.isActive = !feedbackEvent.isActive;
  res.json(feedbackEvent);
});

app.get('/api/admin/courses', (req, res) => {
  const coursesArray = Array.from(courses.values()).map(course => ({
    ...course,
    facultyNames: getFacultyNames(course.faculty)
  }));
  res.json(coursesArray);
});

app.post('/api/admin/courses', (req, res) => {
  const courseId = uuidv4();
  const course = { id: courseId, ...req.body };
  courses.set(courseId, course);
  res.json({ success: true, course });
});

app.delete('/api/admin/courses/:courseId', (req, res) => {
  const { courseId } = req.params;
  courses.delete(courseId);
  res.json({ success: true });
});

app.get('/api/admin/faculty', (req, res) => {
  const facultyArray = Array.from(faculty.values());
  res.json(facultyArray);
});

app.post('/api/admin/faculty', (req, res) => {
  const facultyId = uuidv4();
  const facultyMember = { id: facultyId, ...req.body };
  faculty.set(facultyId, facultyMember);
  res.json({ success: true, faculty: facultyMember });
});

app.delete('/api/admin/faculty/:facultyId', (req, res) => {
  const { facultyId } = req.params;
  faculty.delete(facultyId);
  res.json({ success: true });
});

app.post('/api/admin/students/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let uploadedCount = 0;
    
    data.forEach(row => {
      const student = {
        rollNumber: String(row.rollNumber).trim(),
        name: row.name,
        department: row.department,
        semester: parseInt(row.semester),
        courses: row.courses ? row.courses.split(',').map(c => c.trim()) : [],
        hasSubmitted: false,
        password: 'student123' // Default password
      };
      
      students.set(student.rollNumber, student);
      uploadedCount++;
    });

    res.json({ 
      success: true, 
      message: `${uploadedCount} students uploaded successfully` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.get('/api/admin/students/status', (req, res) => {
  const totalStudents = students.size;
  const submittedCount = Array.from(students.values()).filter(s => s.hasSubmitted).length;
  const pendingCount = totalStudents - submittedCount;
  
  res.json({
    totalStudents,
    submittedCount,
    pendingCount
  });
});

app.get('/api/admin/results', (req, res) => {
  const results = {};
  
  // Group feedbacks by course and faculty
  Array.from(feedbacks.values()).forEach(feedback => {
    if (!results[feedback.courseId]) {
      results[feedback.courseId] = {};
    }
    
    if (!results[feedback.courseId][feedback.facultyId]) {
      results[feedback.courseId][feedback.facultyId] = {
        ratings: [],
        responseCount: 0,
        averageRatings: new Array(15).fill(0),
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 }
      };
    }
    
    const courseData = results[feedback.courseId][feedback.facultyId];
    courseData.ratings.push(feedback.ratings);
    courseData.responseCount++;
    
    // Calculate running averages and distribution
    feedback.ratings.forEach((rating, index) => {
      courseData.ratingDistribution[rating]++;
    });
  });
  
  // Calculate final averages
  Object.keys(results).forEach(courseId => {
    Object.keys(results[courseId]).forEach(facultyId => {
      const data = results[courseId][facultyId];
      if (data.responseCount > 0) {
        data.averageRatings = new Array(15).fill(0).map((_, index) => {
          const sum = data.ratings.reduce((acc, ratings) => acc + ratings[index], 0);
          return sum / data.responseCount;
        });
      }
    });
  });
  
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});