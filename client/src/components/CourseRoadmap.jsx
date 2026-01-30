import React, { useState, useEffect, useRef } from 'react';
import MCQTest from './MCQTest';
import { roadmapData } from '../data/roadmapData';
import { authUtils } from '../utils/auth.jsx';
import './CourseRoadmap.css';

const CourseRoadmap = ({ courseName = 'mern', onBack }) => {
  const [steps, setSteps] = useState([]);
  const [expandedStep, setExpandedStep] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render
  const [activeMCQ, setActiveMCQ] = useState(null);
  const [showMCQModal, setShowMCQModal] = useState(false);
  const [mcqResults, setMcqResults] = useState({});
  const mcqRef = useRef(null);
  const formatTime = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Load roadmap data. If exact key is missing, try a best-effort lookup
    const requested = String(courseName || '').toLowerCase();
    let key = requested;
    let course = roadmapData[key];

    if (!course) {
      // Try to find a roadmap whose key includes the requested name
      const keys = Object.keys(roadmapData);
      const matchByKey = keys.find(k => k.toLowerCase().includes(requested));
      const matchByTitle = keys.find(k => (roadmapData[k].title || '').toLowerCase().includes(requested));
      const foundKey = matchByKey || matchByTitle;
      if (foundKey) {
        console.warn(`[CourseRoadmap] courseName '${courseName}' not found, using fallback '${foundKey}'`);
        key = foundKey;
        course = roadmapData[key];
      }
    }

    if (course) {
      setSteps(course.steps);
      // Fetch user progress from API
      const loadProgress = async () => {
        await fetchUserProgress();
        setLoading(false);
        // fetch previously saved MCQ results for this user & course
        await fetchMcqResults();
      };
      loadProgress();
    } else {
      // Course roadmap not found
      console.warn(`[CourseRoadmap] No roadmap available for '${courseName}'`);
      setSteps([]);
      setLoading(false);
    }
  }, [courseName]);

  // Monitor progress changes
  useEffect(() => {
    console.log('[RENDER] userProgress updated:', userProgress);
    if (userProgress.steps) {
      console.log('[RENDER] Total steps in progress:', userProgress.steps.length);
      console.log('[RENDER] Completed count:', userProgress.completedSteps);
      console.log('[RENDER] Overall progress:', userProgress.overallProgress);
    }
  }, [userProgress, refreshTrigger]);

  const fetchUserProgress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('authUser'));
      const token = localStorage.getItem('authToken');
      
      if (!user || !token) {
        console.warn('User not authenticated');
        return;
      }

      const userId = user._id;
      const response = await fetch(`http://localhost:5000/api/learning-progress/${userId}/${courseName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`[FETCH-PROGRESS] Course: ${courseName}, Total: ${data.totalSteps}, Completed: ${data.completedSteps}, Overall: ${data.overallProgress}%`);
        console.log('User progress loaded with steps:', data.steps.length);
        data.steps.forEach(step => {
          console.log(`  - Step ${step.stepId}: ${step.status}`);
        });
        setUserProgress(data);
      } else {
        console.error(`[ERROR] Failed to fetch progress for ${courseName}`);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const fetchMcqResults = async () => {
    try {
      const currentUser = authUtils.getCurrentUser();
      if (!currentUser) return;
      const resp = await fetch('http://localhost:5000/api/mcq-results');
      if (!resp.ok) return;
      const all = await resp.json();
      // build a map of testId -> result for this user
      const userResults = all.filter(r => r.userId === currentUser._id || (r.userId && r.userId._id === currentUser._id));
      const map = {};
      userResults.forEach(r => {
        if (r.testId) map[r.testId] = {
          score: r.score,
          totalQuestions: r.totalQuestions,
          percentage: r.percentage,
          timeTaken: r.timeTaken
        };
      });
      setMcqResults(map);
    } catch (e) {
      console.error('Error fetching MCQ results', e);
    }
  };

  // Mark a specific video as watched (key: `${stepId}_${resourceIdx}`)
  const markVideoWatched = (key) => {
    setWatchedVideos(prev => ({ ...prev, [key]: true }));
  };

  const areAllStepVideosWatched = (step) => {
    if (!step || !step.resources) return true;
    const videoResources = step.resources.filter(r => (r.type === 'video' || r.src) && (r.src || r.link));
    if (videoResources.length === 0) return true;
    // require local src videos to be watched; use step.id + index to identify
    return videoResources.every((res, idx) => {
      const key = `${step.id}_${idx}`;
      // if resource has a src (local uploaded), require watched flag; if only external link, treat as not required
      if (res.src) {
        return !!watchedVideos[key];
      }
      return true;
    });
  };

  const handleStartStep = async (stepId) => {
    try {
      console.log('Starting step:', stepId);
      const user = JSON.parse(localStorage.getItem('authUser'));
      const token = localStorage.getItem('authToken');
      
      console.log('User:', user);
      console.log('Token:', token);
      
      if (!user || !token) {
        alert('Please log in to continue');
        return;
      }

      const userId = user._id;
      const step = steps.find(s => s.id === stepId);
      
      const payload = {
        userId,
        courseName,
        stepId,
        title: step?.title || `Step ${stepId}`,
        totalSteps: steps.length,
        status: 'in-progress'
      };
      
      console.log('Making API call with payload:', payload);
      
      const response = await fetch('http://localhost:5000/api/learning-progress/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        console.log('Step started successfully:', data);
        
        // Immediately update UI
        setUserProgress(data);
        setRefreshTrigger(prev => prev + 1);
        
        // Also fetch fresh data after a small delay
        setTimeout(() => {
          fetchUserProgress();
        }, 500);
      } else {
        const errorMsg = data.message || JSON.stringify(data);
        console.error('Error response:', errorMsg);
        alert('Error starting step: ' + errorMsg);
      }
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      alert('Error: ' + err.message);
    }
  };

  const handleCompleteStep = async (stepId) => {
    try {
      const user = JSON.parse(localStorage.getItem('authUser'));
      const token = localStorage.getItem('authToken');
      
      if (!user || !token) {
        alert('Please log in to continue');
        return;
      }

      console.log(`[COMPLETE-CLICK] Step ${stepId} for ${courseName}`);
      
      const response = await fetch('http://localhost:5000/api/learning-progress/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseName,
          stepId
        })
      });

      console.log('Complete response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Step completed successfully:', data);
        console.log(`Progress updated: ${data.completedSteps}/${data.totalSteps} = ${data.overallProgress}%`);
        
        // Immediately update UI and trigger re-render after API response
        setUserProgress(data);
        
        // Trigger component re-render
        setRefreshTrigger(prev => prev + 1);
        
        // Also fetch fresh data after a small delay to ensure DB is synced
        setTimeout(() => {
          fetchUserProgress();
        }, 500);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert('Error completing step: ' + error.message);
      }
    } catch (err) {
      console.error('Error completing step:', err);
      alert('Error: ' + err.message);
    }
  };

  const getStepStatus = (stepId) => {
    if (!userProgress || !userProgress.steps) return '';
    const step = userProgress.steps.find(s => s.stepId === stepId);
    return step?.status || '';
  };
  const isCertificationStep = (step) => /certification/i.test(step.title);

  // Core steps exclude certification steps for progress calculations
  const coreSteps = steps.filter(s => !isCertificationStep(s));

  const isStepUnlocked = (step) => {
    // Admins: all steps locked for actions
    if (!isStudentUser) return false;

    if (isCertificationStep(step)) {
      // Certification step unlocks only after all core steps are completed
      const completedCore = coreSteps.filter(cs => getStepStatus(cs.id) === 'completed').length;
      return completedCore === coreSteps.length;
    }

    // For core steps: first core step unlocked, subsequent unlock when previous core completed.
    const indexInCore = coreSteps.findIndex(cs => cs.id === step.id);
    if (indexInCore === 0) return true;
    if (indexInCore > 0) {
      const prevCore = coreSteps[indexInCore - 1];
      const prevStatus = getStepStatus(prevCore.id);
      return prevStatus === 'completed';
    }

    return false;
  };

  const currentStepNumber = coreSteps.findIndex(
    step => getStepStatus(step.id) === 'in-progress'
  ) + 1 || 0;

  const completedSteps = coreSteps.filter(step => getStepStatus(step.id) === 'completed').length;
  const totalCoreSteps = coreSteps.length || 0;
  const progressPercent = totalCoreSteps === 0 ? 0 : Math.round((completedSteps / totalCoreSteps) * 100);

  // Determine current user once for rendering decisions
  const currentUser = authUtils.getCurrentUser();
  const isStudentUser = currentUser?.userType === 'student';

  if (loading) {
    return <div className="roadmap-loading">Loading roadmap...</div>;
  }

  // If roadmap data for this course is not found, show friendly fallback
  if (!roadmapData[courseName?.toLowerCase()]) {
    return (
      <div className="course-roadmap no-roadmap-available">
        <button className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="no-roadmap-message">
          <h2>No roadmap available</h2>
          <p>We don't have a learning roadmap for "{courseName}" yet. Please check back later or contact the admin to add one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-roadmap">
      <button className="back-btn" onClick={onBack}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

      <div className="roadmap-header">
        <h1>{roadmapData[courseName]?.title}</h1>
        <p>{roadmapData[courseName]?.description}</p>
        {(() => {
          const currentUser = authUtils.getCurrentUser();
          const isStudent = currentUser?.userType === 'student';
          return isStudent ? (
            <div className="progress-overview">
              <div className="progress-stat">
                <div className="stat-label">Progress</div>
                <div className="stat-value">{completedSteps}/{totalCoreSteps || 0}</div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar" aria-hidden>
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="progress-percentage">{progressPercent}%</div>
              </div>
            </div>
          ) : null;
        })()}
      </div>

      <div className="roadmap-timeline">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isUnlocked = isStepUnlocked(step);
          const isExpanded = expandedStep === step.id;
          const requiresVideoWatch = !!(step.resources && step.resources.some(r => r.src));
          const canComplete = !requiresVideoWatch || areAllStepVideosWatched(step);

          return (
            <div key={step.id} className={`timeline-step ${status} ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="timeline-marker">
                <div className="step-number">{step.id}</div>
                {status === 'completed' && <i className="fas fa-check-circle"></i>}
              </div>

              <div className="timeline-content">
                <div
                  className="step-header"
                  onClick={() => isUnlocked && setExpandedStep(isExpanded ? null : step.id)}
                >
                  <div className="step-info">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-duration">
                      <i className="fas fa-clock"></i> {step.duration}
                    </p>
                  </div>

                  <div className="step-status-badge">
                    {status && !(status === 'in-progress' && !isStudentUser) && (
                      <span className={`status-label ${status}`}>
                        {status.replace('-', ' ')}
                      </span>
                    )}
                    {isUnlocked && isStudentUser && (status === 'not-started' || !status) && (
                      <button
                        className="start-inline-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartStep(step.id);
                        }}
                      >
                        Start Learning
                      </button>
                    )}
                    {isUnlocked && !isStudentUser && (status === 'not-started' || !status) && (
                      <span className="admin-lock-inline" title="Start disabled for admins">
                        <i className="fas fa-lock"></i>
                      </span>
                    )}
                    {isUnlocked && (
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    )}
                    {!isUnlocked && <i className="fas fa-lock"></i>}
                  </div>
                </div>

                {isExpanded && isUnlocked && (
                  <div className="step-details">
                    {/* What You Will Learn */}
                    <div className="detail-section">
                      <h4 className="section-title">
                        <i className="fas fa-lightbulb"></i> What You Will Learn
                      </h4>
                      <ul className="learn-list">
                        {step.whatYouWillLearn?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Practice Tasks */}
                    <div className="detail-section">
                      <h4 className="section-title">
                        <i className="fas fa-tasks"></i> Practice Tasks
                      </h4>
                      <ul className="tasks-list">
                        {step.practiceTasks?.map((task, idx) => (
                          <li key={idx}>
                            <input type="checkbox" id={`task-${step.id}-${idx}`} />
                            <label htmlFor={`task-${step.id}-${idx}`}>{task}</label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div className="detail-section">
                      <h4 className="section-title">
                        <i className="fas fa-video"></i> Best YouTube Video Resources
                      </h4>
                      <div className="resources-list">
                        {step.resources?.map((resource, idx) => {
                          // Inline local video files (type: 'video' and/or resource.src)
                          if (resource.type === 'video' || resource.src) {
                            return (
                              <div className="resource-video" key={idx}>
                                <video
                                  controls
                                  className="resource-video-player"
                                  src={resource.src || resource.link}
                                  onEnded={() => {
                                    try {
                                      const key = `${step.id}_${idx}`;
                                      markVideoWatched(key);
                                    } catch (e) {
                                      console.error('Error marking video watched', e);
                                    }
                                  }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                                <div className="resource-meta">
                                  <span>{resource.title}</span>
                                </div>
                              </div>
                            );
                          }

                          // MCQ resources: open modal with MCQTest
                          if (resource.type === 'mcq') {
                              const resKey = `${courseName}_${step.id}_res_${idx}`;
                              return (
                                <div className="resource-mcq" key={idx}>
                                  <button
                                    className="resource-mcq-btn"
                                    onClick={(e) => { e.stopPropagation(); setActiveMCQ({ ...resource, _resKey: resKey, testId: resKey }); setShowMCQModal(true); }}
                                  >
                                    <i className="fas fa-question-circle"></i>
                                    <span>{resource.title}</span>
                                  </button>

                                  {mcqResults[resKey] && (
                                    <div style={{ marginTop: 10, padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                                      <div style={{ fontWeight: 700 }}>{resource.title} — Result</div>
                                      <div style={{ fontSize: 13, color: '#444', marginTop: 6 }}>
                                        <div>Score: {mcqResults[resKey].score}/{mcqResults[resKey].totalQuestions}</div>
                                        <div>Percentage: {mcqResults[resKey].percentage}%</div>
                                        <div>Time taken: {formatTime(mcqResults[resKey].timeTaken)}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                          }

                          // External links (YouTube or other links)
                          const href = resource.link || resource.url;
                          const iconClass = resource.type === 'youtube' ? 'fab fa-youtube' : 'fas fa-link';

                          return (
                            <a
                              key={idx}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-link"
                            >
                              <i className={iconClass}></i>
                              <span>{resource.title}</span>
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    {/* Certification removed - handled separately in roadmap resources */}

                    {/* Action Buttons */}
                    <div className="step-actions">
                      {isStudentUser && status === 'not-started' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartStep(step.id);
                          }}
                        >
                          <i className="fas fa-play"></i> Start Learning
                        </button>
                      )}

                      {isStudentUser && status === 'in-progress' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canComplete) return;
                              handleCompleteStep(step.id);
                            }}
                            disabled={!canComplete}
                            title={!canComplete ? 'Please watch the required video(s) fully to enable completion' : 'Mark step as complete'}
                          >
                            <i className="fas fa-check"></i> Mark as Complete
                          </button>
                          <button type="button" className="btn btn-secondary">
                            <i className="fas fa-book"></i> Continue Learning
                          </button>
                          {!canComplete && (
                            <div className="video-watch-hint" style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                              Watch the video(s) fully to enable completion
                            </div>
                          )}
                        </>
                      )}

                      {!isStudentUser && (status === 'not-started' || !status) && (
                        <div className="admin-lock-detail" title="Actions disabled for admins">
                          <i className="fas fa-lock"></i>
                        </div>
                      )}
                      {status === 'completed' && (
                        <button type="button" className="btn btn-completed" disabled>
                          <i className="fas fa-check-circle"></i> Completed
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isUnlocked && (
                  <div className="step-locked-message">
                    <i className="fas fa-lock-alt"></i>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completedSteps === totalCoreSteps && (
        <div className="completion-message">
          <i className="fas fa-trophy"></i>
          <h2>🎉 Congratulations!</h2>
          <p>You have completed the entire {roadmapData[courseName]?.title} course!</p>
          <button className="btn btn-primary" onClick={onBack}>
            Back to Courses
          </button>
        </div>
      )}
      {showMCQModal && activeMCQ && (
        <div
          className="mcq-modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
          onClick={() => {
            const confirmClose = window.confirm('If you close now, your test will be submitted.\n\nPress OK to Submit & Close, Cancel to Continue the test.');
            if (confirmClose) {
              // call submit exposed by MCQTest
              try {
                mcqRef.current?.submit();
                // keep modal; MCQTest will call onClose which closes it
              } catch (e) {
                console.error('Error submitting MCQ via ref', e);
                setShowMCQModal(false);
              }
            } else {
              // do nothing (continue test)
            }
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '900px', background: '#fff', borderRadius: 8, padding: 20 }}>
            <button style={{ float: 'right', border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }} onClick={() => setShowMCQModal(false)}>×</button>
            <h3 style={{ marginTop: 0 }}>{activeMCQ.title}</h3>
            <MCQTest
              ref={mcqRef}
              noOverlay={true}
              testId={`${courseName}-step-mcq`}
              questions={activeMCQ.questions || []}
              duration={activeMCQ.duration || 20}
              onClose={(result) => {
                // result contains score, percentage, timeTaken
                try {
                  if (result && activeMCQ && activeMCQ._resKey) {
                    setMcqResults(prev => ({ ...prev, [activeMCQ._resKey]: result }));
                  }
                } catch (e) {
                  console.error('Error saving mcq result', e);
                }
                setShowMCQModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRoadmap;
