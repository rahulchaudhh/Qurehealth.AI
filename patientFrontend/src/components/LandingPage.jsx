import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Header */}
            <header className="landing-header">
                <div className="landing-logo">
                    <span className="logo-icon">🏥</span>
                    Qurehealth
                </div>

                <nav className="landing-nav">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How it Works</a>
                    <a href="#testimonials" className="nav-link">Testimonials</a>
                    <a href="#about" className="nav-link">About Us</a>
                </nav>

                <div className="auth-buttons">
                    <Link to="/login" className="btn-secondary">Login</Link>
                    <Link to="/register" className="btn-primary">Get Started</Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-badge">✨ Revolutionizing Healthcare</span>
                    <h1 className="hero-title">
                        Your Health Journey <br />
                        <span className="title-accent">Simplified by AI</span>
                    </h1>
                    <p className="hero-subtitle">
                        Access world-class diagnostic tools, schedule appointments with top doctors,
                        and manage your health records all in one secure platform.
                    </p>
                    <div className="auth-buttons">
                        <Link to="/register" className="btn-primary">Start Your Journey</Link>
                        <Link to="/login" className="btn-secondary">Patient Portal</Link>
                    </div>
                </div>

                <div className="hero-image-wrapper">
                    <img src="/landing_hero.png" alt="Healthcare Platform Interface" />
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <h2 className="section-title">Why Choose QurehealthAI?</h2>

                <div className="features-grid">
                    {/* Feature 1 */}
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            ⚡
                        </div>
                        <span className="feature-tag">EFFICIENCY</span>
                        <h3 className="feature-title">AI-Powered Analysis</h3>
                        <p className="feature-desc">
                            Get preliminary diagnostic insights instantly using our advanced machine learning algorithms.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            🔒
                        </div>
                        <span className="feature-tag">SECURITY</span>
                        <h3 className="feature-title">Secure Health Records</h3>
                        <p className="feature-desc">
                            Your medical data is encrypted and stored with bank-grade security protocols.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            👨‍⚕️
                        </div>
                        <span className="feature-tag">EXPERTISE</span>
                        <h3 className="feature-title">Expert Doctors</h3>
                        <p className="feature-desc">
                            Connect with certified specialists for consultations and second opinions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <h2 className="footer-title">Ready to take control?</h2>
                    <p className="footer-subtitle">Join thousands of patients trusting QurehealthAI.</p>

                    <div className="stats-row">
                        <div className="stat-item">
                            <h4>10k+</h4>
                            <p>Active Patients</p>
                        </div>
                        <div className="stat-item">
                            <h4>500+</h4>
                            <p>Specialists</p>
                        </div>
                        <div className="stat-item">
                            <h4>98%</h4>
                            <p>Satisfaction</p>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2024 QurehealthAI. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Privacy Policy</a>
                            <a href="#" className="footer-link">Terms of Service</a>
                            <a href="#" className="footer-link">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
