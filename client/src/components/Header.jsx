import React, { useState, useRef, useEffect } from 'react';
import HeaderNotifications from './HeaderNotifications';
import StudentNotifications from './StudentNotifications';

const Header = ({ currentSection, setCurrentSection, user, userType, onLoginClick, onLogout, isAdmin }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const profileModalRef = useRef(null);
  const [certificates, setCertificates] = useState([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle outside click to close profile modal
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
        setShowProfile(false);
        setIsEditing(false);
        setEditedUser(user);
      }
    };

    if (showProfile) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showProfile, user, userType]);

  // Fetch uploaded certificates and prepare share link when profile modal opens
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!showProfile) return;
      if (userType !== 'student') return; // only fetch for student profiles
      try {
        setCertsLoading(true);
        const token = localStorage.getItem('authToken');
        const userObj = JSON.parse(localStorage.getItem('authUser')) || user;
        if (!userObj || !token) return;
        const res = await fetch(`http://localhost:5000/api/learning-progress/stats/${userObj._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const stats = await res.json();
        const certs = [];
        if (stats && stats.courses) {
          stats.courses.forEach(course => {
            (course.uploadedCertificates || []).forEach(c => {
              certs.push({ courseName: course.name, ...c });
            });
          });
        }
        setCertificates(certs);
        // prepare a simple share link (public profile route not required to exist)
        setShareLink(`${window.location.origin}/public-profile/${userObj._id}`);
      } catch (err) {
        console.error('Error fetching certificates for profile modal:', err);
      } finally {
        setCertsLoading(false);
      }
    };

    fetchCertificates();
  }, [showProfile, user]);

  const handleEditChange = (field, value) => {
    setEditedUser({
      ...editedUser,
      [field]: value
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Validation for students
      if (userType === 'student') {
        const email = (editedUser?.email || '').toLowerCase();
        if (!email.endsWith('@marwadiuniversity.ac.in')) {
          setMessage('Student email must end with @marwadiuniversity.ac.in');
          setLoading(false);
          return;
        }
        if (editedUser?.studentId && !/^\d{6}$/.test(String(editedUser.studentId))) {
          setMessage('Student ID must be exactly 6 digits');
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userType === 'student' ? (user?.name || editedUser.name) : editedUser.name,
          email: editedUser.email,
          username: editedUser.username,
          studentId: editedUser.studentId,
          dsaProfile: editedUser.dsaProfile
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setMessage(data.message || 'Error updating profile');
        return;
      }

      // Update user in localStorage
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setEditedUser(data.user);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
    setMessage('');
  };

  // View certificate binary in new tab
  const handleViewCertificate = async (id, filename) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return alert('You must be logged in to view certificates.');
      const res = await fetch(`http://localhost:5000/api/learning-progress/certificate/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || 'Failed to fetch certificate');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Error viewing certificate:', err);
      alert('Failed to open certificate: ' + (err.message || err));
    }
  };

  // Download certificate file
  const handleDownloadCertificate = async (id, filename) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return alert('You must be logged in to download certificates.');
      const res = await fetch(`http://localhost:5000/api/learning-progress/certificate/${id}?download=1`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || 'Failed to fetch certificate');
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
      alert('Failed to download certificate: ' + (err.message || err));
    }
  };
  return (
    <header className="header">
      <div className="container">
        <div 
          className="logo" 
          onClick={() => setCurrentSection('home')} 
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-graduation-cap"></i>
          <span>Pre-Placement Portal</span>
        </div>
        
        <div className="header-right">
        <nav className="nav">
          {!user ? (
            // Navigation for non-logged in users
            <>
              <button 
                className={currentSection === 'home' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setCurrentSection('home')}
              >
                Home
              </button>
              <button 
                className={currentSection === 'about' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setCurrentSection('about')}
              >
                About
              </button>
              <button 
                className={currentSection === 'contact' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setCurrentSection('contact')}
              >
                Contact
              </button>
              <button className="nav-btn login-btn" onClick={onLoginClick}>
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </>
          ) : (
            // Navigation for logged in users
            <>
              {isAdmin ? (
                <>
                  <button 
                    className={currentSection === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setCurrentSection('dashboard')}
                  >
                    <i className="fas fa-chart-bar"></i> Dashboard
                  </button>

                  <button 
                    className={currentSection === 'technologies' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setCurrentSection('technologies')}
                  >
                    <i className="fas fa-eye"></i> All Technologies
                  </button>

                  <button 
                    className={currentSection === 'technology-management' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => {
                      // set the app section so the header highlights correctly, then navigate
                      setCurrentSection('technology-management');
                      window.location.href = '/technology-management';
                    }}
                  >
                    <i className="fas fa-plus"></i> Manage Technologies
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={currentSection === 'technologies' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setCurrentSection('technologies')}
                  >
                    <i className="fas fa-laptop-code"></i> Technologies
                  </button>
                  
                  <button 
                    className={currentSection === 'progress' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setCurrentSection('progress')}
                  >
                    <i className="fas fa-chart-line"></i> Progress
                  </button>

                  <button 
                    className={currentSection === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setCurrentSection('dashboard')}
                  >
                    <i className="fas fa-comments"></i> Messages
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        <div className="user-section">
          {user ? (
            <>
              {isAdmin ? (
                <HeaderNotifications isAdmin={isAdmin} />
              ) : (
                <StudentNotifications />
              )}
              
              <div className="user-info" onClick={() => setShowProfile(!showProfile)} style={{ cursor: 'pointer' }}>
                <span className="user-type-badge">
                  {userType === 'student' ? (
                    <span className="initials-badge">
                      {user?.name
                        ? user.name
                            .split(' ')
                            .slice(0, 2)
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                        : 'S'}
                    </span>
                  ) : (
                    'Admin'
                  )}
                </span>
                <span className="user-name">{isAdmin ? user?.name || user?.username : `Welcome, ${user?.name}`}</span>
              </div>
              
              {showProfile && (
                <div className="profile-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
                  <div className="profile-modal" ref={profileModalRef} style={{ width: 'min(720px, 95%)', maxHeight: '85vh', overflowY: 'auto', borderRadius: '10px', background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', padding: '20px' }}>
                  <div className="profile-content">
                    <div className="profile-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e0e0e0' }}>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a3a52' }}>Profile</h2>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {userType === 'student' && !isEditing && (
                          <button 
                            className="edit-profile-btn"
                            onClick={() => setIsEditing(true)}
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="profile-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
                      <div className="profile-avatar">
                        {userType === 'student' ? (
                          <span className="avatar-initials">
                            {editedUser?.name
                              ? editedUser.name
                                  .split(' ')
                                  .slice(0, 2)
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                              : 'S'}
                          </span>
                        ) : (
                          <i className="fas fa-user-shield"></i>
                        )}
                      </div>
                      <div className="profile-info">
                        {isEditing && userType !== 'student' ? (
                          <input
                            type="text"
                            value={editedUser?.name || ''}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            placeholder="Full Name"
                            className="profile-edit-input"
                          />
                        ) : (
                          <h3>{editedUser?.name || editedUser?.username}</h3>
                        )}
                        <p className="profile-role">{userType === 'student' ? 'Student' : 'Administrator'}</p>
                      </div>
                    </div>
                    
                    {message && (
                      <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                        {message}
                      </div>
                    )}
                    
                    <div className="profile-details">
                      <div className="detail-item">
                        <label>Username:</label>
                        <span>{editedUser?.username}</span>
                      </div>

                      <div className="detail-item">
                        <label>Email:</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedUser?.email || ''}
                            onChange={(e) => handleEditChange('email', e.target.value)}
                            placeholder="Email"
                            className="profile-edit-input"
                          />
                        ) : (
                          <span>{editedUser?.email}</span>
                        )}
                      </div>

                      {userType === 'student' && editedUser?.studentId && (
                        <div className="detail-item">
                          <label>Student ID:</label>
                          <span>{editedUser.studentId}</span>
                        </div>
                      )}

                      {userType === 'student' && (
                        <div className="detail-item">
                          <label>DSA Profile:</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser?.dsaProfile || ''}
                              onChange={(e) => handleEditChange('dsaProfile', e.target.value)}
                              placeholder="e.g., LeetCode/GFG/HackerRank profile URL"
                              className="profile-edit-input"
                            />
                          ) : (
                            <span>
                              {editedUser?.dsaProfile ? (
                                <a href={editedUser.dsaProfile} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View DSA Profile</a>
                              ) : (
                                'Not provided'
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      {editedUser?.lastLogin && (
                        <div className="detail-item">
                          <label>Last Login:</label>
                          <span>{new Date(editedUser.lastLogin).toLocaleString()}</span>
                        </div>
                      )}

                      {editedUser?.createdAt && (
                        <div className="detail-item">
                          <label>Member Since:</label>
                          <span>{new Date(editedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                      {userType === 'student' && (
                        <div style={{ marginTop: '18px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                          <h4 style={{ margin: '6px 0 12px', color: '#1a3a52' }}>Certificates</h4>
                          {certsLoading ? (
                            <div style={{ color: '#666' }}>Loading certificates...</div>
                          ) : certificates.length === 0 ? (
                            <div style={{ color: '#777' }}>No certificates uploaded.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {certificates.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', padding: '8px 10px', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700 }}>{c.filename}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{c.courseName} • {new Date(c.uploadedAt).toLocaleString()}</div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleViewCertificate(c.certificateId, c.filename)} style={{ padding: '6px 10px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>View</button>
                                    <button onClick={() => handleDownloadCertificate(c.certificateId, c.filename)} style={{ padding: '6px 10px', background: '#6c757d', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Download</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: '14px' }}>
                            <h4 style={{ margin: '6px 0 8px', color: '#1a3a52' }}>Share Profile</h4>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input value={shareLink} readOnly style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }} />
                              <button onClick={async () => { try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { console.error('Copy failed', e); } }} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}>{copied ? 'Copied' : 'Copy'}</button>
                              <button onClick={() => { const subject = encodeURIComponent('Profile from Pre-Placement Portal'); const body = encodeURIComponent(`Please review this candidate profile: ${shareLink}`); window.location.href = `mailto:?subject=${subject}&body=${body}`; }} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}>Share via Email</button>
                            </div>
                          </div>
                        </div>
                      )}
                    
                    <div className="profile-actions" style={{ display: 'flex', gap: '12px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                      {isEditing ? (
                        <>
                          <button 
                            className="save-profile-btn"
                            onClick={handleSaveProfile}
                            disabled={loading}
                            style={{
                              flex: 1,
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              padding: '12px 16px',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              opacity: loading ? 0.7 : 1,
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
                          >
                            <i className="fas fa-save"></i> {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            className="cancel-profile-btn"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            style={{
                              flex: 1,
                              backgroundColor: '#f5f5f5',
                              color: '#666',
                              border: '1px solid #e0e0e0',
                              padding: '12px 16px',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              opacity: loading ? 0.7 : 1,
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#e8e8e8', e.currentTarget.style.borderColor = '#d0d0d0')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5', e.currentTarget.style.borderColor = '#e0e0e0')}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          className="logout-profile-btn"
                          onClick={() => {
                            setShowProfile(false);
                            onLogout();
                          }}
                          style={{
                            width: '100%',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c0392b', e.currentTarget.style.transform = 'translateY(-2px)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e74c3c', e.currentTarget.style.transform = 'translateY(0)')}
                        >
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </>
          ) : null}
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;