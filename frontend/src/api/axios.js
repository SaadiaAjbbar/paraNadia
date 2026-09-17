import axios from 'axios';

const api = axios.create({
    // كياخد رابط الـ Production فـ Render إلا كان مبيّن فـ env، ولا كيرجع لـ localhost
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 1. إرسال Token تلقائياً فـ كاع الـ Requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. التقاط خطأ 401 وإعادة التوجيه لصفحة التسجيل
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // مسح الـ Token القديم/غير الصالح
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // التوجيه لصفحة الـ Login (إلا ما كنتيش فيها)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;