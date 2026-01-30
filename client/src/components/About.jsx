// components/About.js
import React from "react";
import "./About.css";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="about">
      {/* animated background layer */}
      <div className="animated-bg" aria-hidden="true">
        <svg className="bubble bubble-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.04)"/>
        </svg>
        <svg className="bubble bubble-2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="70" fill="rgba(255,255,255,0.03)"/>
        </svg>
        <svg className="bubble bubble-3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="180" height="180" rx="36" fill="rgba(255,255,255,0.02)"/>
        </svg>
      </div>

      {/* content wrapper */}
      <div className="about-inner">
        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1>About Pre-Placement Portal</h1>
          <p>Empowering students to succeed in technical interviews and secure their dream jobs.</p>
        </motion.div>

        <motion.div
          className="mission"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2>Our Mission</h2>
          <p>
            We bridge the gap between academic learning and industry requirements by
            providing structured learning paths, hands-on practice, and mentorship to help
            students excel in placement interviews.
          </p>
        </motion.div>

        <motion.div
          className="features-detail"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-detail">
              <div className="icon-wrap"><i className="fas fa-road" /></div>
              <h3>Structured Learning Paths</h3>
              <p>Curated resources and step-by-step guides for each technology stack.</p>
            </div>

            <div className="feature-detail">
              <div className="icon-wrap"><i className="fas fa-chart-line" /></div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning journey with detailed progress analytics.</p>
            </div>

            <div className="feature-detail">
              <div className="icon-wrap"><i className="fas fa-hands-helping" /></div>
              <h3>Personalized Guidance</h3>
              <p>Get suggestions and one-on-one mentorship from experienced professionals.</p>
            </div>

            <div className="feature-detail">
              <div className="icon-wrap"><i className="fas fa-certificate" /></div>
              <h3>Certification Ready</h3>
              <p>Prepare for industry-recognized certifications with curated materials.</p>
            </div>
          </div>
        </motion.div>

        <div className="row">
          <motion.div
            className="for-students"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2>For Students</h2>
            <ul>
              <li>Access comprehensive learning materials for in-demand technologies</li>
              <li>Practice coding problems on integrated platforms</li>
              <li>Receive personalized feedback and improvement suggestions</li>
              <li>Track your progress across different technologies</li>
              <li>Schedule one-on-one sessions with mentors</li>
            </ul>
          </motion.div>

          <motion.div
            className="for-admins"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2>For Admins & Mentors</h2>
            <ul>
              <li>Monitor student progress across different technologies</li>
              <li>Track practice activity on external coding platforms</li>
              <li>Provide personalized suggestions and guidance</li>
              <li>Schedule and manage one-on-one meetings</li>
              <li>Analyze overall learning trends and effectiveness</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
