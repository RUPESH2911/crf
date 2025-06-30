import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeedbackResults, getCourses, getFaculty } from '../../utils/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BarChart3, ArrowLeft, Download } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ViewResults: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(true);

  const feedbackQuestions = [
    "Course content organization",
    "Concept explanation clarity",
    "Instructor availability",
    "Course materials relevance",
    "Assignment appropriateness",
    "Student participation encouragement",
    "Learning expectations met",
    "Timely feedback provision",
    "Manageable workload",
    "Subject expertise demonstration",
    "Understanding enhancement",
    "Punctuality and regularity",
    "Teaching method effectiveness",
    "Intellectual stimulation",
    "Overall recommendation"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsRes, coursesRes, facultyRes] = await Promise.all([
        getFeedbackResults(),
        getCourses(),
        getFaculty()
      ]);

      setResults(resultsRes.data);
      setCourses(coursesRes.data);
      setFaculty(facultyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!selectedCourse || !selectedFaculty || !results[selectedCourse]?.[selectedFaculty]) {
      return null;
    }

    const data = results[selectedCourse][selectedFaculty];
    
    return {
      labels: feedbackQuestions.map((_, index) => `Q${index + 1}`),
      datasets: [
        {
          label: 'Average Rating',
          data: data.averageRatings,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Feedback Ratings by Question',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const questionIndex = context.dataIndex;
            return feedbackQuestions[questionIndex];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const labels = ['', 'Poor', 'Fair', 'Good', 'Excellent'];
            return labels[value] || value;
          }
        }
      },
    },
  };

  const getFilteredFaculty = () => {
    if (!selectedCourse) return [];
    const course = courses.find((c: any) => c.id === selectedCourse);
    return course ? faculty.filter((f: any) => course.faculty.includes(f.id)) : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link to="/admin/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Feedback Results & Analytics</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setSelectedFaculty('');
                    }}
                    className="input-field"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course: any) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Faculty
                  </label>
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="input-field"
                    disabled={!selectedCourse}
                  >
                    <option value="">-- Select Faculty --</option>
                    {getFilteredFaculty().map((fac: any) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCourse && selectedFaculty && results[selectedCourse]?.[selectedFaculty] && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Summary</h3>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Total Responses:</span>
                        <span className="font-medium">
                          {results[selectedCourse][selectedFaculty].responseCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating:</span>
                        <span className="font-medium">
                          {(results[selectedCourse][selectedFaculty].averageRatings.reduce((a: number, b: number) => a + b, 0) / 15).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {chartData ? (
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Feedback Analysis
                  </h2>
                  <button className="btn-secondary flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </button>
                </div>
                
                <div className="mb-6">
                  <Bar data={chartData} options={chartOptions} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Question Details</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {feedbackQuestions.map((question, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">Q{index + 1}: {question}</span>
                          <span className="font-medium text-blue-600">
                            {results[selectedCourse][selectedFaculty].averageRatings[index].toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Rating Distribution</h3>
                    <div className="space-y-3">
                      {['Excellent (4)', 'Good (3)', 'Fair (2)', 'Poor (1)'].map((rating, index) => {
                        const ratingValue = 4 - index;
                        const count = results[selectedCourse][selectedFaculty].ratingDistribution?.[ratingValue] || 0;
                        const total = results[selectedCourse][selectedFaculty].responseCount * 15;
                        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={rating} className="flex items-center">
                            <span className="w-20 text-sm text-gray-600">{rating}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                              <div
                                className={`h-2 rounded-full ${
                                  ratingValue === 4 ? 'bg-green-500' :
                                  ratingValue === 3 ? 'bg-blue-500' :
                                  ratingValue === 2 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-12 text-sm text-gray-600">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Selected</h3>
                <p className="text-gray-500">
                  Please select a course and faculty to view feedback results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResults;