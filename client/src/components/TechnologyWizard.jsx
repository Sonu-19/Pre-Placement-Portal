import React, { useState } from 'react';
import './TechnologyWizard.css';

const emptyStep = (id = 1) => ({
  id,
  title: '',
  duration: '',
  whatYouWillLearn: [''],
  practiceTasks: [''],
  resources: []
});

const TechnologyWizard = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);

  const [tech, setTech] = useState({
    key: '',
    title: '',
    description: '',
    totalSteps: 0,
    steps: [emptyStep(1)]
  });

  const goto = (n) => setStep(n);

  const updateTech = (patch) => setTech(t => ({ ...t, ...patch }));

  const updateStep = (index, patch) => {
    setTech(t => {
      const steps = [...t.steps];
      steps[index] = { ...steps[index], ...patch };
      return { ...t, steps };
    });
  };

  const addStep = () => {
    setTech(t => ({ ...t, steps: [...t.steps, emptyStep(t.steps.length + 1)] }));
  };

  const removeStep = (index) => {
    setTech(t => {
      const steps = t.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, id: i + 1 }));
      return { ...t, steps };
    });
  };

  // helpers for arrays inside a step
  const addArrayItem = (stepIndex, field) => {
    setTech(t => {
      const steps = [...t.steps];
      steps[stepIndex] = { ...steps[stepIndex], [field]: [...(steps[stepIndex][field] || []), ''] };
      return { ...t, steps };
    });
  };

  const updateArrayItem = (stepIndex, field, idx, value) => {
    setTech(t => {
      const steps = [...t.steps];
      const arr = [...(steps[stepIndex][field] || [])];
      arr[idx] = value;
      steps[stepIndex] = { ...steps[stepIndex], [field]: arr };
      return { ...t, steps };
    });
  };

  const removeArrayItem = (stepIndex, field, idx) => {
    setTech(t => {
      const steps = [...t.steps];
      const arr = (steps[stepIndex][field] || []).filter((_, i) => i !== idx);
      steps[stepIndex] = { ...steps[stepIndex], [field]: arr };
      return { ...t, steps };
    });
  };

  const addResource = (stepIndex) => {
    setTech(t => {
      const steps = [...t.steps];
      steps[stepIndex] = { ...steps[stepIndex], resources: [...(steps[stepIndex].resources || []), { type: 'video', title: '', src: '' }] };
      return { ...t, steps };
    });
  };

  const updateResource = (stepIndex, resIndex, patch) => {
    setTech(t => {
      const steps = [...t.steps];
      const resources = [...(steps[stepIndex].resources || [])];
      resources[resIndex] = { ...resources[resIndex], ...patch };
      steps[stepIndex] = { ...steps[stepIndex], resources };
      return { ...t, steps };
    });
  };

  const removeResource = (stepIndex, resIndex) => {
    setTech(t => {
      const steps = [...t.steps];
      const resources = (steps[stepIndex].resources || []).filter((_, i) => i !== resIndex);
      steps[stepIndex] = { ...steps[stepIndex], resources };
      return { ...t, steps };
    });
  };

  const handleSubmit = () => {
    // normalize totals
    const payload = {
      title: tech.title,
      description: tech.description,
      totalSteps: Number(tech.totalSteps) || tech.steps.length,
      steps: tech.steps.map(s => ({
        id: s.id,
        title: s.title,
        duration: s.duration,
        whatYouWillLearn: (s.whatYouWillLearn || []).filter(Boolean),
        practiceTasks: (s.practiceTasks || []).filter(Boolean),
        resources: (s.resources || []).map(r => ({ ...r }))
      }))
    };

    if (onSubmit) onSubmit(payload);
  };

  return (
    <div className="technology-wizard" style={{ maxWidth: 920, margin: '0 auto', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Roadmap Wizard — Step {step} / 5</h3>
        <div>
          <button className="tw-close secondary" onClick={onCancel}>Close</button>
        </div>
      </div>

      {step === 1 && (
        <div>
          <label>Key (unique):</label>
          <input value={tech.key} onChange={(e) => updateTech({ key: e.target.value })} placeholder="e.g. javascript, mern" />
          <label>Title:</label>
          <input value={tech.title} onChange={(e) => updateTech({ title: e.target.value })} />
          <label>Description:</label>
          <textarea value={tech.description} onChange={(e) => updateTech({ description: e.target.value })} />
          <label>Total steps (optional):</label>
          <input type="number" value={tech.totalSteps} onChange={(e) => updateTech({ totalSteps: e.target.value })} />
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Roadmap Steps</h4>
            <button className="secondary" onClick={addStep}>Add Step</button>
          </div>
          {tech.steps.map((s, i) => (
            <div key={i} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Step {s.id}</strong>
                <div>
                  <button className="danger" onClick={() => removeStep(i)} disabled={tech.steps.length === 1}>Remove</button>
                </div>
              </div>
              <label>Title:</label>
              <input value={s.title} onChange={(e) => updateStep(i, { title: e.target.value })} />
              <label>Duration:</label>
              <input value={s.duration} onChange={(e) => updateStep(i, { duration: e.target.value })} />
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <h4>Learning content (per step)</h4>
          {tech.steps.map((s, si) => (
            <div key={si} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <strong>Step {s.id}: {s.title || '(untitled)'}</strong>
              <div>
                <label>What you will learn</label>
                {(s.whatYouWillLearn || []).map((w, wi) => (
                  <div key={wi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input value={w} onChange={(e) => updateArrayItem(si, 'whatYouWillLearn', wi, e.target.value)} />
                    <button className="secondary" onClick={() => removeArrayItem(si, 'whatYouWillLearn', wi)}>Remove</button>
                  </div>
                ))}
                <button className="secondary" onClick={() => addArrayItem(si, 'whatYouWillLearn')}>Add learning item</button>
              </div>

              <div style={{ marginTop: 8 }}>
                <label>Practice tasks</label>
                {(s.practiceTasks || []).map((p, pi) => (
                  <div key={pi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input value={p} onChange={(e) => updateArrayItem(si, 'practiceTasks', pi, e.target.value)} />
                    <button className="secondary" onClick={() => removeArrayItem(si, 'practiceTasks', pi)}>Remove</button>
                  </div>
                ))}
                <button className="secondary" onClick={() => addArrayItem(si, 'practiceTasks')}>Add practice task</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <h4>Resources (per step)</h4>
          {tech.steps.map((s, si) => (
            <div key={si} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <strong>Step {s.id}: {s.title || '(untitled)'}</strong>
              {(s.resources || []).map((r, ri) => (
                <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <select value={r.type} onChange={(e) => updateResource(si, ri, { type: e.target.value })}>
                    <option value="video">video</option>
                    <option value="youtube">youtube</option>
                    <option value="link">link</option>
                    <option value="mcq">mcq</option>
                  </select>
                  <input value={r.title} placeholder="Title" onChange={(e) => updateResource(si, ri, { title: e.target.value })} />
                  <div>
                    <input value={r.src || r.link || ''} placeholder="src or link" onChange={(e) => updateResource(si, ri, { src: e.target.value, link: e.target.value })} />
                    <button className="danger" onClick={() => removeResource(si, ri)}>Remove</button>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <button onClick={() => addResource(si)}>Add resource</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 5 && (
        <div>
          <h4>Review & Submit</h4>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12, borderRadius: 6 }}>{JSON.stringify({
            title: tech.title,
            description: tech.description,
            totalSteps: Number(tech.totalSteps) || tech.steps.length,
            steps: tech.steps
          }, null, 2)}</pre>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <div>
          {step > 1 && <button className="tw-back secondary" onClick={() => goto(step - 1)}>Back</button>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {step < 5 && <button className="tw-next" onClick={() => goto(step + 1)}>Next</button>}
          {step === 5 && <button className="tw-submit" onClick={handleSubmit}>Submit</button>}
        </div>
      </div>
    </div>
  );
};

export default TechnologyWizard;
