// components/StudentProgress.jsx
import React, { useState, useEffect } from 'react';
import CourseRoadmap from './CourseRoadmap';

const StudentProgress = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [showTechList, setShowTechList] = useState(null); // 'completed' or 'inProgress'
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCourse, setUploadCourse] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('authUser'));
      const token = localStorage.getItem('authToken');
      
      if (!user || !token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      console.log('Fetching progress for user:', user._id);

      // Fetch statistics from backend
      const response = await fetch(`http://localhost:5000/api/learning-progress/stats/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Stats response status:', response.status);

      if (response.ok) {
        const stats = await response.json();
        console.log('Fetched stats:', stats);

        // Handle empty stats
        if (!stats || !stats.courses) {
          setProgressData({
            overallProgress: 0,
            technologies: [],
            stats: {
              completed: 0,
              inProgress: 0,
              notStarted: 0,
              totalHours: 0
            },
            allCourses: []
          });
          return;
        }

        // Format technology data
        const technologies = stats.courses.map(course => ({
          name: formatCourseName(course.name),
          courseName: course.name,
          progress: course.progress || 0,
          icon: getIconForCourse(course.name),
          completed: course.certificateEarned,
          totalSteps: course.totalSteps || 0,
          completedSteps: course.completedSteps || 0,
          startedDate: course.startedDate,
          lastAccessedDate: course.lastAccessedDate,
          certificateDate: course.certificateDate,
          uploadedCertificates: course.uploadedCertificates || []
        }));

        // Filter to show completed and in-progress technologies
        const filteredTechnologies = technologies.filter(tech => tech.completed || tech.progress > 0);

        // Calculate overall progress based on completed technologies only
        const completedCourses = stats.completedCourses || 0;
        const inProgressCourses = stats.inProgressCourses || 0;
        const totalEnrolledTechnologies = completedCourses + inProgressCourses;
        const overallProgress = totalEnrolledTechnologies > 0 ? Math.round((completedCourses / totalEnrolledTechnologies) * 100) : 0;

        setProgressData({
          overallProgress,
          technologies: filteredTechnologies.slice(0, 5), // Show top 5 completed/in-progress
          stats: {
            completed: stats.completedCourses,
            inProgress: stats.inProgressCourses,
            notStarted: stats.notStartedCourses,
            certificateUploads: stats.certificateUploads || 0,
            totalHours: calculateTotalHours(technologies)
          },
          allCourses: technologies
        });
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError('Failed to fetch progress data: ' + (errorData.message || response.statusText));
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Error loading progress data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async () => {
    try {
      if (!uploadFile || !uploadCourse) {
        alert('Please select a course and a certificate file to upload.');
        return;
      }
      const user = JSON.parse(localStorage.getItem('authUser'));
      const token = localStorage.getItem('authToken');
      if (!user || !token) {
        alert('You must be logged in to upload certificates.');
        return;
      }

      const formData = new FormData();
      formData.append('certificate', uploadFile);
      formData.append('courseName', uploadCourse);

      const res = await fetch('http://localhost:5000/api/learning-progress/upload-certificate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }

      const result = await res.json();
      console.log('Upload result:', result);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadCourse('');
      // Refresh stats
      await fetchProgressData();
      alert('Certificate uploaded successfully');
    } catch (err) {
      console.error('Error uploading certificate:', err);
      alert('Failed to upload certificate: ' + err.message);
    }
  };

  const handleViewCertificate = async (id, filename) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You must be logged in to view certificates.');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/learning-progress/certificate/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      if (!res.ok) {
        const ctype = res.headers.get('content-type') || '';
        let errObj = {};
        if (ctype.includes('application/json')) {
          errObj = await res.json().catch(() => ({}));
        } else {
          errObj = { message: await res.text().catch(() => res.statusText) };
        }
        const msg = errObj.msg || errObj.message || errObj.error || res.statusText || 'Failed to fetch certificate';
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Error viewing certificate:', err);
      alert('Failed to open certificate: ' + err.message);
    }
  };

  const handleDownloadCertificate = async (id, filename) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You must be logged in to download certificates.');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/learning-progress/certificate/${id}?download=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      if (!res.ok) {
        const ctype = res.headers.get('content-type') || '';
        let errObj = {};
        if (ctype.includes('application/json')) {
          errObj = await res.json().catch(() => ({}));
        } else {
          errObj = { message: await res.text().catch(() => res.statusText) };
        }
        const msg = errObj.msg || errObj.message || errObj.error || res.statusText || 'Failed to fetch certificate';
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'certificate';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate: ' + err.message);
    }
  };

  const formatCourseName = (name) => {
    const nameMap = {
      'mern': 'MERN Stack',
      'python': 'Python Django',
      'java': 'Java Spring Boot',
      'dsA': 'Data Structures',
      'javascript': 'JavaScript',
      'aws': 'AWS Cloud',
      'ml': 'Machine Learning',
      'uiux': 'UI/UX Design',
      'devops': 'DevOps',
      'security': 'Cyber Security',
      'mobile': 'Mobile App Development',
      'blockchain': 'Blockchain Technology'
    };
    return nameMap[name] || name;
  };

  const getIconForCourse = (name) => {
    const iconMap = {
      'mern': 'fab fa-react',
      'python': 'fab fa-python',
      'java': 'fab fa-java',
      'dsA': 'fas fa-code',
      'javascript': 'fab fa-js-square',
      'aws': 'fab fa-aws',
      'ml': 'fas fa-robot',
      'uiux': 'fas fa-pencil-ruler',
      'devops': 'fas fa-tools',
      'security': 'fas fa-shield-alt',
      'mobile': 'fas fa-mobile-alt',
      'blockchain': 'fas fa-link'
    };
    return iconMap[name] || 'fas fa-code';
  };

  const calculateTotalHours = (technologies) => {
    // Estimate: 5 hours per 10% progress per course
    return technologies.reduce((total, tech) => {
      return total + Math.round((tech.progress / 10) * 5);
    }, 0);
  };

  const courseMapping = {
    'mern': 'mern',
    'python': 'python',
    'java': 'java',
    'dsA': 'dsA',
    'javascript': 'javascript',
    'aws': 'aws',
    'ml': 'ml',
    'uiux': 'uiux',
    'devops': 'devops',
    'security': 'security',
    'mobile': 'mobile',
    'blockchain': 'blockchain'
  };

  const handleOpenRoadmap = (tech) => {
    const courseName = courseMapping[tech.courseName];
    if (courseName) {
      setSelectedCourse(courseName);
      setShowRoadmap(true);
      setShowTechList(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Show roadmap if requested
  if (showRoadmap && selectedCourse) {
    return (
      <CourseRoadmap 
        courseName={selectedCourse}
        onBack={() => {
          setShowRoadmap(false);
          setSelectedCourse(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="student-progress-section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading progress...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-progress-section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return null;
  }

  return (
    <div className="student-progress-section">
      <div className="container">
        <div className="section-header">
          <h1>Your Learning Progress</h1>
          <p>Track your journey and see how far you've come</p>
        </div>

        <div className="progress-overview-section">
          <div className="overview-cards">
            <div className="overview-card">
              <h3>Overall Progress</h3>
              <div className="progress-circle-container">
                <div className="progress-circle" style={{ background: `conic-gradient(var(--primary) ${progressData.overallProgress}%, #e9ecef 0)` }}>
                  <span>{progressData.overallProgress}%</span>
                </div>
              </div>
              <p className="progress-description">You're {progressData.overallProgress}% through your learning path</p>
            </div>
            
            <div className="overview-card">
              <h3>Learning Statistics</h3>
              <div className="stats-container">
                <div 
                  className="stat-item"
                  onClick={() => setShowTechList('completed')}
                  style={{ cursor: progressData.stats.completed > 0 ? 'pointer' : 'default', opacity: progressData.stats.completed > 0 ? 1 : 0.6 }}
                >
                  <div className="stat-number">{progressData.stats.completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div 
                  className="stat-item"
                  onClick={() => setShowTechList('inProgress')}
                  style={{ cursor: progressData.stats.inProgress > 0 ? 'pointer' : 'default', opacity: progressData.stats.inProgress > 0 ? 1 : 0.6 }}
                >
                  <div className="stat-number">{progressData.stats.inProgress}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-item" onClick={() => setShowUploadModal(true)} style={{ cursor: 'pointer' }}>
                  <div className="stat-number">{progressData.stats.certificateUploads ?? 0}</div>
                  <div className="stat-label">Upload Certificate</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{progressData.stats.totalHours}</div>
                  <div className="stat-label">Hours Spent</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detailed-progress-section">
          <div className="progress-content-card">
            <h2>Technology-wise Progress</h2>
            <div className="progress-list">
              {progressData.technologies.map((tech, index) => (
                <div 
                  key={index} 
                  className="progress-item"
                  onClick={() => setSelectedTech(tech)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tech-info">
                    <i className={tech.icon}></i>
                    <span className="tech-name">{tech.name}</span>
                    {tech.completed && <span style={{ marginLeft: '10px', color: 'green', fontSize: '12px' }}>✓ Completed</span>}
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${tech.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="progress-percentage">{tech.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

          {showTechList && (
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
          }} onClick={() => setShowTechList(null)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>
                  {showTechList === 'completed' ? 'Completed Technologies' : 'In Progress Technologies'}
                </h2>
                <button 
                  onClick={() => setShowTechList(null)}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {progressData.allCourses
                  .filter(tech => showTechList === 'completed' ? tech.completed : (tech.progress > 0 && !tech.completed))
                  .map((tech, index) => (
                    <div
                      key={index}
                      onClick={() => handleOpenRoadmap(tech)}
                      style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid #dee2e6',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.borderColor = '#dee2e6';
                      }}
                    >
                      <i className={tech.icon} style={{ fontSize: '24px', color: 'var(--primary)', width: '30px' }}></i>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tech.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {tech.progress}% Complete • {tech.completedSteps}/{tech.totalSteps} steps
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: tech.completed ? '#d4edda' : '#fff3cd',
                        color: tech.completed ? '#155724' : '#856404',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {tech.completed ? '✓ Completed' : 'In Progress'}
                      </div>
                    </div>
                  ))}
              </div>

              {((showTechList === 'completed' && progressData.allCourses.filter(t => t.completed).length === 0) ||
                (showTechList === 'inProgress' && progressData.allCourses.filter(t => !t.completed && t.progress > 0).length === 0)) && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No {showTechList === 'completed' ? 'completed' : 'in-progress'} technologies yet</p>
                </div>
              )}

              <button
                onClick={() => setShowTechList(null)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '20px',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showCertModal && (
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
            zIndex: 3000
          }} onClick={() => setShowCertModal(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '760px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Uploaded Certificates</h3>
                <button onClick={() => setShowCertModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {progressData.allCourses && progressData.allCourses.some(c => (c.uploadedCertificates && c.uploadedCertificates.length > 0)) ? (
                  progressData.allCourses.map((course, ci) => (
                    (course.uploadedCertificates && course.uploadedCertificates.length > 0) && (
                      <div key={ci} style={{ padding: '12px', borderRadius: '8px', background: '#f8f9fa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{course.name}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>{(course.uploadedCertificates || []).length} file{(course.uploadedCertificates || []).length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(course.uploadedCertificates || []).map((f, fi) => (
                            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{f.filename}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{new Date(f.uploadedAt).toLocaleString()}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleViewCertificate(f.certificateId, f.filename)} style={{ padding: '6px 10px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>View</button>
                                <button onClick={() => handleDownloadCertificate(f.certificateId, f.filename)} style={{ padding: '6px 10px', background: '#6c757d', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Download</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }}></i>
                    <div>No certificates uploaded yet.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTech && (
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
            zIndex: 1000
          }} onClick={() => setSelectedTech(null)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>{selectedTech.name}</h2>
                <button 
                  onClick={() => setSelectedTech(null)}
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
                <i className={selectedTech.icon} style={{ fontSize: '48px', color: 'var(--primary)', marginRight: '10px' }}></i>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Status:</strong>
                <span style={{ marginLeft: '10px', color: selectedTech.completed ? 'green' : 'orange' }}>
                  {selectedTech.completed ? '✓ Completed' : '⟳ In Progress'}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Progress:</strong>
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
                      width: `${selectedTech.progress}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {selectedTech.progress > 10 && `${selectedTech.progress}%`}
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', marginTop: '5px', display: 'block' }}>
                    {selectedTech.completedSteps} of {selectedTech.totalSteps} steps completed
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Started Date:</strong>
                <span style={{ marginLeft: '10px' }}>{formatDate(selectedTech.startedDate)}</span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Last Accessed:</strong>
                <span style={{ marginLeft: '10px' }}>{formatDate(selectedTech.lastAccessedDate)}</span>
              </div>

              {selectedTech.completed && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Certificate Earned:</strong>
                  <span style={{ marginLeft: '10px', color: 'green' }}>
                    {formatDate(selectedTech.certificateDate)}
                  </span>
                </div>
              )}

              <button
                onClick={() => setSelectedTech(null)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '20px',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showUploadModal && (
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
            zIndex: 2000
          }} onClick={() => setShowUploadModal(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '420px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>Upload Certificate</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Select Course</label>
                <select value={uploadCourse} onChange={(e) => setUploadCourse(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                  <option value="">-- Select Course --</option>
                  {progressData.allCourses.map((c, idx) => (
                    <option key={idx} value={c.courseName}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Certificate File (PDF / Image)</label>
                <input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={handleUploadSubmit} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px' }}>Upload</button>
                <button onClick={() => setShowUploadModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="achievements-section" style={{ marginTop: '50px', marginBottom: '50px' }}>
          <h2 style={{ marginBottom: '30px', fontSize: '28px', color: '#1a3a52' }}>Recent Achievements</h2>
          <div className="achievements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {progressData.stats.completed > 0 && (
              <div 
                className="achievement-card" 
                onClick={() => setShowTechList('completed')}
                style={{
                background: 'linear-gradient(135deg, #FFD89B 0%, #19547B 100%)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(255, 216, 155, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 216, 155, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 216, 155, 0.3)';
              }}>
                <i className="fas fa-trophy achievement-icon" style={{ fontSize: '48px', color: '#FFD89B', marginBottom: '15px', display: 'block', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></i>
                <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>Course Master</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '0', lineHeight: '1.5' }}>Completed {progressData.stats.completed} course{progressData.stats.completed > 1 ? 's' : ''}</p>
              </div>
            )}
            {progressData.stats.inProgress > 0 && (
              <div 
                className="achievement-card" 
                onClick={() => setShowTechList('inProgress')}
                style={{
                background: 'linear-gradient(135deg, #FA8231 0%, #E74C3C 100%)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(250, 130, 49, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(250, 130, 49, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(250, 130, 49, 0.3)';
              }}>
                <i className="fas fa-fire achievement-icon" style={{ fontSize: '48px', color: '#FFD700', marginBottom: '15px', display: 'block', textShadow: '0 2px 4px rgba(0,0,0,0.2)', animation: 'pulse 2s infinite' }}></i>
                <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>On a Roll</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '0', lineHeight: '1.5' }}>Learning {progressData.stats.inProgress} course{progressData.stats.inProgress > 1 ? 's' : ''} simultaneously</p>
              </div>
            )}
            {progressData.overallProgress >= 50 && (
              <div className="achievement-card" style={{
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
              }}>
                <i className="fas fa-medal achievement-icon" style={{ fontSize: '48px', color: '#FFD700', marginBottom: '15px', display: 'block', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></i>
                <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>Halfway There</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '0', lineHeight: '1.5' }}>Reached {progressData.overallProgress}% overall progress</p>
              </div>
            )}
            {/* Certificates Card */}
            <div 
              className="achievement-card" 
              onClick={() => setShowCertModal(true)}
              style={{
                background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(74, 0, 224, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <i className="fas fa-certificate achievement-icon" style={{ fontSize: '48px', color: '#FFD700', marginBottom: '15px', display: 'block' }}></i>
              <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>Certificates</h4>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '0', lineHeight: '1.5' }}>{progressData.stats.certificateUploads ?? 0} uploaded</p>
            </div>
            {progressData.overallProgress >= 75 && (
              <div className="achievement-card" style={{
                background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(245, 87, 108, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 87, 108, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 87, 108, 0.3)';
              }}>
                <i className="fas fa-star achievement-icon" style={{ fontSize: '48px', color: '#FFD700', marginBottom: '15px', display: 'block', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></i>
                <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>Almost Done</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '0', lineHeight: '1.5' }}>Nearly complete your learning path</p>
              </div>
            )}
            {!progressData.stats.completed && !progressData.stats.inProgress && (
              <div className="achievement-card" style={{
                background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.3)';
              }}>
                <i className="fas fa-rocket achievement-icon" style={{ fontSize: '48px', color: 'white', marginBottom: '15px', display: 'block', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></i>
                <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>Get Started</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '0', lineHeight: '1.5' }}>Begin your learning journey today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;