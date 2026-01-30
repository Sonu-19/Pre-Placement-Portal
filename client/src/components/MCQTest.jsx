import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./MCQTest.css";

const MCQTest = forwardRef(({
  testId,
  title = "MCQ Test",
  questions = [],
  duration = 20,
  onClose,
  noOverlay = false
}, ref) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [showWarning, setShowWarning] = useState(false);
  const [timeTaken, setTimeTaken] = useState(null);

  /* 🔒 Lock background scroll when overlay is used */
  useEffect(() => {
    if (noOverlay) return;
    document.body.classList.add("mcq-open");
    return () => document.body.classList.remove("mcq-open");
  }, [noOverlay]);

  /* ⏱ Timer */
  useEffect(() => {
    if (submitted) return;

    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleSelect = (qId, index) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: index }));
  };

  const calculateScore = () =>
    questions.reduce(
      (score, q) =>
        answers[q.id] === q.correctAnswer ? score + 1 : score,
      0
    );

  /* ✅ FINAL SUBMIT (used by timer & confirm) */
  const handleFinalSubmit = async () => {
    if (submitted) return;

    setSubmitted(true);

    const score = calculateScore();
    const percentage = ((score / questions.length) * 100).toFixed(2);
    const tt = duration * 60 - timeLeft;
    setTimeTaken(tt);

    try {
      const user = JSON.parse(localStorage.getItem('authUser')) || null;
      const payload = {
        testId,
        score,
        totalQuestions: questions.length,
        percentage: parseFloat(percentage),
        timeTaken: tt
      };
      if (user && user._id) payload.userId = user._id;

      const resp = await fetch("http://localhost:5000/api/mcq-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // If server returned created result, you may use it if needed
      if (resp.ok) {
        const body = await resp.json();
        // server returns { success, message, result }
        // we don't strictly need it here but parent may use onClose result
      }
    } catch (err) {
      console.error("Result save failed", err);
    }

    const result = {
      testId,
      score,
      totalQuestions: questions.length,
      percentage,
      timeTaken: tt
    };

    setTimeout(() => {
      onClose && onClose(result);
    }, 300);
  };

  // expose imperative submit method to parent
  useImperativeHandle(ref, () => ({
    submit: () => {
      handleFinalSubmit();
    }
  }));

  const getOptionStyle = (q, index) => {
    if (!submitted) return "";
    if (index === q.correctAnswer) return "correct";
    if (answers[q.id] === index) return "wrong";
    return "";
  };

  const score = calculateScore();
  const percentage =
    questions.length > 0
      ? ((score / questions.length) * 100).toFixed(2)
      : 0;

  const formatTime = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const inner = (
    <div className="mcq-test" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="mcq-header">
        <h2>{title}</h2>
        <span className="timer">
          {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>

      {/* Questions */}
      <div className="mcq-body">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="question">
            <p>{qIndex + 1}. {q.question}</p>

            {q.options.map((opt, index) => (
              <label
                key={index}
                className={`option ${getOptionStyle(q, index)}`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === index}
                  onChange={() => handleSelect(q.id, index)}
                  disabled={submitted}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mcq-footer">
        {!submitted ? (
          <button className="submit-btn" onClick={handleFinalSubmit}>
            Submit Test
          </button>
            ) : (
              <div className="result-box">
                <h3>Submitted ✅</h3>
                <p>Score: {score}/{questions.length}</p>
                <p>Percentage: {percentage}%</p>
                {timeTaken != null && (
                  <p>Time taken: {formatTime(timeTaken)}</p>
                )}
              </div>
            )}
      </div>
    </div>
  );

  if (noOverlay) {
    return <>{inner}</>;
  }

  return (
    <>
      <div className="mcq-overlay">
        {inner}
      </div>
    </>
  );
});

export default MCQTest;
