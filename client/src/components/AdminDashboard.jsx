import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDetailModal from './StudentDetailModal';
import Messenger from './Messenger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalTab, setModalTab] = useState('overview');
  const [studentsFromApi, setStudentsFromApi] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [totalCourses, setTotalCourses] = useState(0);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courses, setCourses] = useState([]);
  const [technologiesList, setTechnologiesList] = useState([]);
  const [enrolledStats, setEnrolledStats] = useState([]);
  const [loadingEnrolledStats, setLoadingEnrolledStats] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [courseModalData, setCourseModalData] = useState({ student: null, type: null }); // type: 'completed' or 'inprogress'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Active' | 'Inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Mock data for students and their progress (UI demo)
  const students = [
    {
      id: 'STU002',
      name: 'Sumit',
      email: 'sumit@gmail.com',
      technologies: ['Java Spring Boot', 'Python Django'],
      progress: {
        'Java Spring Boot': { completed: 80, lastActive: '2023-06-16' },
        'Python Django': { completed: 30, lastActive: '2023-06-05' }
      },
      practiceStats: {
        hackerrank: { problemsSolved: 67, lastSubmission: '2023-06-16' },
        geeksforgeeks: { problemsSolved: 34, lastSubmission: '2023-06-10' }
      },
      meetings: [
        { date: '2023-06-10', topic: 'Spring Boot advanced concepts' }
      ]
    },
    {
      id: 'STU003',
      name: 'Raj',
      email: 'raj.@gmail.com',
      technologies: ['DSA'],
      progress: {
        'DSA': { completed: 25, lastActive: '2023-06-08' }
      },
      practiceStats: {
        leetcode: { problemsSolved: 12, lastSubmission: '2023-06-05' }
      },
      meetings: []
    }
  ];

  // Auto-refresh page every 2 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing page...');
      window.location.reload();
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Filter enrolled stats to only include technologies present in our DB
  const filteredEnrolledStats = enrolledStats.filter(stat => {
    return technologiesList.some(t => (t.name || '').toLowerCase() === (stat._id || '').toLowerCase());
  });

  // Load real students for activity + DSA profile from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setStudentsError('');
        const token = localStorage.getItem('authToken');
        console.log('Fetching students with token:', token ? 'present' : 'missing');
        
        const res = await fetch(`${API_BASE_URL}/admin/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Students fetch response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Students fetch error response:', errorData);
          throw new Error(errorData.message || `Failed to load students: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('Students loaded:', data);
        setStudentsFromApi(data);
      } catch (err) {
        console.error('Error in fetchStudents:', err);
        setStudentsError(err.message || 'Failed to load students');
      } finally {
        setLoadingStudents(false);
      }
    };

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch(`${API_BASE_URL}/technologies`);
        if (res.ok) {
          const data = await res.json();
          const techArray = Array.isArray(data) ? data : (data.technologies || []);
          // Keep technologies list and flatten all resources.courses into a single courses list
          setTechnologiesList(techArray);
          const flatCourses = techArray.flatMap(t => (t.resources && Array.isArray(t.resources.courses)) ?
            t.resources.courses.map(c => ({ ...c, technology: t.name })) : []);
          setCourses(flatCourses);
          setTotalCourses(flatCourses.length || 0);
        } else {
          setTotalCourses(0);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setTotalCourses(0);
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchEnrolledStats = async () => {
      try {
        setLoadingEnrolledStats(true);
        const res = await fetch(`${API_BASE_URL}/technologies/stats/enrolled`);
        if (res.ok) {
          const data = await res.json();
          // Convert object to array of { _id, enrolledCount }
          const statsArray = Object.entries(data).map(([key, value]) => ({
            _id: key,
            enrolledCount: value.enrolledCount
          }));
          setEnrolledStats(statsArray);
        } else {
          setEnrolledStats([]);
        }
      } catch (err) {
        console.error('Error fetching enrolled stats:', err);
        setEnrolledStats([]);
      } finally {
        setLoadingEnrolledStats(false);
      }
    };

    // Fetch data immediately
    fetchStudents();
    fetchCourses();
    fetchEnrolledStats();
    
    // Auto-refresh every 30 seconds
    const studentsInterval = setInterval(fetchStudents, 30000);
    const coursesInterval = setInterval(fetchCourses, 30000);
    const enrolledStatsInterval = setInterval(fetchEnrolledStats, 30000);
    
    // Listen for custom events
    const handleDataUpdate = () => {
      console.log('Data update event triggered in AdminDashboard');
      fetchStudents();
      fetchCourses();
      fetchEnrolledStats();
    };
    
    window.addEventListener('courseAdded', handleDataUpdate);
    window.addEventListener('studentLoggedIn', handleDataUpdate);
    
    return () => {
      clearInterval(studentsInterval);
      clearInterval(coursesInterval);
      clearInterval(enrolledStatsInterval);
      window.removeEventListener('courseAdded', handleDataUpdate);
      window.removeEventListener('studentLoggedIn', handleDataUpdate);
    };
  }, []);

  const getStudentStatus = (lastLogin) => {
    if (!lastLogin) return 'Inactive';
    const last = new Date(lastLogin).getTime();
    const now = Date.now();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 ? 'Active' : 'Inactive';
  };

  const calculateDaysSinceRegistration = (createdAt) => {
    if (!createdAt) return 0;
    const registered = new Date(createdAt).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - registered) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderStatDetails = () => {
    if (!selectedStat) return null;

    const activeStudents = studentsFromApi.filter(s => (!s.isBlocked) && getStudentStatus(s.lastLogin) === 'Active');
    const inactiveStudents = studentsFromApi.filter(s => (!s.isBlocked) && getStudentStatus(s.lastLogin) === 'Inactive');
    const blockedStudents = studentsFromApi.filter(s => s.isBlocked);

    let title = '';
    let content = null;

    switch(selectedStat) {
      case 'total':
        title = `Total Registered Students (${studentsFromApi.length})`;
        content = (
          <div className="stat-detail-table">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Login</th>
                  <th>Login Date</th>
                </tr>
              </thead>
              <tbody>
                {studentsFromApi.map(s => {
                  return (
                    <tr key={s.id}>
                      <td className="name-cell">{s.name || s.username}</td>
                      <td className="email-cell">{s.email}</td>
                      <td className="login-cell">
                        {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() + ' ' + new Date(s.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                      </td>
                      <td className="date-cell">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        break;
      case 'active':
        title = `Active Students (${activeStudents.length})`;
        content = (
          <div className="stat-detail-table">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {activeStudents.map(s => (
                  <tr key={s.id}>
                    <td className="name-cell">{s.name || s.username}</td>
                    <td className="email-cell">{s.email}</td>
                    <td className="login-cell">
                      {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() + ' ' + new Date(s.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;
      case 'inactive':
        title = `Not Active Students (${inactiveStudents.length})`;
        content = (
          <div className="stat-detail-table">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {inactiveStudents.map(s => (
                  <tr key={s.id}>
                    <td className="name-cell">{s.name || s.username}</td>
                    <td className="email-cell">{s.email}</td>
                    <td className="login-cell">
                      {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() + ' ' + new Date(s.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never logged in'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;
      // 'courses' detail removed — Total Courses card is no longer present
      case 'blocked':
        title = `Blocked Students (${blockedStudents.length})`;
        content = (
          <div className="stat-detail-table">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Login</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {blockedStudents.map(s => (
                  <tr key={s.id}>
                    <td className="name-cell">{s.name || s.username}</td>
                    <td className="email-cell">{s.email}</td>
                    <td className="login-cell">{s.lastLogin ? new Date(s.lastLogin).toLocaleString() : 'Never'}</td>
                    <td className="reason-cell">{s.blockedReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;
      default:
        break;
    }

    return (
      <div className="modal-overlay" onClick={() => setSelectedStat(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="close-btn" onClick={() => setSelectedStat(null)}>&times;</button>
          </div>
          <div className="modal-body">
            {content}
          </div>
        </div>
      </div>
    );
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderStudentsList = () => {
    return (
      <div className="students-list">
        <h3>Student Progress Tracking (Sample Data)</h3>
        <div className="students-grid">
          {students.map(student => (
            <div 
              key={student.id} 
              className={`student-card ${selectedStudent?.id === student.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="student-info">
                <h4>{student.name}</h4>
                <p>{student.email}</p>
                <p>ID: {student.id}</p>
              </div>
              <div className="progress-summary">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateOverallProgress(student)}%` }}
                  ></div>
                </div>
                <span>{calculateOverallProgress(student)}% Overall</span>
              </div>
              <div className="technologies">
                {student.technologies.map(tech => (
                  <span key={tech} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStudentDetail = () => {
    if (!selectedStudent) return null;

    return (
      <StudentDetailModal 
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => { setSelectedStudent(null); setModalTab('overview'); }}
        initialTab={modalTab}
      />
    );
  };

  const calculateOverallProgress = (student) => {
    const progresses = Object.values(student.progress).map(p => p.completed);
    return Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length);
  };

  return (
    <div className="dashboard admin-dashboard">
      <div className="admin-dashboard-wrapper">
        <div className="dashboard-header admin-header-top">
          <div className="header-content">
            <h1><i className="fas fa-tachometer-alt"></i> Admin Dashboard</h1>
            <p>Welcome back, <strong>{user.name}</strong>. Monitor student progress and provide mentorship.</p>
          </div>
        </div>
        
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'students' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('students')}
          >
            <i className="fas fa-users"></i> Student Progress
          </button>
          <button 
            className={activeTab === 'analytics' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-bar"></i> Analytics
          </button>
          <button 
            className={activeTab === 'messenger' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('messenger')}
          >
            <i className="fas fa-comments"></i> Messages
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        {activeTab === 'students' && (
          <>
            <div className="students-list">
              <h3><i className="fas fa-graduation-cap"></i> Student Activity & DSA Profiles</h3>
              <div className="filter-row">
                <div className="filter-buttons">
                <button
                  className={statusFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={statusFilter === 'Active' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setStatusFilter('Active')}
                >
                  Active
                </button>
                <button
                  className={statusFilter === 'Inactive' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setStatusFilter('Inactive')}
                >
                  Not Active
                </button>
                <button
                  className={statusFilter === 'Blocked' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setStatusFilter('Blocked')}
                >
                  Blocked
                </button>
                </div>
                <div className="search-wrapper">
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search by name, email or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {loadingStudents && <div className="loading-message"><i className="fas fa-spinner fa-spin"></i> Loading students...</div>}
              {studentsError && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {studentsError}</div>}
              {!loadingStudents && !studentsError && studentsFromApi.length === 0 && (
                <div className="empty-message"><i className="fas fa-inbox"></i> No students have signed up yet.</div>
              )}
              {!loadingStudents && studentsFromApi.length > 0 && (
                <div className="students-table-wrapper">
                  <table className="admin-students-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Last Login</th>
                        <th>Completed Courses</th>
                        <th>In-Progress Courses</th>
                        <th>DSA Profile</th>
                        <th>Message</th>
                        <th>Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsFromApi
                        .filter((s) => {
                          // Status filter: support All / Active / Inactive / Blocked
                          if (statusFilter !== 'all') {
                            if (statusFilter === 'Blocked') {
                              if (!s.isBlocked) return false;
                            } else {
                              // Exclude blocked users from Active/Inactive lists
                              if (s.isBlocked) return false;
                              if (getStudentStatus(s.lastLogin) !== statusFilter) return false;
                            }
                          }
                          // Search filter (name, email, studentId)
                          if (searchQuery && searchQuery.trim() !== '') {
                            const q = searchQuery.trim().toLowerCase();
                            const name = (s.name || s.username || '').toLowerCase();
                            const email = (s.email || '').toLowerCase();
                            const sid = (s.studentId || '').toLowerCase();
                            if (!name.includes(q) && !email.includes(q) && !sid.includes(q)) return false;
                          }
                          return true;
                        })
                        .map((s) => (
                        <tr key={s.id} className={`student-row ${selectedStudent?.id === s.id ? 'selected' : ''}`} onClick={() => setSelectedStudent(s)}>
                          <td className="status-cell">
                            {s.isBlocked ? (
                              <span className="status-badge blocked">Blocked</span>
                            ) : (
                              <span className={`status-badge ${getStudentStatus(s.lastLogin) === 'Active' ? 'active' : 'inactive'}`}>
                                {getStudentStatus(s.lastLogin)}
                              </span>
                            )}
                          </td>
                          <td className="id-cell">{s.studentId || 'N/A'}</td>
                          <td className="name-cell">{s.name || s.username}</td>
                          <td className="email-cell">
                            <a href={`mailto:${s.email}`} className="email-link-table" onClick={(e) => e.stopPropagation()}>
                              {s.email}
                            </a>
                          </td>
                          <td className="login-cell">
                            {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() + ' ' + new Date(s.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                          </td>
                          <td className="courses-cell">
                            <div className="courses-list">
                              {s.completedCourses && s.completedCourses.length > 0 ? (
                                s.completedCourses.map((course, idx) => (
                                  <span key={idx} className="course-badge completed-badge">
                                    {course}
                                  </span>
                                ))
                              ) : (
                                <span className="no-courses">—</span>
                              )}
                            </div>
                          </td>
                          <td className="courses-cell">
                            <div className="courses-list">
                              {s.inProgressCourses && s.inProgressCourses.length > 0 ? (
                                s.inProgressCourses.map((course, idx) => (
                                  <span key={idx} className="course-badge inprogress-badge">
                                    {course}
                                  </span>
                                ))
                              ) : (
                                <span className="no-courses">—</span>
                              )}
                            </div>
                          </td>
                          <td className="dsa-cell">
                            {s.dsaProfile ? (
                              <a href={s.dsaProfile} target="_blank" rel="noopener noreferrer" className="dsa-link">
                                <i className="fas fa-code"></i> View
                              </a>
                            ) : (
                              <span className="no-data">—</span>
                            )}
                          </td>
                          <td className="action-cell">
                            <button className="action-btn message-btn" title="Send message" onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); setModalTab('messages'); }}>
                              <i className="fas fa-envelope"></i>
                            </button>
                          </td>
                          <td className="action-cell">
                            {s.isBlocked ? (
                              <button
                                className="action-btn unblock-btn"
                                title={s.blockedReason ? `Blocked: ${s.blockedReason}` : 'Blocked'}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!window.confirm('Unblock this student?')) return;
                                  try {
                                    const token = localStorage.getItem('authToken');
                                    const res = await fetch(`${API_BASE_URL}/admin/students/${s.id}/unblock`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      }
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.message || 'Failed to unblock');
                                    }
                                    // Refresh students list
                                    const refreshed = await fetch(`${API_BASE_URL}/admin/students`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
                                    if (refreshed.ok) setStudentsFromApi(await refreshed.json());
                                  } catch (err) {
                                    console.error('Error unblocking student:', err);
                                    alert('Failed to unblock student: ' + err.message);
                                  }
                                }}
                              >
                                <i className="fas fa-lock-open"></i>
                              </button>
                            ) : (
                              <button
                                className="action-btn block-btn"
                                title="Block student"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const reason = window.prompt('Enter reason for blocking this student (required):');
                                  if (reason === null) return; // cancelled
                                  if (reason.trim() === '') { alert('Reason is required'); return; }
                                  try {
                                    const token = localStorage.getItem('authToken');
                                    const res = await fetch(`${API_BASE_URL}/admin/students/${s.id}/block`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: JSON.stringify({ reason })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.message || 'Failed to block');
                                    }
                                    const refreshed = await fetch(`${API_BASE_URL}/admin/students`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
                                    if (refreshed.ok) setStudentsFromApi(await refreshed.json());
                                  } catch (err) {
                                    console.error('Error blocking student:', err);
                                    alert('Failed to block student: ' + err.message);
                                  }
                                }}
                              >
                                <i className="fas fa-lock"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics">
            <h3><i className="fas fa-chart-pie"></i> Platform Analytics</h3>
            <div className="stats-grid">
              <div className="stat-card clickable" onClick={() => setSelectedStat('total')}>
                <div className="stat-icon students-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h4>Total Registered Students</h4>
                <p className="stat-number">{studentsFromApi.length}</p>
              </div>
              <div className="stat-card clickable" onClick={() => setSelectedStat('active')}>
                <div className="stat-icon active-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h4>Active</h4>
                <p className="stat-number">{studentsFromApi.filter(s => (!s.isBlocked) && getStudentStatus(s.lastLogin) === 'Active').length}</p>
              </div>
              <div className="stat-card clickable" onClick={() => setSelectedStat('inactive')}>
                <div className="stat-icon inactive-icon">
                  <i className="fas fa-times-circle"></i>
                </div>
                <h4>Not Active</h4>
                <p className="stat-number">{studentsFromApi.filter(s => (!s.isBlocked) && getStudentStatus(s.lastLogin) === 'Inactive').length}</p>
              </div>
              <div className="stat-card clickable" onClick={() => setSelectedStat('blocked')}>
                <div className="stat-icon blocked-icon">
                  <i className="fas fa-ban"></i>
                </div>
                <h4>Blocked</h4>
                <p className="stat-number">{studentsFromApi.filter(s => s.isBlocked).length}</p>
              </div>
              {/* Total Courses card removed per request */}
            </div>
            
            {/* Technology Enrollment Stats */}
            <div className="tech-popularity">
              <h3><i className="fas fa-chart-line"></i> Technology Enrollment</h3>
              {loadingEnrolledStats ? (
                <div className="loading-message"><i className="fas fa-spinner fa-spin"></i> Loading enrollment stats...</div>
              ) : filteredEnrolledStats.length > 0 ? (
                (() => {
                  const maxEnrolled = Math.max(...filteredEnrolledStats.map(s => s.enrolledCount));
                  return filteredEnrolledStats.map(stat => {
                    const courseCount = technologiesList.find(t => (t.name || '').toLowerCase() === (stat._id || '').toLowerCase())?.resources?.courses?.length || 0;
                    return (
                      <div key={stat._id} className="tech-stat">
                        <div className="tech-head">
                          <span className="tech-name">{stat._id}</span>
                          <span className="tech-meta">{courseCount} course{courseCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="popularity-bar">
                          <div 
                            className="popularity-fill" 
                            style={{ width: `${maxEnrolled > 0 ? Math.min((stat.enrolledCount / maxEnrolled) * 100, 100) : 0}%` }}
                          ></div>
                        </div>
                        <span className="tech-count">Enrolled Students: {stat.enrolledCount}</span>
                      </div>
                    );
                  });
                })()
              ) : (
                <p>No enrollment data available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messenger' && (
          <div className="messenger-section" style={{ height: '600px', padding: '20px' }}>
            <Messenger user={user} userType="admin" />
          </div>
        )}
      </div>
      
      {renderStudentDetail()}
      {renderStatDetails()}
      
      {courseModalData.student && (
        <div className="course-modal-overlay" onClick={() => setCourseModalData({ student: null, type: null })}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-modal-header">
              <h3>
                {courseModalData.type === 'completed' ? 'Completed Courses' : 'In-Progress Courses'}
              </h3>
              <button className="close-btn" onClick={() => setCourseModalData({ student: null, type: null })}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="course-modal-body">
              <p className="no-courses-msg">
                {courseModalData.type === 'completed' 
                  ? `No completed courses for ${courseModalData.student.name}` 
                  : `No in-progress courses for ${courseModalData.student.name}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;