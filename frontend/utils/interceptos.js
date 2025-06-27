// axiosInstance.js
import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
});


export default api;
