// ../../config/api.js
const { VITE_API_URL } = import.meta.env;
export default VITE_API_URL || 'http://localhost:3000/api'; // Fallback to localhost:3000/api if env var not set