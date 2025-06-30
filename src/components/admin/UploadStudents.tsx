import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadStudents } from '../../utils/api';
import { Upload, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

const UploadStudents: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadStudents(formData);
      setSuccess(true);
      setFile(null);
      
      // Reset form
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link to="/admin/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Upload Students</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Excel File</h2>
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Students uploaded successfully!
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Excel files only (.xlsx, .xls)
                    </p>
                  </label>
                </div>
                
                {file && (
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    {file.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Students
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Excel Format Requirements</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Required Columns:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>rollNumber</strong> - Student roll number</li>
                  <li>• <strong>name</strong> - Student full name</li>
                  <li>• <strong>department</strong> - Department code (CSE, ECE, etc.)</li>
                  <li>• <strong>semester</strong> - Semester number (1-8)</li>
                  <li>• <strong>courses</strong> - Course codes (comma-separated)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Sample Data:</h3>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  <div className="grid grid-cols-5 gap-2 mb-1 font-bold">
                    <span>rollNumber</span>
                    <span>name</span>
                    <span>department</span>
                    <span>semester</span>
                    <span>courses</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <span>71812301001</span>
                    <span>John Doe</span>
                    <span>CSE</span>
                    <span>5</span>
                    <span>CSE501,CSE502</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-medium text-blue-800 mb-2">Important Notes:</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Ensure all required columns are present</li>
                  <li>• Roll numbers should be unique</li>
                  <li>• Course codes should match existing courses</li>
                  <li>• Use comma-separated values for multiple courses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStudents;