// components/Contact.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Contact.css";

const initialState = {
  name: "",
  email: "",
  mobile: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Restrict mobile to only digits and max 10 characters
    if (name === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    
    setFormData((s) => ({ ...s, [name]: value }));
  };

  // Auto-hide status message after 4 seconds
  React.useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status.message]);

  const validate = () => {
    if (!formData.name.trim()) return "Please enter your name.";
    if (!formData.email.trim()) return "Please enter your email.";
    // simple email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) return "Please enter a valid email.";
    if (!formData.mobile.trim()) return "Please enter your mobile number.";
    // simple phone pattern (exactly 10 digits)
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(formData.mobile.trim().replace(/\D/g, ""))) return "Please enter exactly 10-digit mobile number.";
    if (!formData.subject.trim()) return "Please add a subject.";
    if (!formData.message.trim()) return "Please write a message.";
    if (formData.message.trim().length < 10) return "Message should be at least 10 characters.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    const err = validate();
    if (err) {
      setStatus({ type: "error", message: err });
      return;
    }

    // Send to backend API
    fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStatus({ type: "success", message: "Thank you! Your message has been received. We will get back to you soon." });
          setFormData(initialState);
        } else {
          setStatus({ type: "error", message: data.message || "Failed to send message" });
        }
      })
      .catch(err => {
        console.error('Error submitting form:', err);
        setStatus({ type: "error", message: "Failed to send message. Please try again." });
      });
  };

  return (
    <section className="contact">
      <div className="animated-bg" aria-hidden="true">
        {/* subtle SVG shapes */}
        <svg className="shape s1" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" /></svg>
        <svg className="shape s2" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="18" /></svg>
      </div>

      <div className="contact-inner">
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Contact Us</h1>
          <p>Have questions or need support? Get in touch with our team.</p>
        </motion.div>

        <div className="contact-content">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Get In Touch</h2>

            <div className="contact-method">
              <i className="fas fa-envelope" aria-hidden="true"></i>
              <div>
                <h3>Email</h3>
                <p>
                  <a href="mailto:kumarsonu19082003@gmail.com">kumarsonu19082003@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="contact-method">
              <i className="fas fa-phone" aria-hidden="true"></i>
              <div>
                <h3>Phone</h3>
                <p>
                  <a href="tel:+917763007316">+91 77630 07316</a>
                </p>
              </div>
            </div>

            <div className="contact-method">
              <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
              <div>
                <h3>Address</h3>
                <p>Marwadi University, Rajkot, Gujarat</p>
              </div>
            </div>

            <div className="contact-method">
              <i className="fas fa-clock" aria-hidden="true"></i>
              <div>
                <h3>Office Hours</h3>
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="contact-form-container"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Send us a Message</h2>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              {status.message && (
                <div className={`form-status ${status.type === "error" ? "error" : "success"}`} role="status">
                  {status.message}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Short summary"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Send Message <i className="fas fa-paper-plane" aria-hidden="true"></i>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
