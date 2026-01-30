import React, { useState, useEffect, useRef } from 'react';
import './StudentNotifications.css';

const StudentNotifications = ({}) => {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { title, message }
  const [usePolling, setUsePolling] = useState(false);
  const pollRef = useRef(null);
  const ref = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const AUTO_OPEN_TYPES = (import.meta.env.VITE_NOTIFICATION_AUTOOPEN_TYPES || 'technology,meeting').split(',').map(s => s.trim()).filter(Boolean);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/auth/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const fetched = data.notifications || [];

      // Merge without duplicates (by _id) and sort by createdAt desc
      const map = new Map();
      [...fetched, ...notifications].forEach(n => {
        if (n && n._id) map.set(n._id, n);
      });
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(merged);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  useEffect(() => {
    let es;
    let sseFailed = false;

    const startPolling = () => {
      if (pollRef.current) return;
      // poll every 10s
      pollRef.current = setInterval(() => {
        fetchNotifications();
      }, 10000);
      setUsePolling(true);
    };

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setUsePolling(false);
    };

    const token = localStorage.getItem('authToken');
    if (!token) {
      // no token — can't open SSE; fallback to polling only when user exists
      startPolling();
      return () => stopPolling();
    }

    // Try SSE if supported
    if (typeof EventSource !== 'undefined') {
      try {
        es = new EventSource(`${API_BASE_URL}/notifications/stream?token=${token}`);
      } catch (err) {
        console.warn('Failed to create EventSource', err);
        sseFailed = true;
      }
    } else {
      sseFailed = true;
    }

    if (sseFailed || !es) {
      startPolling();
      return () => stopPolling();
    }

    es.onopen = () => {
      console.log('SSE connected');
      stopPolling();
    };

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (!payload || !payload._id) return;

        setNotifications(prev => {
          // ignore duplicates
          if (prev.find(p => p._id === payload._id)) return prev;
          const merged = [payload, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return merged;
        });

        // show toast
        setToast({ title: payload.title, message: payload.message });
        // auto-open panel when new notification arrives only for configured types
        if (!payload.type || AUTO_OPEN_TYPES.includes(payload.type)) {
          setShow(true);
        }

        // hide toast after 4s
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        console.error('Invalid SSE payload', err);
      }
    };

    es.onerror = (err) => {
      console.warn('SSE error', err);
      try { es.close(); } catch (e) {}
      startPolling();
    };

    // If the panel is opened, fetch notifications immediately
    if (show) fetchNotifications();

    return () => {
      try { if (es) es.close(); } catch (err) {}
      stopPolling();
    };
  }, [show]);

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/auth/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // mark all as read
  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/auth/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <div className="notification-container" ref={ref}>
      <button className="notification-btn" onClick={() => setShow(!show)}>
        <i className="fas fa-bell"></i>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
        )}
      </button>
      {show && (
        <div className="notification-panel">
          <div className="notification-header">
            <strong>Notifications</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="mark-all-btn" onClick={markAllRead}>Mark all read</button>
              <button className="close-panel-btn" onClick={() => setShow(false)}>Close</button>
            </div>
          </div>
          <div className="notification-content">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                  <div className="notification-main">
                    <h4>{n.title}</h4>
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                  {!n.read && (
                    <button className="mark-read-btn" onClick={() => markRead(n._id)}>Mark read</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast for incoming notifications */}
      {toast && (
        <div className="notification-toast">
          <strong className="toast-title">{toast.title}</strong>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* Polling indicator */}
      {usePolling && <div className="polling-indicator" title="Using polling for notifications"></div>}
    </div>
  );
};

export default StudentNotifications;
