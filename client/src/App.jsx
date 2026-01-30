import CourseDetails from './components/CourseDetails';
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Components
import About from './components/About';
import AdminDashboard from './components/AdminDashboard';
import Contact from './components/Contact';
import Header from './components/Header';
import Home from './components/Home';
import LoginModal from './components/LoginModal';
import StudentDashboard from './components/StudentDashboard';
import StudentProgress from './components/StudentProgress';
import StudentTechnologies from './components/StudentTechnologies';
import TechnologyList from './components/TechnologyList';

// Footer Component
const Footer = (bottom) => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Pre-Placement Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize user and technologies from localStorage on mount
  useEffect(() => {
    // Initialize user
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    
    console.log('Initializing from localStorage:', { storedUser, storedToken });
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      console.log('Setting user from localStorage:', userData);
      setUser(userData);
      setUserType(userData.userType);
    }

    // Initialize technologies if not already in localStorage
    const savedTech = localStorage.getItem('technologies');
    if (!savedTech) {
      // Default technologies will be loaded and saved by TechnologyList
      // For now, just mark that we need to initialize
      localStorage.setItem('technologiesInitialized', 'true');
    }

    // Mark initialization as complete
    setIsInitialized(true);
  }, []);

  // Get current section from URL or set default based on user type
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path === '/student-dashboard') return 'dashboard';
    if (path === '/admin-dashboard') return 'admin-dashboard';
    if (path === '/technologies') return 'technologies';
    if (path === '/technology-management') return 'technology-management';
    if (path === '/progress') return 'progress';
    
    // Set default section based on user type
    if (user && userType === 'student') {
      return 'technologies';
    }
    if (user && userType === 'admin') {
      return 'dashboard';
    }
    
    return 'home';
  };

  const [currentSection, setCurrentSection] = useState(getCurrentSection());

  // Update section when URL changes or user authentication state changes
  useEffect(() => {
    setCurrentSection(getCurrentSection());
  }, [location.pathname, user, userType]);

  const handleLogin = (userData, type) => {
    // userData comes from the LoginModal after successful authentication
    setUser(userData);
    setUserType(type);
    
    // Show welcome modal for students
    if (type === 'student') {
      setShowWelcomeModal(true);
      // Auto-close welcome modal after 4 seconds
      setTimeout(() => {
        setShowWelcomeModal(false);
      }, 4000);
      navigate('/technologies');
    } else if (type === 'admin') {
      navigate('/admin-dashboard');
    }
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setUserType(null);
    navigate('/');
    setCurrentSection('home');
  };

  const handleNavigation = (section) => {
    setCurrentSection(section);
    switch(section) {
      case 'home':
        navigate('/');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'dashboard':
        if (user && userType === 'student') {
          navigate('/student-dashboard');
        } else if (user && userType === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
        break;
      case 'technologies':
        if (user) {
          navigate('/technologies');
        } else {
          navigate('/');
        }
        break;
      case 'technology-management':
        if (user && userType === 'admin') {
          navigate('/technology-management');
        } else {
          navigate('/');
        }
        break;
      case 'progress':
        if (user && userType === 'student') {
          navigate('/progress');
        } else {
          navigate('/');
        }
        break;
      default:
        navigate('/');
    }
  };

  // Check if current route requires authentication
  const requiresAuth = () => {
    const protectedRoutes = ['/student-dashboard', '/admin-dashboard', '/technologies', '/progress'];
    return protectedRoutes.includes(location.pathname);
  };

  // Redirect to home if trying to access protected routes without login
  useEffect(() => {
    if (requiresAuth() && !user) {
      navigate('/');
    }
  }, [location.pathname, user, navigate]);

  return (
    <div className="App">
      {showWelcomeModal && user && userType === 'student' && (
        <div className="welcome-modal-overlay" onClick={() => setShowWelcomeModal(false)}>
          <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
            <div className="welcome-modal-content">
              <div className="welcome-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h2>Welcome Mr/Ms {user?.name ? user.name.split(' ')[0] : 'Student'}</h2>
              <p>to PrePlacement Portal</p>
              <button 
                className="close-welcome-btn"
                onClick={() => setShowWelcomeModal(false)}
              >
                Let's Start <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Header 
        currentSection={currentSection}
        setCurrentSection={handleNavigation}
        user={user}
        userType={userType}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        isAdmin={userType === 'admin'}
      />
      
      {/* Main content with proper spacing for fixed header */}
      <main className="main-content">
        {isInitialized ? (
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home onLoginClick={() => setShowLoginModal(true)} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Student Routes */}
            <Route 
              path="/student-dashboard" 
              element={
                user && userType === 'student' ? 
                <StudentDashboard user={user} /> : 
                <Home onLoginClick={() => setShowLoginModal(true)} />
              } 
            />
            <Route 
              path="/technologies" 
              element={
                user ? 
                <StudentTechnologies /> : 
                <Home onLoginClick={() => setShowLoginModal(true)} />
              } 
            />
            <Route 
              path="/progress" 
              element={
                user && userType === 'student' ? 
                <StudentProgress /> : 
                <Home onLoginClick={() => setShowLoginModal(true)} />
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                user && userType === 'admin' ? 
                <AdminDashboard user={user} /> : 
                <Home onLoginClick={() => setShowLoginModal(true)} />
              } 
            />
            
            {/* Technology Management Route */}
            <Route 
              path="/technology-management" 
              element={
                user && userType === 'admin' ? 
                <TechnologyList isAdmin={true} /> : 
                <Home onLoginClick={() => setShowLoginModal(true)} />
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Home onLoginClick={() => setShowLoginModal(true)} />} />
          </Routes>
        ) : (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}
      </main>

      <Footer />

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;