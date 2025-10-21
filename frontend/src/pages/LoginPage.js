import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Shield, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: identifier, 2: OTP
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!identifier) {
      toast.error('Please enter email or Aadhaar number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { identifier });
      toast.success(response.data.message);
      toast.info(`Mock OTP: ${response.data.otp}`);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        identifier,
        otp
      });
      
      login(response.data.access_token, response.data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          data-testid="back-to-home-btn"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2" data-testid="login-heading">
            Welcome to Nishchit
          </h1>
          <p className="text-center text-gray-600 mb-8" data-testid="login-subheading">
            {step === 1 ? 'Enter your details to continue' : 'Enter the OTP sent to your device'}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="identifier" className="text-gray-700 font-medium">
                    Email or Aadhaar Number
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or 12-digit Aadhaar"
                    className="mt-2 border-gray-300"
                    data-testid="identifier-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-lg"
                  disabled={loading}
                  data-testid="send-otp-btn"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-gray-700 font-medium">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    className="mt-2 border-gray-300 text-center text-2xl tracking-widest"
                    data-testid="otp-input"
                  />
                  <p className="text-sm text-gray-500 mt-2">Mock OTP: 1234</p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-lg"
                  disabled={loading}
                  data-testid="verify-otp-btn"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                  }}
                  className="w-full"
                  data-testid="change-number-btn"
                >
                  Change Number
                </Button>
              </div>
            </form>
          )}

          {/* Test Credentials */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">Test Credentials:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Citizen:</strong> rajesh@example.com</p>
              <p><strong>Dealer:</strong> dealer1@example.com</p>
              <p><strong>Admin:</strong> admin@example.com</p>
              <p className="mt-2"><strong>OTP:</strong> 1234 (for all users)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;