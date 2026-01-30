import React, { useState, useEffect } from 'react';

const StudentDetailModal = ({ student, isOpen, onClose, initialTab = 'overview' }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showCompletedCourses, setShowCompletedCourses] = useState(false);
  const [showInProgressCourses, setShowInProgressCourses] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview', 'messages'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Load messages when student is selected and set active tab
  useEffect(() => {
    if (isOpen && student) {
      loadMessages();
      setActiveTab(initialTab);
    }
  }, [isOpen, student, initialTab]);


  const loadMessages = async () => {
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/messages/${student.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to load messages');
        setMessages([]);
        return;
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const newMessage = {
      text: message,
      sender: 'admin',
      timestamp: new Date()
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: student.id,
          message: message,
          sender: 'admin'
        })
      });

      if (!response.ok) {
        console.error('Failed to save message');
        return;
      }

      // Add message to local state
      setMessages([...messages, newMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="student-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-student-info">
            <div className="modal-avatar">
              {student.name ? student.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'S'}
            </div>
            <div className="modal-student-details">
              <h2>{student.name || student.username}</h2>
              <a href={`mailto:${student.email}`} className="email-link">
                <i className="fas fa-envelope"></i> {student.email}
              </a>
              {student.studentId && <p className="student-id">ID: {student.studentId}</p>}
              {student.lastLogin && <p className="last-login">Last Login: {new Date(student.lastLogin).toLocaleDateString()} {new Date(student.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Main Content */}
        <div className="modal-body">
          {/* Tab Navigation */}
          <div className="modal-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-info-circle"></i> Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <i className="fas fa-comments"></i> Messages
            </button>
            
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
          {/* Courses and DSA Section */}
          <div className="student-courses-section">
            <div className="course-info-card clickable" onClick={() => setShowCompletedCourses(true)}>
              <div className="course-info-header">
                <h3><i className="fas fa-check-circle"></i> Completed Courses</h3>
                <span className="course-badge">0</span>
              </div>
              <div className="course-list">
                <p className="no-courses">No completed courses yet</p>
              </div>
            </div>

            <div className="course-info-card clickable" onClick={() => setShowInProgressCourses(true)}>
              <div className="course-info-header">
                <h3><i className="fas fa-hourglass-half"></i> In-Progress Courses</h3>
                <span className="course-badge">0</span>
              </div>
              <div className="course-list">
                <p className="no-courses">No courses in progress</p>
              </div>
            </div>

            <div className="dsa-info-card">
              <div className="dsa-info-header">
                <h3><i className="fas fa-code"></i> DSA Profile</h3>
              </div>
              <div className="dsa-link-container">
                {student.dsaProfile ? (
                  <a href={student.dsaProfile} className="dsa-profile-btn">
                    <i className="fas fa-external-link-alt"></i> View DSA Profile
                  </a>
                ) : (
                  <p className="no-dsa">No DSA profile linked</p>
                )}
              </div>
            </div>
          </div>

          {/* Student Details Section - Overview Tab */}
          <div className="modal-content-grid">
            <div className="details-section">
              <h3><i className="fas fa-user-details"></i> Student Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Email</label>
                  <p>{student.email}</p>
                </div>
                <div className="detail-item">
                  <label>Student ID</label>
                  <p>{student.studentId || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Member Since</label>
                  <p>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Last Login</label>
                  <p>{student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                {student.dsaProfile && (
                  <div className="detail-item full-width">
                    <label>DSA Profile</label>
                    <a href={student.dsaProfile} target="_blank" rel="noopener noreferrer" className="dsa-link">
                      <i className="fas fa-external-link-alt"></i> View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            
          </div>
            </>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
          <div className="chat-section">
            <h3><i className="fas fa-comments"></i> Message</h3>
            <div className="chat-messages">
              {messagesLoading ? (
                <div className="loading-messages">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  <i className="fas fa-inbox"></i>
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.sender}`}>
                    <p>{msg.text}</p>
                    <span className="timestamp">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input-group">
              <input 
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="send-message-btn"
                onClick={handleSendMessage}
                disabled={!message.trim() || loading}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          )}

          

          {/* Completed Courses Modal */}
          {showCompletedCourses && (
            <div className="course-modal-overlay" onClick={() => setShowCompletedCourses(false)}>
              <div className="course-modal" onClick={(e) => e.stopPropagation()}>
                <div className="course-modal-header">
                  <h3><i className="fas fa-check-circle"></i> Completed Courses - {student.name || student.username}</h3>
                  <button className="modal-close" onClick={() => setShowCompletedCourses(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="course-modal-body">
                  <p className="no-courses-message">No completed courses yet</p>
                </div>
              </div>
            </div>
          )}

          {/* In-Progress Courses Modal */}
          {showInProgressCourses && (
            <div className="course-modal-overlay" onClick={() => setShowInProgressCourses(false)}>
              <div className="course-modal" onClick={(e) => e.stopPropagation()}>
                <div className="course-modal-header">
                  <h3><i className="fas fa-hourglass-half"></i> In-Progress Courses - {student.name || student.username}</h3>
                  <button className="modal-close" onClick={() => setShowInProgressCourses(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="course-modal-body">
                  <p className="no-courses-message">No courses in progress</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
