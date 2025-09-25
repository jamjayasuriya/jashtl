import React, { useState, useEffect, useRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Keypad = ({ onKeyPress, onLogin, layout, setLayout, onClear, onClose }) => {
  const layouts = {
    default: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '{s}'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm', '@', '.', '{s}'],
      ['{meta1}', '{space}', '.', '-', '{accept}'],
    ],
    shift: [
      ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', '{bksp}'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '{enter}'],
      ['Y', 'X', 'C', 'V', 'B', 'N', 'M', '@', '.', '{s}'],
      ['{meta1}', '{space}', '_', '-', '{accept}'],
    ],
    meta1: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '{bksp}'],
      ['@', '#', '$', '_', '&', '-', '+', '(', ')', '/', '{enter}'],
      ['*', '"', "'", ':', ';', '!', '?', '{s}'],
      ['.,', ',', '{space}', 'abc', '{accept}'],
    ],
  };

  const getKeyClass = (key) => {
    const baseClass = 'flex items-center justify-center rounded-md h-8 transition-all duration-100 active:scale-95';
    let widthClass = 'w-8';
    let colorClass = 'bg-gray-100 hover:bg-gray-200 text-gray-800';
    let textClass = 'font-mono text-xs font-medium';
    let marginClass = 'mx-0.5';

    if (key === '{space}') {
      widthClass = 'w-32 sm:w-40'; // Responsive width
      colorClass = 'bg-gray-200 hover:bg-gray-300';
      textClass = 'font-sans text-xs uppercase tracking-wider';
    } else if (key === '{bksp}' || key === '{enter}' || key === '{accept}') {
      colorClass = 'bg-blue-500 hover:bg-blue-600 text-white';
      textClass = 'font-sans text-xs font-bold tracking-wider';
    } else if (key === '{meta1}' || key === '{s}') {
      colorClass = 'bg-gray-300 hover:bg-gray-400';
      widthClass = 'w-10 sm:w-12'; // Responsive width
      textClass = 'font-sans text-2xs font-bold uppercase';
    } else if (key === 'abc' || key === '.,') {
      colorClass = 'bg-blue-400 hover:bg-blue-500 text-white';
      textClass = 'font-sans text-xs font-bold';
    }

    if (/[0-9]/.test(key)) {
      colorClass = 'bg-white hover:bg-gray-100 border border-gray-200';
      textClass = 'font-digital text-sm font-bold tracking-tighter';
    } else if (/[a-zA-Z]/.test(key)) {
      colorClass = 'bg-white hover:bg-gray-100 border border-gray-200';
      textClass = 'font-serif text-xs italic';
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(key)) {
      colorClass = 'bg-gray-100 hover:bg-gray-200';
      textClass = 'font-mono text-2xs font-light';
    }

    return `${baseClass} ${colorClass} ${widthClass} ${marginClass} ${textClass}`;
  };

  const handleKeyClick = (key) => {
    switch (key) {
      case '{bksp}':
        onKeyPress('back');
        break;
      case '{enter}':
      case '{accept}':
        onLogin();
        break;
      case '{space}':
        onKeyPress(' ');
        break;
      case '{s}':
        setLayout(layout === 'shift' ? 'default' : 'shift');
        break;
      case '{meta1}':
        setLayout('meta1');
        break;
      case 'abc':
      case '.,':
        setLayout('default');
        break;
      default:
        onKeyPress(key);
    }
  };

  const getDisplayKey = (key) => {
    switch (key) {
      case '{bksp}': return '←';
      case '{enter}': return 'return';
      case '{s}': return '⇧';
      case '{accept}': return '↓';
      case '{space}': return ' ';
      case '{meta1}': return '.?123';
      case 'abc': return 'abc';
      case '.,': return '.,';
      default: return key;
    }
  };

  return (
    <div className="fixed bg-blue-800 p-1 rounded-md shadow-sm border border-gray-600 w-full max-w-[90vw] sm:max-w-[430px] top-4 left-1/2 transform -translate-x-1/2 max-h-[50vh] sm:max-h-[210px]">
      <div className="flex justify-end mb-1">
        <button
          onClick={onClose}
          className="text-xs text-yellow-50 hover:text-red-600 px-2 py-0.5"
        >
          Close
        </button>
      </div>
      {layouts[layout].map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-0.5">
          {row.map((key) => (
            <button
              key={`${rowIndex}-${key}`}
              onClick={() => handleKeyClick(key)}
              className={getKeyClass(key)}
            >
              {getDisplayKey(key)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const LoginPopup = ({ isOpen, onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [loginError, setLoginError] = useState('');
  const [layout, setLayout] = useState('default');
  const [showPassword, setShowPassword] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        if (isMounted) setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        if (isMounted) setUsers([]);
      }
    };

    if (isOpen && users.length === 0) fetchUsers();

    return () => { isMounted = false; };
  }, [isOpen, users.length]);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setSelectedUsername('');
      setLoginError('');
      setShowPassword(false);
      setShowKeypad(false);
      setLayout('default');
      passwordInputRef.current?.focus();
    }
  }, [isOpen]);

  const handleLogin = async () => {
    if (!selectedUsername || !password) {
      setLoginError('Please select a user and enter a password');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUsername, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
        onClose();
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Error during login. Please try again.');
    }
  };

  const handleKeypadPress = (value) => {
    if (value === 'back') {
      setPassword((prev) => prev.slice(0, -1));
    } else {
      setPassword((prev) => prev + value);
    }
  };

  const handleClear = () => {
    setPassword('');
    setLoginError('');
    setShowKeypad(false);
    setLayout('default');
    passwordInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
    else if (e.key === 'Backspace') setPassword((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-40 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full overflow-hidden">
        <div className="flex flex-col md:flex-row gap-x-0">
          {/* Left - Image & Users */}
          <div className="md:w-1/2 flex flex-col gap-y-0">
            <div className="h-48 sm:h-64">
              <img
                src="/src/assets/images/sunflower.jpg"
                alt="login"
                className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
            <div className="p-2 sm:p-4">
              <h4 className="text-sm font-semibold text-blue-500 mb-1 uppercase tracking-wide">Select User</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {users.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => {
                      setSelectedUsername(user.username);
                      setPassword('');
                      setLoginError('');
                      passwordInputRef.current?.focus();
                    }}
                    className={`
                      p-1 rounded-lg transition-all duration-200
                      flex items-center justify-center
                      border-2
                      border-blue-500
                      ${
                        selectedUsername === user.username
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
                    `}
                  >
                    <span className="truncate">{user.username}</span>
                    {selectedUsername === user.username && (
                      <svg className="w-4 h-4 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="md:w-1/2 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800">POS Login</h3>
              {loginError && <p className="text-red-500 mb-2">{loginError}</p>}
              <div className="mb-3">
                <label className="block text-sm mb-1 text-blue-800">Username</label>
                <input
                  type="text"
                  value={selectedUsername}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div className="mb-4 relative">
                <label className="block text-sm mb-1 text-blue-800">Password</label>
                <div className="flex gap-2">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    readOnly
                    onKeyDown={handleKeyDown}
                    onClick={() => setShowKeypad(true)}
                    className="flex-1 p-1 border rounded text-center text-xl"
                    placeholder={selectedUsername ? 'Enter Password' : 'Select user first'}
                    disabled={!selectedUsername}
                    autoComplete="new-password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 border-blue-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-1 bg-blue-500 text-white rounded w-20"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogin}
                className="w-3/4 sm:w-1/2 bg-green-600 text-white py-1 rounded"
                disabled={!selectedUsername}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
      {showKeypad && (
        <Keypad
          onKeyPress={handleKeypadPress}
          onLogin={handleLogin}
          layout={layout}
          setLayout={setLayout}
          onClear={handleClear}
          onClose={() => setShowKeypad(false)}
        />
      )}
    </div>
  );
};

export default LoginPopup;