import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitFeedback } from '../../utils/api';
import { Star, Send } from 'lucide-react';

const feedbackQuestions = [
  "The course content was well-organized and structured",
  "The instructor explained concepts clearly",
  "The instructor was available for help and guidance",
  "The course materials were helpful and relevant",
  "The assignments were appropriate for the course level",
  "The instructor encouraged student participation",
  "The course met my learning expectations",
  "The instructor provided timely feedback on assignments",
  "The course workload was manageable",
  "The instructor demonstrated expertise in the subject",
  "The course enhanced my understanding of the subject",
  "The instructor was punctual and regular",
  "The teaching methods were effective",
  "The course was intellectually stimulating",
  "Overall, I would recommend this course to others"
];

const ratingLabels = ['Poor', 'Fair', 'Good', 'Excellent'];

const FeedbackForm: React.FC = () => {
  const [courseData, setCourseData] = useState<any>(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [ratings, setRatings] = useState<number[]>(new Array(15).fill(0));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rollNumber = localStorage.getItem('studentRoll');
    const courseId = localStorage.getItem('selectedCourse');
    
    if (!rollNumber || !courseId) {
      navigate('/student/dashboard');
      return;
    }

    // Fetch course data (mock for now)
    setCourseData({
      id: courseId,
      code: 'CSE101',
      title: 'Introduction to Computer Science',
      faculty: ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown']
    });
  }, [navigate]);

  const handleRatingChange = (questionIndex: number, rating: number) => {
    const newRatings = [...ratings];
    newRatings[questionIndex] = rating;
    setRatings(newRatings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFaculty) {
      alert('Please select a faculty member');
      return;
    }

    if (ratings.some(rating => rating === 0)) {
      alert('Please rate all questions');
      return;
    }

    setLoading(true);

    try {
      const rollNumber = localStorage.getItem('studentRoll');
      await submitFeedback({
        studentRoll: rollNumber,
        courseId: courseData.id,
        facultyName: selectedFaculty,
        ratings
      });

      localStorage.removeItem('selectedCourse');
      navigate('/student/thankyou');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Feedback</h1>
          <p className="text-gray-600">
            {courseData.code} - {courseData.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Faculty</h2>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Select Faculty --</option>
              {courseData.faculty.map((faculty: string, index: number) => (
                <option key={index} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Rate Your Experience</h2>
            <div className="space-y-6">
              {feedbackQuestions.map((question, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-sm font-medium text-gray-800 mb-4">
                    {index + 1}. {question}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((rating) => (
                      <label
                        key={rating}
                        className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 ${
                          ratings[index] === rating
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${index}`}
                          value={rating}
                          checked={ratings[index] === rating}
                          onChange={() => handleRatingChange(index, rating)}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {[...Array(rating)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  ratings[index] === rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {ratingLabels[rating - 1]}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;