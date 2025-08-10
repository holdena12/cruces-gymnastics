import React, { useState, useEffect } from 'react';

interface Class {
  id: string;
  name: string;
  description: string;
  ageGroup: string;
  schedule: string;
  instructor: string;
  image?: string;
}

const ClassesScrollShowcase: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch classes data
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === classes.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [classes.length]);

  const nextClass = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === classes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevClass = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? classes.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No classes available at the moment.</p>
      </div>
    );
  }

  const currentClass = classes[currentIndex];

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-96">
        {currentClass.image && (
          <img
            src={currentClass.image}
            alt={currentClass.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{currentClass.name}</h3>
            <p className="text-lg mb-2">{currentClass.ageGroup}</p>
            <p className="text-sm opacity-90">{currentClass.schedule}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-700 mb-4">{currentClass.description}</p>
        <p className="text-sm text-gray-600">
          <strong>Instructor:</strong> {currentClass.instructor}
        </p>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevClass}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
        aria-label="Previous class"
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextClass}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
        aria-label="Next class"
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {classes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to class ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ClassesScrollShowcase;