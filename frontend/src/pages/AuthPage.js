import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { getUserByEmail, mockUsers } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Shield, ArrowLeft, User, Package, UserCog } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    region: 'North Delhi'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const user = getUserByEmail(formData.email, formData.password);
        if (user) {
          login(user);
          toast.success('Login successful!');
          navigate('/dashboard');
        } else {
          toast.error('Invalid credentials');
        }
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
          toast.error('Please fill all fields');
          return;
        }
        
        signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          region: formData.region
        });
        
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      login(user);
      toast.success(`Logged in as ${role}!`);
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          data-testid="back-to-home-btn"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2" data-testid="auth-heading">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-center text-gray-600 mb-8" data-testid="auth-subheading">
            {isLogin ? 'Login to access your dashboard' : 'Sign up to get started with Nishchit'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="mt-2 border-gray-300"
                    data-testid="name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="mt-2 border-gray-300"
                    data-testid="phone-input"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-gray-700 font-medium">Region</Label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="mt-2 w-full border border-gray-300 rounded-md p-2"
                    data-testid="region-select"
                  >
                    <option value="North Delhi">North Delhi</option>
                    <option value="South Delhi">South Delhi</option>
                    <option value="East Delhi">East Delhi</option>
                    <option value="West Delhi">West Delhi</option>
                    <option value="Central Delhi">Central Delhi</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-2 border-gray-300"
                data-testid="email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-2 border-gray-300"
                data-testid="password-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-lg"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
              data-testid="toggle-auth-btn"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4 font-medium">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickLogin('citizen')}
                className="flex flex-col items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all"
                data-testid="quick-login-citizen"
              >
                <User className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Citizen</span>
              </button>

              <button
                onClick={() => handleQuickLogin('dealer')}
                className="flex flex-col items-center justify-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all"
                data-testid="quick-login-dealer"
              >
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Dealer</span>
              </button>

              <button
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-center justify-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all"
                data-testid="quick-login-admin"
              >
                <UserCog className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;