import React, { useState, useEffect, useRef } from 'react';

const HeaderNotifications = ({ isAdmin }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [messages, setMessages] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const notificationRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const sendNotification = async (studentId, title, message) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/admin/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, title, message, type: 'general' })
      });
      if (!res.ok) {
        console.error('Failed to send notification');
        return;
      }
      // Optionally refresh or show success feedback
      // For now, just log
      const data = await res.json();
      console.log('Notification sent:', data);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  // Fetch all messages and meetings
  const fetchNotifications = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch all students first
      const studentsRes = await fetch(`${API_BASE_URL}/admin/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!studentsRes.ok) {
        console.error('Failed to fetch students');
        return;
      }

      const students = await studentsRes.json();

      // Fetch messages for each student
      const allMessages = [];
      const allMeetings = [];

      for (const student of students) {
        try {
          const messagesRes = await fetch(`${API_BASE_URL}/admin/messages/${student.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (messagesRes.ok) {
            const data = await messagesRes.json();
            if (data.messages && data.messages.length > 0) {
              allMessages.push({
                studentId: student.id,
                studentName: student.name || student.username,
                studentEmail: student.email,
                messages: data.messages,
                latestMessage: data.messages[data.messages.length - 1],
                unreadCount: data.messages.filter(m => m.sender === 'student').length
              });
            }

            // Extract meeting requests if available
            if (student.meetingRequests && student.meetingRequests.length > 0) {
              allMeetings.push({
                studentId: student.id,
                studentName: student.name || student.username,
                studentEmail: student.email,
                requests: student.meetingRequests
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching data for student ${student.id}:`, error);
        }
      }

      setMessages(allMessages);
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (showNotifications && isAdmin) {
      fetchNotifications();
    }
  }, [showNotifications, isAdmin]);

  if (!isAdmin) return null;

  const totalNotifications = messages.length + meetings.length;

  return (
    <div className="notification-container" ref={notificationRef}>
      <button 
        className="notification-btn"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <i className="fas fa-bell"></i>
        {totalNotifications > 0 && (
          <span className="notification-badge">{totalNotifications}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-panel">
          {/* Tabs */}
          <div className="notification-tabs">
            <button
              className={`notification-tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <i className="fas fa-envelope"></i>
              Messages
              {messages.length > 0 && <span className="badge">{messages.length}</span>}
            </button>
            <button
              className={`notification-tab ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              <i className="fas fa-calendar"></i>
              Meetings
              {meetings.length > 0 && <span className="badge">{meetings.length}</span>}
            </button>
          </div>

          {/* Content */}
          <div className="notification-content">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
              </div>
            ) : activeTab === 'messages' ? (
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>No messages</p>
                  </div>
                ) : (
                  messages.map((conversation) => (
                    <div key={conversation.studentId} className="message-item">
                      <div className="message-header">
                        <div className="student-avatar">
                          {conversation.studentName ? conversation.studentName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'S'}
                        </div>
                        <div className="message-info">
                          <h4>{conversation.studentName}</h4>
                          <p className="student-email">{conversation.studentEmail}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </div>
                      <div className="message-preview">
                        <p className="latest-message">
                          <strong>{conversation.latestMessage.sender === 'admin' ? 'You' : 'Student'}:</strong> {conversation.latestMessage.text}
                        </p>
                        <span className="message-time">
                          {new Date(conversation.latestMessage.timestamp).toLocaleDateString()}
                        </span>
                          </div>
                          <div className="message-actions">
                            <button className="notify-btn" onClick={() => sendNotification(conversation.studentId, 'Message from Admin', conversation.latestMessage.text || 'You have a message from admin')}>Notify</button>
                          </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="meetings-list">
                {meetings.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-calendar-check"></i>
                    <p>No meeting requests</p>
                  </div>
                ) : (
                  meetings.map((item) => (
                    <div key={item.studentId} className="meeting-item">
                      <div className="meeting-header">
                        <div className="student-avatar">
                          {item.studentName ? item.studentName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'S'}
                        </div>
                        <div className="meeting-info">
                          <h4>{item.studentName}</h4>
                          <p className="student-email">{item.studentEmail}</p>
                          </div>
                          <div className="meeting-actions">
                            <button className="notify-btn" onClick={() => sendNotification(item.studentId, 'Meeting Request', item.requests && item.requests.length > 0 ? item.requests[0].topic : 'Meeting request')}>Notify</button>
                          </div>
                      </div>
                      <div className="meetings-details">
                        {item.requests.map((request, idx) => (
                          <div key={idx} className="meeting-detail">
                            <div className="meeting-row">
                              <span><i className="fas fa-calendar-alt"></i> {request.date}</span>
                              <span><i className="fas fa-clock"></i> {request.time}</span>
                            </div>
                            <div className="meeting-row">
                              <span><i className="fas fa-tag"></i> {request.topic}</span>
                              <span className={`status-badge ${request.status}`}>{request.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="notification-footer">
            <button className="view-all-btn">
              <i className="fas fa-arrow-right"></i> View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNotifications;
