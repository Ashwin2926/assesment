import axios from 'axios';
 

const API_URL = 'http://127.0.0.1:8000';
const BASE_URL = `${API_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      // Handle logout in app
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, user_type) =>
    api.post('/auth/register', { name, email, password, user_type }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const requestService = {
  getRequests: () => api.get('/requests'),
  createRequest: (data) => api.post('/requests', data),
  getRequest: (id) => api.get(`/requests/${id}`),
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  updateRequestStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
};

export default api;
