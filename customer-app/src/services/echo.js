import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
window.Pusher = Pusher;

// Get configuration from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const PUSHER_APP_KEY = 'a634f54f94dbb9d6d523';
const PUSHER_CLUSTER = import.meta.env.REACT_APP_PUSHER_CLUSTER || 'ap1';

if (!PUSHER_APP_KEY) {
  console.error('⚠️ PUSHER_APP_KEY is not set in environment variables!');
}

// Initialize Laravel Echo with Pusher
const echo = new Echo({
  broadcaster: 'pusher',
  key: PUSHER_APP_KEY,
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
  encrypted: true,
  
  // Enable debug logs in development
  enabledTransports: ['ws', 'wss'],
  
  // Auth endpoint for private channels  
  authEndpoint: `${BACKEND_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  },
});

// Log connection status
if (window.Pusher) {
  window.Pusher.logToConsole = process.env.NODE_ENV === 'development';
}

console.log('🔌 Laravel Echo initialized with Pusher');
console.log('📡 Cluster:', PUSHER_CLUSTER);
console.log('🔑 Key:', PUSHER_APP_KEY ? 'Set' : 'Missing');

export default echo;
