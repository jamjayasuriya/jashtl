import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaShieldAlt, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';
import illustration from '../assets/images/illustration.png';
import sunflowerBg from '../assets/images/sunflower.jpg';

const Login = ({ onSuccess, isPopup = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Load remembered username on component mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    if (remembered === 'true') {
      const savedUsername = localStorage.getItem('savedUsername');
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }
    }
  }, []);

  // Advanced validation
  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.trim().length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.length > 0 && value.length < 3) {
      setValidationErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
    } else if (value.length >= 3) {
      setValidationErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value.length > 0 && value.length < 6) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else if (value.length >= 6) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setIsValidating(true);

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      setIsValidating(false);
      return;
    }

    try {
      const API_URL = 'http://localhost:3000';
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        username: username.trim(),
        password: password.trim(),
      });
      
      console.log('Login successful, token:', data.token);
      localStorage.setItem('token', data.token);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedUsername', username.trim());
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
      }
      
      // Show success message
      setSuccessMessage('Login successful! Redirecting...');
      
      // Delay navigation for better UX
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/pos');
        }
      }, 1500);
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      let message = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        message = 'Invalid username or password';
      } else if (error.response?.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Please check your connection.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  if (isPopup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white p-8 shadow-2xl w-full max-w-md rounded-2xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 ${
                    focusedField === 'username' 
                      ? 'border-amber-500 ring-2 ring-amber-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none transition-all duration-200 ${
                    focusedField === 'password' 
                      ? 'border-amber-500 ring-2 ring-amber-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => onSuccess && onSuccess()}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%),
          url(${sunflowerBg})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-400/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-500"></div>
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-white text-xs" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent mb-3">
              Restaurant POS
            </h1>
            <p className="text-gray-600 text-lg font-medium">Enterprise Authentication Portal</p>
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50/90 border border-green-200 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/90 border border-red-200 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FaUser className="inline mr-2 text-amber-600" />
                Username
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300`}></div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your username"
                  className={`relative w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium placeholder-gray-500 ${
                    validationErrors.username
                      ? 'border-red-400 ring-2 ring-red-200'
                      : focusedField === 'username' 
                        ? 'border-amber-400 ring-2 ring-amber-200 shadow-lg' 
                        : 'border-gray-300 hover:border-amber-300 hover:shadow-md'
                  }`}
                  required
                />
                <FaUser className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-sm transition-colors duration-200 ${
                  focusedField === 'username' ? 'text-amber-500' : 'text-gray-400'
                }`} />
                {username && !validationErrors.username && (
                  <FaCheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 text-sm" />
                )}
              </div>
              {validationErrors.username && (
                <p className="text-red-500 text-xs font-medium flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {validationErrors.username}
                </p>
              )}
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FaLock className="inline mr-2 text-amber-600" />
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300`}></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your password"
                  className={`relative w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium placeholder-gray-500 ${
                    validationErrors.password
                      ? 'border-red-400 ring-2 ring-red-200'
                      : focusedField === 'password' 
                        ? 'border-amber-400 ring-2 ring-amber-200 shadow-lg' 
                        : 'border-gray-300 hover:border-amber-300 hover:shadow-md'
                  }`}
                  required
                />
                <FaLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-sm transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-amber-500' : 'text-gray-400'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {password && !validationErrors.password && (
                  <FaCheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500 text-sm" />
                )}
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs font-medium flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {validationErrors.password}
                </p>
              )}
            </div>
            
            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${
                    rememberMe 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-400' 
                      : 'border-gray-300 group-hover:border-amber-400'
                  }`}>
                    {rememberMe && (
                      <FaCheckCircle className="text-white text-xs absolute top-0.5 left-0.5" />
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                  Remember me
                </span>
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isValidating}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                loading || isValidating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-500 hover:via-orange-600 hover:to-amber-700 text-white shadow-2xl hover:shadow-amber-500/25 hover:-translate-y-1 active:translate-y-0'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-3 text-lg" />
                  Authenticating...
                </span>
              ) : isValidating ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-3 text-lg" />
                  Validating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaShieldAlt className="mr-3 text-lg" />
                  Secure Login
                </span>
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-10 text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <FaShieldAlt className="text-amber-500" />
              <span>256-bit SSL Encryption</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Restaurant Point of Sale System v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;