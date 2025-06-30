import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, BarChart3 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4">
            Student Feedback System
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Streamlined feedback collection for better education quality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link
            to="/student/login"
            className="card group hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Portal</h2>
              <p className="text-gray-600">
                Submit feedback for your courses and faculty
              </p>
            </div>
          </Link>

          <Link
            to="/admin/login"
            className="card group hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h2>
              <p className="text-gray-600">
                Manage courses, faculty, and view feedback insights
              </p>
            </div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="card text-center animate-slide-up">
            <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Course Management</h3>
            <p className="text-gray-600 text-sm">Easy course and faculty assignment</p>
          </div>
          
          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">Detailed feedback insights and reports</p>
          </div>
          
          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Users className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Student Tracking</h3>
            <p className="text-gray-600 text-sm">Monitor submission status anonymously</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;