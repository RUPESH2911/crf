import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFaculty, addFaculty, deleteFaculty } from '../../utils/api';
import { UserCheck, Plus, Trash2, ArrowLeft } from 'lucide-react';

const ManageFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    department: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await getFaculty();
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFaculty(newFaculty);
      setNewFaculty({ name: '', department: '', email: '' });
      setShowAddForm(false);
      fetchFaculty();
    } catch (error) {
      console.error('Error adding faculty:', error);
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await deleteFaculty(facultyId);
        fetchFaculty();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-800">Manage Faculty</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Faculty</h2>
            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={newFaculty.department}
                  onChange={(e) => setNewFaculty(prev => ({ ...prev, department: e.target.value }))}
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

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Faculty
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((fac: any) => (
            <div key={fac.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <button
                  onClick={() => handleDeleteFaculty(fac.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {fac.name}
              </h3>
              <p className="text-gray-600 mb-3">{fac.email}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium">{fac.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Courses:</span>
                  <span className="font-medium">{fac.courses?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {faculty.length === 0 && (
          <div className="card text-center">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Faculty Added</h3>
            <p className="text-gray-500 mb-4">Start by adding your first faculty member.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Faculty
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFaculty;