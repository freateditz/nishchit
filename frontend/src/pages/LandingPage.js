import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield, Eye, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-10 h-10 text-blue-600" />,
      title: "Transparent Distribution",
      description: "Track every step of ration distribution from warehouse to beneficiary"
    },
    {
      icon: <Eye className="w-10 h-10 text-blue-600" />,
      title: "Secure Access",
      description: "Aadhaar-based authentication ensures only eligible beneficiaries receive aid"
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-blue-600" />,
      title: "Easy Tracking",
      description: "Real-time status updates and comprehensive reporting for all stakeholders"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Nishchit</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-home">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-about">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-contact">Contact</a>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                data-testid="nav-login-btn"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="hero-heading">
            Trust made simple,
            <br />
            <span className="text-blue-600">aid made certain</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto" data-testid="hero-subheading">
            Digitizing India's Public Distribution System to ensure transparency, 
            reduce corruption, and guarantee rations reach every eligible family
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg"
            data-testid="hero-get-started-btn"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12" data-testid="features-heading">
            Why Choose Nishchit?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 border border-gray-200 rounded-xl hover:shadow-xl bg-white"
                style={{ transition: 'box-shadow 0.3s' }}
                data-testid={`feature-card-${index}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3" data-testid={`feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600" data-testid={`feature-description-${index}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="stats-heading">Impact & Transparency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-testid="stat-card-0">
              <div className="text-4xl font-bold mb-2">₹69,000 Cr</div>
              <div className="text-blue-100">Annual leakage prevented</div>
            </div>
            <div data-testid="stat-card-1">
              <div className="text-4xl font-bold mb-2">5.8 Cr</div>
              <div className="text-blue-100">Fake cards removed</div>
            </div>
            <div data-testid="stat-card-2">
              <div className="text-4xl font-bold mb-2">70 Lakh</div>
              <div className="text-blue-100">Suspect beneficiaries flagged</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6" data-testid="contact-heading">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions or need support? Contact our team for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@nishchit.gov.in" className="text-blue-600 hover:underline" data-testid="contact-email">
              support@nishchit.gov.in
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <a href="tel:1800-123-4567" className="text-blue-600 hover:underline" data-testid="contact-phone">
              1800-123-4567
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-6 h-6" />
            <span className="text-xl font-bold">Nishchit</span>
          </div>
          <p className="text-gray-400">
            © 2025 Nishchit. Ensuring transparent distribution of public welfare.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;