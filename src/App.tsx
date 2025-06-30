import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import StudentLogin from './components/student/StudentLogin'
import StudentDashboard from './components/student/StudentDashboard'
import FeedbackForm from './components/student/FeedbackForm'
import ThankYou from './components/student/ThankYou'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'
import ManageCourses from './components/admin/ManageCourses'
import ManageFaculty from './components/admin/ManageFaculty'
import UploadStudents from './components/admin/UploadStudents'
import ViewResults from './components/admin/ViewResults'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/feedback" element={<FeedbackForm />} />
          <Route path="/student/thankyou" element={<ThankYou />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/faculty" element={<ManageFaculty />} />
          <Route path="/admin/upload" element={<UploadStudents />} />
          <Route path="/admin/results" element={<ViewResults />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App