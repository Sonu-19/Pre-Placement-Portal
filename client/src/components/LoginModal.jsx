import React, { useState } from 'react';
import { authUtils } from '../utils/auth.jsx';

const LoginModal = ({ onClose, onLogin }) => {
  const [loginType, setLoginType] = useState('student');
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    dsaProfile: '',
    name: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      // Signup validation
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
      }
      if (loginType === 'student' && !formData.studentId) {
        alert('Student ID is required!');
        return;
      }
      try {
        const result = await authUtils.signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          userType: loginType,
          studentId: loginType === 'student' ? formData.studentId : undefined,
          dsaProfile: loginType === 'student' ? formData.dsaProfile : undefined,
          name: formData.name || formData.username
        });
        alert(`Successfully registered as ${loginType}! You can now login.`);
        // Dispatch event for new student signup
        if (loginType === 'student') {
          window.dispatchEvent(new CustomEvent('studentLoggedIn', { detail: { user: result.user } }));
          window.dispatchEvent(new Event('statsUpdated'));
        }
        // Auto-login after signup
        onLogin(result.user, loginType);
        onClose();
        setIsSignup(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          studentId: '',
          dsaProfile: '',
          name: ''
        });
      } catch (err) {
        alert(err.message || 'Signup failed');
      }
    } else {
      // Login validation
      if (!formData.username || !formData.password) {
        alert('Please enter both username and password!');
        return;
      }

      try {
        const result = await authUtils.login({
          username: formData.username,
          password: formData.password,
          userType: loginType
        });
        // Dispatch event for student login
        if (loginType === 'student') {
          window.dispatchEvent(new CustomEvent('studentLoggedIn', { detail: { user: result.user } }));
          window.dispatchEvent(new Event('statsUpdated'));
        }
        // Pass the user data from the login response to the parent component
        onLogin(result.user, loginType);
        onClose();
      } catch (err) {
        alert(err.message || 'Login failed');
      }
    }
  };

  const switchToSignup = () => {
    setIsSignup(true);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentId: '',
      dsaProfile: '',
      name: ''
    });
  };

  const switchToLogin = () => {
    setIsSignup(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentId: '',
      dsaProfile: '',
      name: ''
    });
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isSignup ? 'Sign Up' : 'Login to Portal'}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="login-type-selector">
          <button 
            className={loginType === 'student' ? 'type-btn active' : 'type-btn'}
            onClick={() => setLoginType('student')}
          >
            <i className="fas fa-user-graduate"></i> Student {isSignup ? 'Signup' : 'Login'}
          </button>
          <button 
            className={loginType === 'admin' ? 'type-btn active' : 'type-btn'}
            onClick={() => setLoginType('admin')}
          >
            <i className="fas fa-user-tie"></i> Admin {isSignup ? 'Signup' : 'Login'}
          </button>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-user"></i> Full Name
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i> Username
            </label>
            <input 
              type="text" 
              id="username" 
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username" 
              required 
            />
          </div>
          
          {isSignup && loginType === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="studentId">
                  <i className="fas fa-id-card"></i> Student ID
                </label>
                <input 
                  type="text" 
                  id="studentId" 
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="Enter your student ID" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="dsaProfile">
                  <i className="fas fa-code"></i> DSA Profile URL / ID
                </label>
                <input 
                  type="text" 
                  id="dsaProfile" 
                  name="dsaProfile"
                  value={formData.dsaProfile}
                  onChange={handleInputChange}
                  placeholder="e.g. LeetCode / GFG / HackerRank profile link or ID"
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Password
            </label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password" 
              required 
            />
          </div>
          
          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password" 
                required 
              />
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {isSignup ? 'Sign Up' : 'Login'} as {loginType === 'student' ? 'Student' : 'Admin'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="auth-switch">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"} 
            <button 
              type="button" 
              className="switch-btn"
              onClick={isSignup ? switchToLogin : switchToSignup}
            >
              {isSignup ? 'Login here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;