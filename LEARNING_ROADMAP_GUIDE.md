# Learning Portal - Roadmap Implementation Guide

## Overview
This is a complete step-by-step learning roadmap system for your React portal with MongoDB backend tracking.

## Features Implemented

✅ **Frontend Component** - `CourseRoadmap.jsx`
- Expandable/collapsible step-based learning interface
- Sequential step unlocking (must complete previous step)
- Progress tracking with visual indicators
- Detailed learning content for each step:
  - What you will learn (bullet points)
  - Practice tasks with checkboxes
  - YouTube resource links
  - Certification info
  - Action buttons (Start/Continue/Complete)

✅ **Roadmap Data** - `roadmapData.js`
- MERN Stack complete roadmap with 10 steps
- Easily expandable for other courses
- Includes resources, tasks, and learning outcomes

✅ **MongoDB Schema** - `LearningProgress.js`
- Track user progress per course
- Store step-by-step completion status
- Calculate overall progress percentage
- Issue certificates on completion
- Timestamps for tracking

✅ **Express Routes** - `learningProgress.js`
- GET progress for a course
- POST to start/complete steps
- Update progress percentage
- Add notes for steps
- Get overall learning statistics

---

## API Endpoints

### 1. Get Learning Progress
```
GET /api/learning-progress/:userId/:courseName
Authorization: Bearer {token}

Response:
{
  "1": {
    "status": "completed",
    "progress": 100,
    "startedAt": "2024-12-22T10:00:00Z",
    "completedAt": "2024-12-23T10:00:00Z"
  },
  "2": {
    "status": "in-progress",
    "progress": 45,
    "startedAt": "2024-12-23T10:00:00Z",
    "completedAt": null
  },
  "3": {
    "status": "not-started",
    "progress": 0,
    "startedAt": null,
    "completedAt": null
  },
  "overallProgress": 17,
  "currentStep": 2,
  "completedSteps": 1
}
```

### 2. Start Learning a Step
```
POST /api/learning-progress/start
Authorization: Bearer {token}

Request Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "courseName": "mern",
  "stepId": 1,
  "status": "in-progress"
}

Response:
{
  "success": true,
  "message": "Step started",
  "progress": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "courseName": "mern",
    "currentStep": 1,
    "overallProgress": 0,
    "completedSteps": 0
  }
}
```

### 3. Mark Step as Complete
```
POST /api/learning-progress/complete
Authorization: Bearer {token}

Request Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "courseName": "mern",
  "stepId": 1
}

Response:
{
  "success": true,
  "message": "Step completed",
  "progress": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "courseName": "mern",
    "currentStep": 2,
    "overallProgress": 10,
    "completedSteps": 1,
    "certificateEarned": false
  },
  "certificateEarned": false
}
```

### 4. Update Progress Percentage
```
POST /api/learning-progress/update-progress
Authorization: Bearer {token}

Request Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "courseName": "mern",
  "stepId": 2,
  "progress": 65
}

Response:
{
  "success": true,
  "message": "Progress updated",
  "progress": 65
}
```

### 5. Add Notes for Step
```
POST /api/learning-progress/add-note
Authorization: Bearer {token}

Request Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "courseName": "mern",
  "stepId": 1,
  "notes": "Learned about HTML5 semantic tags and forms"
}

Response:
{
  "success": true,
  "message": "Notes saved",
  "notes": "Learned about HTML5 semantic tags and forms"
}
```

### 6. Get Overall Statistics
```
GET /api/learning-progress/stats/:userId
Authorization: Bearer {token}

Response:
{
  "totalCourses": 3,
  "completedCourses": 1,
  "inProgressCourses": 1,
  "notStartedCourses": 1,
  "overallProgress": 45,
  "courses": [
    {
      "courseName": "mern",
      "progress": 20,
      "completedSteps": 2,
      "totalSteps": 10,
      "certificateEarned": false,
      "lastAccessedDate": "2024-12-23T10:00:00Z"
    },
    {
      "courseName": "python",
      "progress": 100,
      "completedSteps": 10,
      "totalSteps": 10,
      "certificateEarned": true,
      "lastAccessedDate": "2024-12-15T10:00:00Z"
    }
  ]
}
```

---

## MongoDB Schema Structure

