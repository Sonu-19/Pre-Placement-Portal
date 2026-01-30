// Dashboard Component for Students
import React, { useState } from 'react';
import Messenger from './Messenger';

const StudentDashboard = ({ user, currentView, setCurrentView }) => {
  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-content">
          <div className="messenger-section">
            <h2>Messages</h2>
            <Messenger user={user} userType="student" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;