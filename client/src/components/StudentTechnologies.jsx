// components/StudentTechnologies.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CourseRoadmap from "./CourseRoadmap";
import "./StudentTechnologies.css";

const StudentTechnologies = () => {
  // Course name mapping - tech name to database course name
  const courseMapping = {
    'MERN Stack': 'mern',
    'Python Django': 'python',
    'Java Spring Boot': 'java',
    'Data Structures': 'dsA',
    'JavaScript': 'javascript',
    'AWS Cloud': 'aws',
    'Machine Learning': 'ml',
    'UI/UX Design': 'uiux',
    'DevOps': 'devops',
    'Cyber Security': 'security',
    'Mobile App Development': 'mobile',
    'Blockchain Technology': 'blockchain',
    'TCS Interview Preparation': 'tcs',
    'Infosys Interview Preparation': 'infosys',
    'Wipro Interview Preparation': 'wipro',
    'Accenture Interview Preparation': 'accenture',
    'Logical Reasoning': 'reasoning',
    'Verbal Ability': 'verbal',
    'Quantitative Aptitude': 'reasoning'
  };

  const [selectedCategory, setSelectedCategory] = useState('All Technologies');
  const [searchQuery, setSearchQuery] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTechDetails, setSelectedTechDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const technologiesRef = useRef([]);

  // Hardcoded fallback data if API fails
  const fallbackTechnologies = [
    {
      id: 1,
      name: "MERN Stack",
      description: "Full-stack JavaScript development with MongoDB, Express, React, and Node.js",
      icon: "fab fa-react",
      progress: 75,
      status: "in-progress",
      resources: 10,
      category: "Web Development"
    },
    {
      id: 2,
      name: "JavaScript",
      description: "Modern JavaScript programming language fundamentals and advanced concepts",
      icon: "fab fa-js-square",
      progress: 100,
      status: "completed",
      resources: 6,
      category: "Programming"
    },
    {
      id: 3,
      name: "Python Django",
      description: "Web development with Python and Django framework",
      icon: "fab fa-python",
      progress: 30,
      status: "in-progress",
      resources: 10,
      category: "Web Development"
    },
    {
      id: 15,
      name: "Wipro Interview Preparation",
      description: "Wipro placement training including coding, aptitude, and communication skills",
      icon: "fas fa-building",
      progress: 0,
      status: "not-started",
      resources: 6,
      category: "Company Prep"
    },
    {
      id: 16,
      name: "Accenture Interview Preparation",
      description: "Accenture-specific assessment, coding rounds, and HR interview guidance",
      icon: "fas fa-building",
      progress: 0,
      status: "not-started",
      resources: 6,
      category: "Company Prep"
    },
    {
      id: 17,
      name: "Capgemini Interview Preparation",
      description: "Capgemini exam pattern, technical questions, and interview preparation",
      icon: "fas fa-building",
      progress: 0,
      status: "not-started",
      resources: 6,
      category: "Company Prep"
    },
    {
      id: 18,
      name: "Quantitative Aptitude",
      description: "Number systems, percentages, profit & loss, time and work, and averages",
      icon: "fas fa-calculator",
      progress: 0,
      status: "not-started",
      resources: 6,
      category: "Aptitude"
    },
    {
      id: 19,
      name: "Logical Reasoning",
      description: "Puzzles, seating arrangements, blood relations, and analytical reasoning",
      icon: "fas fa-brain",
      progress: 0,
      status: "not-started",
      resources: 6,
      category: "Aptitude"
    },
    {
      id: 20,
      name: "Verbal Ability",
      description: "Grammar, vocabulary, reading comprehension, and verbal reasoning",
      icon: "fas fa-comments",
      progress: 0,
      status: "not-started",
      resources: 6,
      category: "Aptitude"
    }
  ];

  // Fetch technologies from backend
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('authUser'));
    setIsAdmin(user?.userType === 'admin');

    const fetchTechnologies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/technologies');
        if (!response.ok) {
          throw new Error('Failed to fetch technologies');
        }
        const data = await response.json();
        console.log('Fetched technologies:', data);
        
        
        // Map database technologies to the required format
        const formattedTechs = data.map((tech, index) => ({
          id: tech._id || index + 1,
          name: tech.name,
          description: tech.description || 'Learn ' + tech.name,
          icon: tech.icon || 'fas fa-code',
          progress: 0,
          status: 'not-started',
          resources: tech.resources || 10,
          category: tech.category || 'Other',
          courseName: tech.courseName || '' // Add course name mapping if available
        }));
        setTechnologies(formattedTechs);
        
        // Fetch progress for each technology only if not admin
        if (!user || user.userType !== 'admin') {
          await fetchProgressForTechs(formattedTechs);
        }
      } catch (err) {
        console.error('Error fetching technologies:', err);
        setError(null);
        // Use fallback data when API fails, but reset progress to 0
        const fallbackWithResetProgress = fallbackTechnologies.map(tech => ({
          ...tech,
          progress: 0,
          status: 'not-started'
        }));
        setTechnologies(fallbackWithResetProgress);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologies();
    
    // Set up periodic refresh of progress - use a function that fetches current state
    const progressRefreshInterval = setInterval(async () => {
      // Get fresh technologies from state rather than using ref
      setTechnologies(prevTechs => {
        if (prevTechs && prevTechs.length > 0) {
          fetchProgressForTechs(prevTechs);
        }
        return prevTechs;
      });
    }, 2000); // Refresh every 2 seconds for better real-time updates
    
    return () => clearInterval(progressRefreshInterval);
  }, []);

  // Fetch progress data for technologies
  const fetchProgressForTechs = async (techs) => {
    const user = JSON.parse(localStorage.getItem('authUser'));
    const token = localStorage.getItem('authToken');
    
    if (!user || !token) {
      console.warn('User not authenticated');
      return;
    }

    try {
      // Mapping of tech names to course names
      const courseMapping = {
        'MERN Stack': 'mern',
        'Python Django': 'python',
        'Java Spring Boot': 'java',
        'Data Structures': 'dsA',
        'JavaScript': 'javascript',
        'AWS Cloud': 'aws',
        'Machine Learning': 'ml',
        'UI/UX Design': 'uiux',
        'DevOps': 'devops',
        'Cyber Security': 'security',
        'Mobile App Development': 'mobile',
        'Blockchain Technology': 'blockchain',
        'TCS Interview Preparation': 'tcs',
        'Infosys Interview Preparation': 'infosys',
        'Wipro Interview Preparation': 'wipro',
        'Accenture Interview Preparation': 'accenture',
        'Logical Reasoning': 'reasoning',
        'Verbal Ability': 'verbal'
      };

      const updatedTechs = await Promise.all(
        techs.map(async (tech) => {
          const courseName = courseMapping[tech.name];
          
          if (!courseName) {
            return tech; // Return unchanged if no mapping
          }

          try {
            const response = await fetch(
              `http://localhost:5000/api/learning-progress/${user._id}/${courseName}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              console.error(`Failed to fetch progress for ${tech.name}:`, response.status, errorData);
              
              // If 401, token might be invalid
              if (response.status === 401) {
                console.error('Authentication failed - token may be invalid or expired');
                setError('Session expired. Please log in again.');
              }
              return tech;
            }

            const progressData = await response.json();
            console.log(`Progress for ${tech.name}:`, progressData);
            
            // Use the overallProgress from the backend if available, otherwise calculate
            let progressPercent = 0;
            
            if (progressData.overallProgress !== undefined && progressData.overallProgress !== null) {
              // Use the backend-calculated overallProgress
              progressPercent = progressData.overallProgress;
            } else {
              // Fallback calculation only if backend didn't provide it
              let totalSteps = progressData.totalSteps || 0;
              let completedSteps = progressData.completedSteps || 0;
              
              // Only use steps.length as totalSteps if it's clearly not set
              if (totalSteps === 0 && progressData.steps && progressData.steps.length > 0) {
                totalSteps = progressData.steps.length;
                completedSteps = progressData.steps.filter(s => s.status === 'completed').length;
              }
              
              progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            }
            
            console.log(`${tech.name}: Backend Progress = ${progressData.overallProgress}%, Calculated = ${progressPercent}%`);
            
            // Determine status - check if progress > 0 or if any step is in progress
            let status = 'not-started';
            if (progressPercent === 100) {
              status = 'completed';
            } else if (progressPercent > 0 || (progressData.steps && progressData.steps.some(s => s.status === 'in-progress'))) {
              status = 'in-progress';
            }

            return {
              ...tech,
              progress: progressPercent,
              status: status
            };
          } catch (err) {
            console.error(`Error fetching progress for ${tech.name}:`, err);
            console.error('Error details:', err.message);
            return tech;
          }
        })
      );

      setTechnologies(updatedTechs);
      technologiesRef.current = updatedTechs;
      return updatedTechs;
    } catch (err) {
      console.error('Error fetching progress data:', err);
      console.error('Error stack:', err.stack);
      setError('Failed to fetch progress data. Please try again or log in again.');
    }
  };

  const handleTechnologyClick = (tech) => {
    console.log('Selected technology:', tech);
    
    const courseMapping = {
      'MERN Stack': 'mern',
      'Python Django': 'python',
      'Java Spring Boot': 'java',
      'Data Structures': 'dsA',
      'JavaScript': 'javascript',
      'AWS Cloud': 'aws',
      'Machine Learning': 'ml',
      'UI/UX Design': 'uiux',
      'DevOps': 'devops',
      'Cyber Security': 'security',
      'Mobile App Development': 'mobile',
      'Blockchain Technology': 'blockchain',
      'TCS Interview Preparation': 'tcs',
      'Infosys Interview Preparation': 'infosys',
      'Wipro Interview Preparation': 'wipro',
      'Accenture Interview Preparation': 'accenture',
      'Logical Reasoning': 'reasoning',
      'Verbal Ability': 'verbal'
    };
    
    const courseName = courseMapping[tech.name];
    
    if (courseName) {
      setSelectedCourse(courseName);
      setShowRoadmap(true);
      setSelectedTechDetails(null); // Close modal if open
    } else {
      alert(`Course: ${tech.name}\n\nRoadmap for this course coming soon!`);
    }
  };

  // Get unique categories from technologies
  const getCategories = () => {
    if (technologies.length === 0) return [];
    const categories = [...new Set(technologies.map(t => t.category))];
    return categories;
  };

  // Show roadmap if requested
  if (showRoadmap && selectedCourse) {
    return (
      <CourseRoadmap 
        courseName={selectedCourse}
        onBack={async () => {
          setShowRoadmap(false);
          // Immediately refresh progress when coming back
          if (technologiesRef.current && technologiesRef.current.length > 0) {
            await fetchProgressForTechs(technologiesRef.current);
          }
        }}
      />
    );
  }

  return (
    <div className="student-technologies-section">
      <div className="container">
        <div className="section-header">
          <h1>Available Technologies</h1>
          <p>Choose a technology to start learning and track your progress</p>
        </div>

        {loading && (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i> Loading technologies...
          </div>
        )}

        {error && (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i> Error: {error}
          </div>
        )}

        {!loading && !error && technologies.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-inbox"></i> No technologies available
          </div>
        )}

        {!loading && technologies.length > 0 && (
          <div>
            
            <div className="tech-filters">
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${selectedCategory === 'All Technologies' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All Technologies')}
                >
                  All Technologies
                </button>
                {getCategories().map(category => (
                  <button 
                    key={category}
                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search technologies..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
            </div>

            <div className="tech-grid-container">
              <div className="tech-grid">
                {technologies
                  .filter(tech => 
                    (selectedCategory === 'All Technologies' || tech.category === selectedCategory) &&
                    (tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     tech.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(tech => (
                  <div key={tech.id} className="tech-card" onClick={() => handleTechnologyClick(tech)}>
                    <div className="tech-card-header">
                      <div className="tech-icon">
                        <i className={tech.icon}></i>
                      </div>
                      <div className="tech-status">
                        {!isAdmin && (
                          <span className={`status-badge ${tech.status}`}>
                            {tech.status.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="tech-category">{tech.category}</div>
                    
                    <h3 className="tech-title">{tech.name}</h3>
                    <p className="tech-description">{tech.description}</p>
                    
                    {isAdmin ? (
                      <div className="tech-admin-section">
                        {/* Admin: student counts removed as requested */}
                      </div>
                    ) : (
                      <div className="tech-progress-section">
                        <div className="progress-info">
                          <span>Your Progress</span>
                          <span>{tech.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${tech.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="tech-meta-info">
                      <div className="meta-item">
                        <i className="fas fa-book"></i>
                        <span>{tech.resources} Learning Resources</span>
                      </div>
                    </div>
                    
                    <button className="tech-action-btn" onClick={() => handleTechnologyClick(tech)}>
                      {isAdmin ? 'Show Details' : (tech.progress > 0 ? 'Continue Learning' : 'Start Learning')}
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTechDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }} onClick={() => setSelectedTechDetails(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedTechDetails.name}</h2>
              <button 
                onClick={() => setSelectedTechDetails(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <i className={selectedTechDetails.icon} style={{ fontSize: '48px', color: 'var(--primary)', marginRight: '10px' }}></i>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Category:</strong>
              <span style={{ marginLeft: '10px' }}>{selectedTechDetails.category}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: '8px', lineHeight: '1.6', color: '#555' }}>
                {selectedTechDetails.description}
              </p>
            </div>

            {!isAdmin && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Status:</strong>
                <span style={{ 
                  marginLeft: '10px', 
                  padding: '4px 12px', 
                  borderRadius: '4px',
                  backgroundColor: selectedTechDetails.status === 'completed' ? '#d4edda' : selectedTechDetails.status === 'in-progress' ? '#fff3cd' : '#e2e3e5',
                  color: selectedTechDetails.status === 'completed' ? '#155724' : selectedTechDetails.status === 'in-progress' ? '#856404' : '#383d41'
                }}>
                  {selectedTechDetails.status.replace('-', ' ')}
                </span>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong>Your Progress:</strong>
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  height: '24px'
                }}>
                  <div style={{
                    backgroundColor: 'var(--primary)',
                    height: '100%',
                    width: `${selectedTechDetails.progress}%`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {selectedTechDetails.progress > 10 && `${selectedTechDetails.progress}%`}
                  </div>
                </div>
                <span style={{ fontSize: '14px', marginTop: '5px', display: 'block' }}>
                  {selectedTechDetails.progress}% completed
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Learning Resources:</strong>
              <div style={{ 
                marginTop: '8px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <i className="fas fa-book" style={{ color: 'var(--primary)' }}></i>
                <span>{selectedTechDetails.resources} learning resources available</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedTechDetails(null)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1,
                  fontSize: '14px'
                }}
              >
                Close
              </button>
              <button
                onClick={() => handleTechnologyClick(selectedTechDetails)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1,
                  fontSize: '14px'
                }}
              >
                {selectedTechDetails.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTechnologies;