```javascript
{
  _id: ObjectId,
  userId: ObjectId(ref: User),
  courseName: String("mern", "python", "java", "web", "dsa"),
  steps: [
    {
      stepId: Number,
      title: String,
      status: String("not-started", "in-progress", "completed"),
      startedAt: Date,
      completedAt: Date,
      progress: Number(0-100),
      completedTasks: [String],
      notes: String
    }
  ],
  currentStep: Number,
  overallProgress: Number(0-100),
  totalSteps: Number,
  completedSteps: Number,
  startedDate: Date,
  lastAccessedDate: Date,
  certificateEarned: Boolean,
  certificateDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## How to Use in Your Application

### 1. Import and Display Roadmap
```jsx
import CourseRoadmap from './components/CourseRoadmap';
import { useState } from 'react';

function App() {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('mern');

  const handleStartCourse = (courseName) => {
    setSelectedCourse(courseName);
    setShowRoadmap(true);
  };

  return (
    <div>
      {showRoadmap ? (
        <CourseRoadmap 
          courseName={selectedCourse}
          onBack={() => setShowRoadmap(false)}
        />
      ) : (
        // Your course cards/list here
        <button onClick={() => handleStartCourse('mern')}>
          Start MERN Stack
        </button>
      )}
    </div>
  );
}
```

### 2. Integrate with Your StudentTechnologies Component
In `StudentTechnologies.jsx`, update the button click handler:

```jsx
const handleTechnologyClick = (tech) => {
  if (tech.name === "MERN Stack") {
    navigate('/course-roadmap/mern');
  } else {
    // Handle other courses
  }
};
```

### 3. Add Route in App.jsx
```jsx
import CourseRoadmap from './components/CourseRoadmap';
import { useNavigate } from 'react-router-dom';

// In your routes:
<Route path="/course-roadmap/:courseName" element={<CourseRoadmap />} />
```

---

## MERN Stack Roadmap Steps

1. **HTML** (1-2 weeks)
   - HTML5 fundamentals
   - Forms and validation
   - SEO and accessibility

2. **CSS** (2-3 weeks)
   - Selectors, Box Model
   - Flexbox & Grid
   - Animations & responsive design

3. **Bootstrap/Tailwind** (1-2 weeks)
   - CSS frameworks
   - Pre-built components
   - Responsive design patterns

4. **JavaScript** (3-4 weeks)
   - ES6+ syntax
   - DOM manipulation
   - Async/Promises
   - APIs and fetch

5. **React.js** (3-4 weeks)
   - Components & JSX
   - Hooks (useState, useEffect)
   - React Router
   - State management

6. **Node.js** (2-3 weeks)
   - Node fundamentals
   - File system & streams
   - Package management
   - Server creation

7. **Express.js** (2-3 weeks)
   - Routing and middleware
   - REST APIs
   - Authentication
   - Error handling

8. **MongoDB** (2-3 weeks)
   - CRUD operations
   - Mongoose ODM
   - Data modeling
   - Query optimization

9. **MERN Full Stack Projects** (4-6 weeks)
   - Connect frontend & backend
   - Authentication & JWT
   - Deployment
   - Real-world projects

10. **DSA** (6-8 weeks)
    - Data structures
    - Algorithms
    - Problem solving
    - Interview prep

---

## Features to Extend

1. **Certificates**
   - Auto-generated on completion
   - PDF download support
   - Share on LinkedIn

2. **Leaderboard**
   - Track top learners
   - Achievements badges
   - Streak counter

3. **Community**
   - Q&A forum per step
   - Code reviews
   - Study groups

4. **Analytics**
   - Time spent per step
   - Completion rate
   - Resource popularity

5. **Gamification**
   - Points system
   - Badges
   - Challenges

---

## Testing the API

Use curl or Postman:

```bash
# Start learning
curl -X POST http://localhost:5000/api/learning-progress/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "courseName": "mern",
    "stepId": 1,
    "status": "in-progress"
  }'

# Get progress
curl http://localhost:5000/api/learning-progress/USER_ID/mern \
  -H "Authorization: Bearer YOUR_TOKEN"

# Complete step
curl -X POST http://localhost:5000/api/learning-progress/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "courseName": "mern",
    "stepId": 1
  }'
```

---

## Notes

- All timestamps are in ISO 8601 format
- Progress percentages are 0-100
- Sequential unlocking prevents skipping steps
- Certificates auto-issue on 100% completion
- All routes require authentication token
