import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getFeedbackEvent, toggleFeedbackEvent, getStudentStatus } from '../../utils/api';
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  Upload, 
  BarChart3, 
  Play, 
  Square,
  LogOut 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [eventActive, setEventActive] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    submittedCount: 0,
    pendingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [eventRes, statsRes] = await Promise.all([
        getFeedbackEvent(),
        getStudentStatus()
      ]);

      setEventActive(eventRes.data.isActive);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = async () => {
    try {
      const response = await toggleFeedbackEvent();
      setEventActive(response.data.isActive);
    } catch (error) {
      console.error('Error toggling event:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.submittedCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                eventActive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {eventActive ? (
                  <Play className="w-6 h-6 text-green-600" />
                ) : (
                  <Square className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Event Status</p>
                <p className={`text-lg font-bold ${
                  eventActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {eventActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback Event Control</h2>
            <p className="text-gray-600 mb-6">
              {eventActive 
                ? 'Students can currently submit feedback. Click to end the event.'
                : 'Feedback collection is stopped. Click to start accepting submissions.'
              }
            </p>
            <button
              onClick={handleToggleEvent}
              className={`${eventActive ? 'btn-danger' : 'btn-success'} flex items-center`}
            >
              {eventActive ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  End Event
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Event
                </>
              )}
            </button>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-semibold">
                  {stats.totalStudents > 0 
                    ? Math.round((stats.submittedCount / stats.totalStudents) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalStudents > 0 
                      ? (stats.submittedCount / stats.totalStudents) * 100 
                      : 0
                    }%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/courses" className="card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Manage Courses</h3>
            </div>
            <p className="text-gray-600">Add, edit, and manage course information</p>
          </Link>

          <Link to="/admin/faculty" className="card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Manage Faculty</h3>
            </div>
            <p className="text-gray-600">Add and manage faculty members</p>
          </Link>

          <Link to="/admin/upload" className="card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Upload Students</h3>
            </div>
            <p className="text-gray-600">Import student data from Excel files</p>
          </Link>

          <Link to="/admin/results" className="card hover:scale-105 transition-all duration-300 group md:col-span-2 lg:col-span-3">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">View Results & Analytics</h3>
            </div>
            <p className="text-gray-600">Analyze feedback data with interactive charts and reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;