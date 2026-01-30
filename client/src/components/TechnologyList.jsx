// components/TechnologyList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TechnologyWizard from './TechnologyWizard';
import fallbackRoadmapData from '../data/roadmapData';
import './TechnologyList.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TechnologyList = ({ selectedTech, setSelectedTech, isAdmin = false }) => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // `fetched` tracks whether the initial API call succeeded
  const [fetched, setFetched] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [newTech, setNewTech] = useState({
    name: '',
    description: '',
    category: 'Web Development',
    resources: {
      videos: [{ title: '', url: '' }],
      courses: [{ name: '', platform: '', url: '' }],
      certifications: [{ name: '', url: '' }],
      practice: [{ platform: '', url: '' }]
    }
  });

  // Fetch technologies
  const fetchTechnologies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/technologies`);
      setTechnologies(Array.isArray(response.data) ? response.data : []);
      setFetched(true);
      setLoading(false);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.warn('Error fetching technologies:', err);
      const serverMessage = err?.response?.data?.message || err.message || 'Failed to load technologies.';
      // If the server fails, fall back to local roadmap data so admins can continue working.
      try {
        const local = Object.keys(fallbackRoadmapData).map(key => {
          const r = fallbackRoadmapData[key];
          return {
            _id: `local-${key}`,
            name: r.title || key,
            description: r.description || '',
            roadmap: { title: r.title, steps: r.steps || [] },
            resources: { videos: [], courses: [], certifications: [], practice: [] }
          };
        });
        setTechnologies(local);
        setError(null);
        setFetched(true);
      } catch (fallbackErr) {
        setError(`Failed to load technologies: ${serverMessage}` + (fallbackErr ? `; fallback failed: ${fallbackErr.message}` : ''));
        setFetched(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for global events so UI updates when admin creates roadmaps or adds courses
  useEffect(() => {
    const handleRoadmapCreated = (e) => {
      // refetch technologies to pick up any new entries
      fetchTechnologies();
    };

    const handleCourseAdded = (e) => {
      // a course was added; refresh list so details view shows it
      fetchTechnologies();
    };

    window.addEventListener('roadmapCreated', handleRoadmapCreated);
    window.addEventListener('courseAdded', handleCourseAdded);
    return () => {
      window.removeEventListener('roadmapCreated', handleRoadmapCreated);
      window.removeEventListener('courseAdded', handleCourseAdded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // prevent background scroll while wizard is open
    document.body.style.overflow = showAddForm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showAddForm]);

  const addTechnology = async () => {
    try {
      const response = await axios.post(`${API_URL}/technologies`, newTech, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      setTechnologies(prev => [...prev, response.data]);
      setNewTech({
        name: '',
        description: '',
        category: 'Web Development',
        resources: {
          videos: [{ title: '', url: '' }],
          courses: [{ name: '', platform: '', url: '' }],
          certifications: [{ name: '', url: '' }],
          practice: [{ platform: '', url: '' }]
        }
      });
      setShowAddForm(false);
      setFetched(true);
      window.dispatchEvent(new CustomEvent('courseAdded', { detail: { technology: response.data } }));
      window.dispatchEvent(new Event('statsUpdated'));
      // Ideally replace alert with a non-blocking toast in production
      alert('Technology added successfully!');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.warn('Error adding technology:', err);
      alert('Failed to add technology. Please try again.');
    }
  };

  const deleteTechnology = async (id) => {
    try {
      await axios.delete(`${API_URL}/technologies/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setTechnologies(prev => prev.filter(tech => tech._id !== id));
      if (selectedTech === id) setSelectedTech(null);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.warn('Error deleting technology:', err);
      alert('Failed to delete technology. Please try again.');
    }
  };

  // Loading state (centered)
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted, #666)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Loading technologies…</div>
          <div style={{ fontSize: 13 }}>Please wait while we fetch the latest technologies.</div>
        </div>
      </div>
    );
  }

  // Inline error banner (non-blocking) - shown when there is an error and not dismissed.
  

  // If a specific technology is selected, render detail view
  if (selectedTech) {
    const tech = technologies.find(t => t._id === selectedTech);
    if (!tech) {
      // If list doesn't contain the selectedTech (e.g., deleted), clear selection
      setSelectedTech(null);
      return null;
    }

    return (
      <div className="technology-detail">
        <button className="back-btn" onClick={() => setSelectedTech(null)}>
          <i className="fas fa-arrow-left"></i> Back to Technologies
        </button>

        <div className="tech-header">
          <h2>{tech.name}</h2>
          <p>{tech.description}</p>
        </div>

        {tech.roadmap && tech.roadmap.stages && tech.roadmap.stages.length > 0 ? (
          <div className="roadmap-section">
            <h2>{tech.roadmap.title || 'Learning Roadmap'}</h2>
            <p className="roadmap-subtitle">Follow these stages step by step to go from absolute beginner to confident {tech.name} developer.</p>
            <div className="roadmap-grid">
              {tech.roadmap.stages.map((stage, index) => (
                <div key={index} className="roadmap-card">
                  <h3>{stage.title}</h3>
                  {stage.description && <p className="roadmap-description">{stage.description}</p>}
                  {stage.steps && (
                    <ul className="roadmap-steps">
                      {stage.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-roadmap">
            <h3>No roadmap available</h3>
            <p>This technology does not have a roadmap yet. You can add one from the admin panel.</p>
          </div>
        )}

        <div className="resources-grid">
          <div className="resource-card">
            <h3><i className="fas fa-video"></i> Learning Videos</h3>
            <div className="video-list">
              {(tech.resources?.videos || []).map((video, index) => (
                <div key={index} className="video-item">
                  <div className="video-placeholder">
                    <i className="fas fa-play-circle"></i>
                    <p>{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="resource-card">
            <h3><i className="fas fa-graduation-cap"></i> Courses</h3>
            <ul className="resource-list">
              {(tech.resources?.courses || []).map((course, index) => (
                <li key={index}>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">{course.name} - {course.platform}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // If initial fetch failed, show a neutral placeholder with retry
  if (!fetched) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted, #666)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Technologies unavailable</div>
          <div style={{ marginBottom: 12 }}>{error ? error : "We couldn't load the list. You can retry to fetch the latest technologies."}</div>
          <div>
            <button onClick={() => fetchTechnologies()} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`technology-list ${showAddForm || showCreateForm ? 'wizard-open' : ''}`}>
     {/* ✅ CENTERED HEADER (ONLY UPDATED PART) */}
<div
  className="technology-list-header"
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%'
  }}
>
  <h2 style={{ margin: 0 }}>
    Available Technologies
  </h2>

  <p style={{ margin: '6px 0 8px 0' }}>
    Select a technology to start learning
  </p>

  {isAdmin && (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginTop: '6px'
      }}
    >
      <button
        className="add-tech-btn"
        onClick={() => setShowCreateForm(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <i className="fas fa-plus"></i> Add Technology
      </button>
    </div>
  )}
</div>

      {showAddForm && isAdmin && (
        <div className="tw-overlay" onClick={() => setShowAddForm(false)}>
          <div className="tw-modal" onClick={(e) => e.stopPropagation()}>
            <TechnologyWizard
              onCancel={() => setShowAddForm(false)}
              onSubmit={async (roadmap) => {
            // Attempt to persist roadmap to backend
            try {
              const payload = {
                key: roadmap.key && roadmap.key.trim().length > 0 ? roadmap.key.trim() : (roadmap.title || 'roadmap').toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)/g, ''),
                title: roadmap.title || roadmap.key || 'Untitled roadmap',
                description: roadmap.description || '',
                totalSteps: Number(roadmap.totalSteps) || (Array.isArray(roadmap.steps) ? roadmap.steps.length : 0),
                steps: Array.isArray(roadmap.steps) ? roadmap.steps : []
              };

              const response = await axios.post(`${API_URL}/roadmaps`, payload, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
              });

              const created = response.data;
              window.dispatchEvent(new CustomEvent('roadmapCreated', { detail: created }));
              // refresh the technologies list so the newly created roadmap/technology appears
              fetchTechnologies();
              setShowAddForm(false);
              setFetched(true);
              alert('Roadmap saved successfully.');
            } catch (err) {
              if (err?.response?.status === 409) {
                alert('A roadmap with that key already exists. Choose a different key.');
              } else {
                if (process.env.NODE_ENV === 'development') console.warn('Error saving roadmap:', err);
                alert('Failed to save roadmap. You can still export the JSON or retry.');
              }
            }
          }}
            />
          </div>
        </div>
      )}

      {showCreateForm && isAdmin && (
        <div className="tw-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="tw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="technology-wizard" style={{ maxWidth: 720, margin: '0 auto', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Add Technology</h3>
                <div>
                  <button className="tw-close secondary" onClick={() => setShowCreateForm(false)}>Close</button>
                </div>
              </div>

              <label>Technology Name</label>
              <input value={newTech.name} onChange={(e) => setNewTech(t => ({ ...t, name: e.target.value }))} placeholder="e.g., JavaScript, MERN" />

              <label>Description</label>
              <textarea value={newTech.description} onChange={(e) => setNewTech(t => ({ ...t, description: e.target.value }))} />

              <label>Category</label>
              <input value={newTech.category} onChange={(e) => setNewTech(t => ({ ...t, category: e.target.value }))} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button className="secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button onClick={async () => { await addTechnology(); setShowCreateForm(false); }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showAddForm && (
        <div className="tech-grid">
          {fetched && technologies.length === 0 && (
            <div style={{ padding: '16px' }}>
              <p>No technologies available yet.</p>
            </div>
          )}

          {fetched && technologies.map(tech => (
            <div key={tech._id} className="tech-card" onClick={() => setSelectedTech(tech._id)}>
              <div className="tech-icon"><i className="fas fa-laptop-code"></i></div>
              <h3>{tech.name}</h3>
              <p>{tech.description}</p>
              <button className="select-tech-btn">Start Learning <i className="fas fa-arrow-right"></i></button>

              {isAdmin && (
                <div className="tech-admin-actions">
                  <button className="delete-tech-btn" onClick={(e) => { e.stopPropagation(); deleteTechnology(tech._id); }}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnologyList;