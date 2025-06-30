import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, addCourse, deleteCourse, getFaculty } from '../../utils/api';
import { BookOpen, Plus, Trash2, ArrowLeft } from 'lucide-react';

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    department: '',
    semester: 1,
    faculty: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, facultyRes] = await Promise.all([
        getCourses(),
        getFaculty()
      ]);
      setCourses(coursesRes.data);
      setFaculty(facultyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourse(newCourse);
      setNewCourse({ code: '', title: '', department: '', semester: 1, faculty: [] });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        fetchData();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleFacultyChange = (facultyId: string, checked: boolean) => {
    if (checked) {
      setNewCourse(prev => ({
        ...prev,
        faculty: [...prev.faculty, facultyId]
      }));
    } else {
      setNewCourse(prev => ({
        ...prev,
        faculty: prev.faculty.filter(id => id !== facultyId)
      }));
    }
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-800" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Course</h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={newCourse.department}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, department: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="MECH">Mechanical</option>
                    <option value="CIVIL">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                    className="input-field"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Faculty
                </label>
                <div className="grid md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {faculty.map((fac: any) => (
                    <label key={fac.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCourse.faculty.includes(fac.id)}
                        onChange={(e) => handleFacultyChange(fac.id, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">{fac.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Course
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {course.code}
              </h3>
              <p className="text-gray-600 mb-3">{course.title}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium">{course.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Semester:</span>
                  <span className="font-medium">{course.semester}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Faculty:</p>
                <div className="flex flex-wrap gap-1">
                  {course.facultyNames?.map((name: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="card text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Added</h3>
            <p className="text-gray-500 mb-4">Start by adding your first course.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;