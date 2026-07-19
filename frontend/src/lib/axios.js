import axios from 'axios';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
const api = axios.create({
    baseURL: BASE_URL,
});

//Gắn token đăng nhập (nếu có) vào header của mọi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
//Nếu token hết hạn, tự động đăng xuất và về trang login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export default api;