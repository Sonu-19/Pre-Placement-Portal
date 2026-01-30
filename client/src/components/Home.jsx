// components/Home.jsx
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import "./Home.css";

// Intersection observer hook
const useInView = (selector, root = null, rootMargin = "0px", threshold = 0.18) => {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, root, rootMargin, threshold]);
};

// Count-up animation for numbers
const CountUp = ({ to, suffix = "", duration = 1200, triggerSelector }) => {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    // Reset started flag when 'to' changes
    started.current = false;
    
    const el = triggerSelector ? document.querySelector(triggerSelector) : null;
    if (!el || !("IntersectionObserver" in window)) {
      start();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            start();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    function start() {
      const startTS = performance.now();
      const from = 0;
      function tick(now) {
        const elapsed = now - startTS;
        const progress = Math.min(elapsed / duration, 1);
        const cur = Math.floor(from + (to - from) * easeOutCubic(progress));
        setValue(cur);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    return () => io.disconnect();
  }, [to, duration, triggerSelector]);

  return (
    <span className="countup">
      {value}
      {suffix}
    </span>
  );
};

// ─────────────────────────────────────────────

const Home = ({ onLoginClick }) => {
  useInView(".reveal");
  const [stats, setStats] = useState({
    totalStudents: 7,
    placedStudents: 0,
    totalCourses: 9
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Fetch statistics on component mount and periodically update
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user statistics from backend
        const response = await fetch('http://localhost:5000/api/admin/statistics');
        if (response.ok) {
          const data = await response.json();
          console.log('Statistics fetched:', data);
          setStats({
            totalStudents: data.totalStudents || 0,
            placedStudents: data.placedStudents || 0,
            totalCourses: data.totalCourses || 9
            
          });
          setStatsLoaded(true);
        } else {
          console.error('Statistics API error:', response.status, response.statusText);
          setStatsLoaded(false);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err.message);
        setStatsLoaded(false);
      }
    };

    // Fetch immediately on mount
    fetchStats();
    
    // Refresh statistics every 3 seconds for real-time updates
    const interval = setInterval(fetchStats, 3000);
    
    // Listen for custom events from other components
    const handleStatsUpdate = () => {
      console.log('Stats update event triggered, refreshing...');
      fetchStats();
    };
    
    window.addEventListener('statsUpdated', handleStatsUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('statsUpdated', handleStatsUpdate);
    };
  }, []);

  return (
    <main className="home">
      <div className="animated-bg" aria-hidden="true">
        <svg className="shape s1" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" /></svg>
        <svg className="shape s2" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" /></svg>
      </div>

      {/* Hero Section - Full Width */}
      <motion.section
        className="hero-section reveal"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-container">
          <motion.div 
            className="intro-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Pre-Placement Training Portal
            </motion.h1>
            <motion.p 
              className="lead"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome to the Pre-Placement Training Portal — an end-to-end learning ecosystem designed to equip students with the technical expertise, problem-solving skills, and professional confidence required to succeed in today's competitive placement landscape. Our platform combines structured learning paths, real-world problem practice, personalized mentorship, and continuous skill evaluation to ensure you are fully prepared for interviews across top companies.
            </motion.p>
            <motion.div 
              className="intro-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.button 
                className="cta-btn" 
                onClick={onLoginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
              <motion.a 
                href="#how-it-works" 
                className="link-muted"
                whileHover={{ x: 5 }}
              >
                Learn how it works →
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <div className="container">

        {/* Stats Section - Full Width */}
        <motion.section
          className="stats-section reveal"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="stats-row">
            {[
              { number: stats.totalStudents, label: "Students", delay: 0 },
              { number: stats.placedStudents, label: "Placed", delay: 0.1 },
              { number: stats.totalCourses, label: "Courses", delay: 0.2 }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: stat.delay }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="stat-number">
                  <CountUp to={stat.number} suffix="+" triggerSelector=".stats-row" />
                </div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Companies */}
        <motion.section
          className="featured-companies reveal"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h3 
            className="com"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Companies Hiring Our Students
          </motion.h3>
          <div className="company-strip">
            {["Infosys","TCS","Wipro","Accenture","Capgemini"].map((c, index) => (
              <motion.div
                key={c}
                className="company hover-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
              >
                {c}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technologies */}
        <motion.section
          className="technologies-preview reveal"
          id="technologies"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="tech"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Technologies You Can Master
          </motion.h1>
          <div className="tech-preview-scroll">
            <div className="tech-preview hover-lift">
              <i className="fab fa-react"></i>
              <h3>MERN Stack</h3>
              <p className="tech-subtitle">MongoDB, Express, React, Node.js</p>
              <p className="tech-description">Build modern full-stack apps and APIs.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-java"></i>
              <h3>Java Spring Boot</h3>
              <p className="tech-subtitle">Enterprise Backend Development</p>
              <p className="tech-description">Create scalable, production-ready backend systems.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-python"></i>
              <h3>Python Django</h3>
              <p className="tech-subtitle">Secure Web Development</p>
              <p className="tech-description">Develop secure, data-driven web applications.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-project-diagram"></i>
              <h3>Data Structures & Algorithms</h3>
              <p className="tech-subtitle">DSA</p>
              <p className="tech-description">Master logic, patterns, and coding interview skills.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-flutter"></i>
              <h3>Flutter Development</h3>
              <p className="tech-subtitle">Cross-Platform Apps</p>
              <p className="tech-description">Build mobile apps for Android & iOS with one codebase.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-android"></i>
              <h3>Android Kotlin</h3>
              <p className="tech-subtitle">Mobile App Development</p>
              <p className="tech-description">Create modern Android apps using Kotlin and Jetpack.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-code-branch"></i>
              <h3>DevOps & CI/CD</h3>
              <p className="tech-subtitle">Automation & Deployment</p>
              <p className="tech-description">Learn Docker, pipelines, and cloud-based deployments.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-aws"></i>
              <h3>AWS Cloud Basics</h3>
              <p className="tech-subtitle">Cloud Computing</p>
              <p className="tech-description">Understand EC2, S3, serverless, and cloud workflows.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-brain"></i>
              <h3>Machine Learning</h3>
              <p className="tech-subtitle">ML Foundations</p>
              <p className="tech-description">Learn supervised models, data prep, and ML pipelines.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-database"></i>
              <h3>SQL & Databases</h3>
              <p className="tech-subtitle">Data Management</p>
              <p className="tech-description">Master SQL queries, schemas, and efficient DB designs.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-shield-alt"></i>
              <h3>Cybersecurity Basics</h3>
              <p className="tech-subtitle">Secure Systems</p>
              <p className="tech-description">Learn security fundamentals, threats, and protection methods.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-react"></i>
              <h3>React Advanced</h3>
              <p className="tech-subtitle">Modern Frontend Development</p>
              <p className="tech-description">Deep dive into hooks, state management, and routing.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fab fa-node-js"></i>
              <h3>Node.js APIs</h3>
              <p className="tech-subtitle">Backend API Development</p>
              <p className="tech-description">Build fast, scalable server-side APIs with Node.js.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-code"></i>
              <h3>C++ Programming</h3>
              <p className="tech-subtitle">Competitive Coding</p>
              <p className="tech-description">Improve speed, logic, and performance for coding contests.</p>
            </div>
            <div className="tech-preview hover-lift">
              <i className="fas fa-vial"></i>
              <h3>Software Testing</h3>
              <p className="tech-subtitle">QA & Automation</p>
              <p className="tech-description">Learn manual testing, Selenium, and automation basics.</p>
            </div>
          </div>
        </motion.section>

        {/* How it Works */}
        <motion.section
          className="how-it-works reveal"
          id="how-it-works"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <div className="steps">
            {[
              ["Login as Student","Access your personalized dashboard"],
              ["Choose Technology","Select from in-demand techs"],
              ["Learn & Practice","Follow resources and problems"],
              ["Get Guidance","Schedule mentor meetings"]
            ].map(([t,d],i)=>(
              <motion.article
                key={i}
                className="step hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="step-number">{i+1}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          className="testimonials reveal"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="what"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What Our Students Say
          </motion.h2>
          <div className="testimonial-grid">
            {[
              ["This portal helped me crack my first interview!","Priya Sharma"],
              ["I could track my progress and focus on weak spots.","Rahul Patel"],
              ["Structured modules gave me confidence for interviews.","Sneha Verma"]
            ].map(([m,n], index)=>(
              <motion.div
                key={n}
                className="testimonial hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <p>"{m}"</p>
                <h4>— {n}</h4>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="cta-section reveal"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1>Start Your Placement Journey Today!</h1>
            <p>Join thousands improving their coding skills and landing dream jobs.</p>
            <motion.button 
              className="cta-btn hover-lift" 
              onClick={onLoginClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up Free
            </motion.button>
          </motion.div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          className="faq-section reveal"
          id="faq"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2>Frequently Asked Questions</h2>
          <div className="faq">
            <details><summary>How can I register as a student?</summary><p>Click “Sign Up” and fill the form.</p></details>
            <details><summary>Can I choose multiple technologies?</summary><p>Focus on one at a time for best results.</p></details>
            <details><summary>Is there any fee to join?</summary><p>No — it’s free for partner institutions.</p></details>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default Home;
