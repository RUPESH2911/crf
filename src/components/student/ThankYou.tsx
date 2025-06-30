import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Thank You!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your feedback has been submitted successfully. Your input helps us improve the quality of education.
          </p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Redirecting to home...</span>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center mx-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;