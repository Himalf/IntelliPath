import { useNavigate } from "react-router-dom";
import { FaBrain, FaFileAlt, FaBriefcase, FaBook } from "react-icons/fa";

function IconBrain() {
  return <FaBrain className="text-gray-800 w-12 h-12" />;
}

function IconResume() {
  return <FaFileAlt className="text-gray-800 w-10 h-10" />;
}

function IconCareer() {
  return <FaBriefcase className="text-gray-800 w-10 h-10" />;
}

function IconLearning() {
  return <FaBook className="text-gray-800 w-10 h-10" />;
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center font-sans">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-16 mb-20 px-4">
        <div className="mb-8 animate-fade-in-up">
          <IconBrain />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 tracking-tight animate-fade-in-up delay-100">
          Elevate Your Career with IntelliPath AI
        </h1>
        <p className="text-gray-600 max-w-2xl text-lg mb-10 leading-relaxed animate-fade-in-up delay-200">
          Discover personalized career insights, skill enhancement strategies,
          and tailored recommendations powered by advanced AI technology.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in-up delay-300">
          <button
            onClick={() => navigate("/register")}
            className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg"
          >
            Start Your Journey
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-transform hover:scale-105 shadow-sm"
          >
            Log In
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-7xl px-6 mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-gray-900 animate-fade-in-up delay-400">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Resume Analysis */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center shadow-md hover:shadow-xl transition-transform hover:scale-105 animate-fade-in-up delay-500">
            <IconResume />
            <h3 className="font-bold text-xl mt-6 mb-3 text-gray-900">
              Resume Analysis
            </h3>
            <p className="text-gray-600 text-center text-base leading-relaxed">
              Upload your resume for AI-driven insights to highlight strengths
              and refine areas for growth.
            </p>
          </div>
          {/* Career Recommendations */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center shadow-md hover:shadow-xl transition-transform hover:scale-105 animate-fade-in-up delay-600">
            <IconCareer />
            <h3 className="font-bold text-xl mt-6 mb-3 text-gray-900">
              Career Recommendations
            </h3>
            <p className="text-gray-600 text-center text-base leading-relaxed">
              Get tailored career path suggestions based on your unique skills,
              experience, and aspirations.
            </p>
          </div>
          {/* Learning Resources */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center shadow-md hover:shadow-xl transition-transform hover:scale-105 animate-fade-in-up delay-700">
            <IconLearning />
            <h3 className="font-bold text-xl mt-6 mb-3 text-gray-900">
              Learning Resources
            </h3>
            <p className="text-gray-600 text-center text-base leading-relaxed">
              Explore curated courses and resources to bridge skill gaps and
              propel your career forward.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
