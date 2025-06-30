import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStudentCourses, getFeedbackEvent } from '../../utils/api';
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [eventActive, setEventActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const rollNumber = localStorage.getItem('studentRoll');
    if (!rollNumber) {
      navigate('/student/login');
      return;
    }

    fetchData(rollNumber);
  }, [navigate]);

  const fetchData = async (rollNumber: string) => {
    try {
      const [coursesRes, eventRes] = await Promise.all([
        getStudentCourses(rollNumber),
        getFeedbackEvent()
      ]);

      setCourses(coursesRes.data.courses || []);
      setEventActive(eventRes.data.isActive);
      setStudentInfo(coursesRes.data.student);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFeedback = (courseId: string) => {
    localStorage.setItem('selectedCourse', courseId);
    navigate('/student/feedback');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {studentInfo?.name || 'Student'}
              </h1>
              <p className="text-gray-600 mt-1">
                Roll: {studentInfo?.rollNumber} | Department: {studentInfo?.department}
              </p>
            </div>
            <Link
              to="/"
              className="btn-secondary"
            >
              Logout
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <div className={`card ${eventActive ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <div className="flex items-center">
              {eventActive ? (
                <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              ) : (
                <AlertCircle className="w-8 h-8 text-orange-600 mr-4" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Feedback Event Status
                </h3>
                <p className={`${eventActive ? 'text-green-700' : 'text-orange-700'}`}>
                  {eventActive 
                    ? 'Feedback collection is currently active. You can submit your feedback.'
                    : 'No active feedback event. Please wait for the admin to start the feedback collection.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {eventActive && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Courses</h2>
            {courses.length === 0 ? (
              <div className="card text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Assigned</h3>
                <p className="text-gray-500">Please contact your admin to assign courses.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <div key={course.id} className="card hover:scale-105 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      {course.hasSubmitted && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {course.code}
                    </h3>
                    <p className="text-gray-600 mb-4">{course.title}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Faculty:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.faculty.map((faculty: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {faculty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {course.hasSubmitted ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Feedback Submitted</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartFeedback(course.id)}
                        className="btn-primary w-full"
                      >
                        Start Feedback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;