// components/ProgressTracker.js
import React from 'react';

const ProgressTracker = ({ user }) => {
  // Mock progress data
  const progressData = {
    'MERN Stack': {
      completed: 65,
      resourcesCompleted: 12,
      totalResources: 20,
      lastActivity: '2023-06-15',
      nextMilestone: 'Build a full-stack application'
    },
    'DSA': {
      completed: 40,
      resourcesCompleted: 8,
      totalResources: 20,
      lastActivity: '2023-06-10',
      nextMilestone: 'Complete 50 problems on LeetCode'
    }
  };

  const practiceStats = {
    hackerrank: {
      problemsSolved: 45,
      rank: 'Gold',
      lastSubmission: '2023-06-14'
    },
    leetcode: {
      problemsSolved: 23,
      rank: 'Silver',
      lastSubmission: '2023-06-12'
    }
  };

  const adminSuggestions = [
    {
      date: '2023-06-01',
      message: 'Focus on React hooks and state management for your project.',
      admin: 'Admin User'
    },
    {
      date: '2023-05-20',
      message: 'Practice array and string manipulation problems on HackerRank.',
      admin: 'Admin User'
    }
  ];

  const upcomingMeetings = [
    {
      date: '2023-06-20',
      time: '14:00',
      topic: 'MERN Stack project review'
    }
  ];

  return (
    <div className="progress-tracker">
      <h2>Your Learning Progress</h2>
      
      <div className="progress-overview">
        <h3>Technologies Progress</h3>
        <div className="progress-cards">
          {Object.entries(progressData).map(([tech, data]) => (
            <div key={tech} className="progress-card">
              <h4>{tech}</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${data.completed}%` }}
                ></div>
              </div>
              <p>{data.completed}% Complete</p>
              <p>{data.resourcesCompleted}/{data.totalResources} Resources</p>
              <p>Last Activity: {data.lastActivity}</p>
              <div className="milestone">
                <strong>Next Milestone:</strong> {data.nextMilestone}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="practice-platforms">
        <h3>Practice Platform Stats</h3>
        <div className="platform-cards">
          {Object.entries(practiceStats).map(([platform, stats]) => (
            <div key={platform} className="platform-card">
              <h4>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
              <div className="stat">
                <span>Problems Solved:</span>
                <span>{stats.problemsSolved}</span>
              </div>
              <div className="stat">
                <span>Rank:</span>
                <span className={`rank ${stats.rank.toLowerCase()}`}>{stats.rank}</span>
              </div>
              <div className="stat">
                <span>Last Submission:</span>
                <span>{stats.lastSubmission}</span>
              </div>
              <a 
                href={`https://${platform}.com`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="practice-link"
              >
                Continue Practicing <i className="fas fa-external-link-alt"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
      
      <div className="admin-interaction">
        <div className="suggestions">
          <h3>Admin Suggestions</h3>
          {adminSuggestions.length > 0 ? (
            <div className="suggestions-list">
              {adminSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-header">
                    <span className="admin-name">{suggestion.admin}</span>
                    <span className="suggestion-date">{suggestion.date}</span>
                  </div>
                  <p>{suggestion.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No suggestions from admin yet.</p>
          )}
        </div>
        
        <div className="meetings">
          <h3>Upcoming Meetings</h3>
          {upcomingMeetings.length > 0 ? (
            <div className="meetings-list">
              {upcomingMeetings.map((meeting, index) => (
                <div key={index} className="meeting-item">
                  <div className="meeting-date">
                    <i className="fas fa-calendar-alt"></i>
                    {meeting.date} at {meeting.time}
                  </div>
                  <div className="meeting-topic">
                    <i className="fas fa-comments"></i>
                    {meeting.topic}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No upcoming meetings scheduled.</p>
          )}
        </div>
      </div>
      
      <div className="id-reminder">
        <div className="reminder-card">
          <h4><i className="fas fa-id-card"></i> Important Reminder</h4>
          <p>Make sure to use your student ID <strong>{user.id}</strong> when practicing on external platforms.</p>
          <p>This allows the admin to track your progress and provide personalized guidance.</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;