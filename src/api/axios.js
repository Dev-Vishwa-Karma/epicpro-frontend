import axios from 'axios';
import authService from '../components/Authentication/authService';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

api.interceptors.request.use(config => {
  const user = authService.getUser();
  if (config.url.startsWith('/login.php')) {
    return config;
  }

  if (user) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
