import React, { useState, useEffect, useRef } from 'react';
import './Messenger.css';

const Messenger = ({ user, userType }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [previousMessageCounts, setPreviousMessageCounts] = useState({});
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const selectedConversationRef = useRef(null);
  const previousConversationsSignatureRef = useRef('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // Poll for new messages every 5 seconds (reduced frequency to avoid frequent re-renders)
    const POLL_INTERVAL = 5000;
    const interval = setInterval(loadConversations, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages length increases (use immediate scroll to avoid shaking)
  useEffect(() => {
    try {
      const el = messagesContainerRef.current;
      const newLen = selectedConversation?.messages?.length || 0;
      const prevLen = prevMessagesLengthRef.current || 0;

      // Only auto-scroll when new messages are added (length increased) or when opening a conversation first time
      if (el && newLen > prevLen) {
        // use rAF to avoid layout thrashing
        window.requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      }

      // update ref
      prevMessagesLengthRef.current = newLen;
    } catch (err) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [selectedConversation?.messages?.length]);

  // Keep ref in sync with selected conversation
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Mark messages as read when a conversation is opened
  useEffect(() => {
    const markRead = async () => {
      try {
        if (!selectedConversation) return;
        const token = localStorage.getItem('authToken');

        if (userType === 'student') {
          await fetch(`${API_BASE_URL}/auth/messages/read`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else if (userType === 'admin') {
          // Tell server that admin has opened this student's conversation so student->admin messages become read
          await fetch(`${API_BASE_URL}/admin/messages/read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentId: selectedConversation.id })
          });
        }

        // reload conversations to get updated read flags
        await loadConversations();
      } catch (err) {
        console.error('Error marking messages read:', err);
      }
    };

    markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const endpoint = userType === 'admin' 
        ? `${API_BASE_URL}/admin/conversations`
        : `${API_BASE_URL}/auth/conversations`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to load conversations');
        return;
      }

      const data = await response.json();
      const newConversations = data.conversations || [];
      
      // Sort conversations by latest message date (most recent first)
      newConversations.sort((a, b) => {
        const aLastMessage = a.messages && a.messages.length > 0 ? a.messages[a.messages.length - 1] : null;
        const bLastMessage = b.messages && b.messages.length > 0 ? b.messages[b.messages.length - 1] : null;
        
        const aTime = aLastMessage ? new Date(aLastMessage.createdAt).getTime() : 0;
        const bTime = bLastMessage ? new Date(bLastMessage.createdAt).getTime() : 0;
        
        return bTime - aTime; // Most recent first
      });
      
      // Check for new messages and show notifications
      newConversations.forEach(conv => {
        const prevCount = previousMessageCounts[conv.id] || 0;
        const currentCount = conv.messages?.length || 0;
        
        if (currentCount > prevCount && prevCount > 0) {
          // New message detected - show notification
          const lastMessage = conv.messages[conv.messages.length - 1];
          if (lastMessage && lastMessage.sender !== userType) {
            const notificationId = Date.now();
            const newNotification = {
              id: notificationId,
              name: conv.name,
              message: lastMessage.message,
              conversationId: conv.id
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            // Auto-remove notification after 5 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }, 5000);
          }
        }
      });
      
      // Update previous message counts
      // Compute a lightweight signature for the conversations list so we can avoid
      // updating React state when nothing meaningful changed (prevents continuous re-renders/shaking)
      const signature = newConversations.map(c => {
        const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
        const lastTs = lastMsg ? new Date(lastMsg.createdAt).getTime() : 0;
        return `${c.id}-${(c.messages?.length || 0)}-${c.unread || 0}-${lastTs}`;
      }).join('|');

      if (signature === previousConversationsSignatureRef.current) {
        // No meaningful change; avoid updating state to prevent reflow / shaking
        return;
      }

      previousConversationsSignatureRef.current = signature;

      const newCounts = {};
      newConversations.forEach(conv => {
        newCounts[conv.id] = conv.messages?.length || 0;
      });
      setPreviousMessageCounts(newCounts);

      setConversations(newConversations);
      
      // Preserve selected conversation or select the first one
      if (selectedConversationRef.current?.id) {
        // Find the updated version of the selected conversation
        const updatedSelected = newConversations.find(c => c.id === selectedConversationRef.current.id);
        if (updatedSelected) {
          setSelectedConversation(updatedSelected);
        }
      } else if (newConversations.length > 0) {
        setSelectedConversation(newConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const endpoint = userType === 'admin'
        ? `${API_BASE_URL}/admin/messages`
        : `${API_BASE_URL}/auth/messages`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [userType === 'admin' ? 'studentId' : 'adminId']: selectedConversation.id,
          message: message,
          sender: userType
        })
      });

      if (!response.ok) {
        console.error('Failed to send message');
        return;
      }

      // Clear input and reload conversations
      setMessage('');
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNotificationClick = (conversationId, notificationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="messenger-container">
      {/* Notifications Container */}
      <div className="notifications-container">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className="notification"
            onClick={() => handleNotificationClick(notif.conversationId, notif.id)}
          >
            <div className="notification-content">
              <h4>{notif.name}</h4>
              <p>{notif.message}</p>
            </div>
            <button 
              className="notification-close"
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notif.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="messenger-main-wrapper">
        <div className="messenger-sidebar">
          <h2>Conversations</h2>
        {conversationsLoading && <div className="loading">Loading...</div>}
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              {userType === 'admin' ? 'No student conversations' : 'No admin messages'}
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedConversation(conv);
                }}
              >
                <div className="conversation-avatar">
                  {conv.name ? conv.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="conversation-info">
                  <h4>{conv.name}</h4>
                  <p className="conversation-email">{conv.email}</p>
                  {conv.lastMessage && (
                    <p className="conversation-preview">{conv.lastMessage}</p>
                  )}
                </div>
                {conv.unread > 0 && (
                  <span className="unread-badge">{userType === 'admin' ? '1' : conv.unread}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="messenger-main">
        {selectedConversation ? (
          <>
            <div className="messenger-header">
              <h3>{selectedConversation.name}</h3>
              <p>{selectedConversation.email}</p>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {selectedConversation.messages && selectedConversation.messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                selectedConversation.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === userType ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {msg.message || msg.text}
                    </div>
                    <div className="message-time">
                      {new Date(msg.createdAt || msg.timestamp).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {msg.sender === userType && (
                        <span className={`message-status ${msg.read ? 'read' : msg.delivered ? 'delivered' : 'sent'}`}>
                          {msg.read ? '✓✓' : msg.delivered ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                rows="3"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !message.trim()}
                className="send-button"
              >
                <i className="fas fa-paper-plane"></i> Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Messenger;
