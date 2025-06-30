import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Student APIs
export const studentLogin = (rollNumber: string, password: string) =>
  api.post('/student/login', { rollNumber, password });

export const getStudentCourses = (rollNumber: string) =>
  api.get(`/student/courses/${rollNumber}`);

export const submitFeedback = (feedbackData: any) =>
  api.post('/student/feedback', feedbackData);

// Admin APIs
export const adminLogin = (username: string, password: string) =>
  api.post('/admin/login', { username, password });

export const getFeedbackEvent = () =>
  api.get('/admin/event');

export const toggleFeedbackEvent = () =>
  api.post('/admin/event/toggle');

export const getCourses = () =>
  api.get('/admin/courses');

export const addCourse = (courseData: any) =>
  api.post('/admin/courses', courseData);

export const deleteCourse = (courseId: string) =>
  api.delete(`/admin/courses/${courseId}`);

export const getFaculty = () =>
  api.get('/admin/faculty');

export const addFaculty = (facultyData: any) =>
  api.post('/admin/faculty', facultyData);

export const deleteFaculty = (facultyId: string) =>
  api.delete(`/admin/faculty/${facultyId}`);

export const uploadStudents = (formData: FormData) =>
  api.post('/admin/students/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getFeedbackResults = () =>
  api.get('/admin/results');

export const getStudentStatus = () =>
  api.get('/admin/students/status');

export default api;