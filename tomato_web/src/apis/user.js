import http_instance from '@/utils/http.js';

const login = (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return http_instance({
        method: 'post',
        url: 'user/token/',
        data: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'  },
    })};

    
const register = (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return http_instance({
        method: 'post',
        url: 'user/create_user/',
        data: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'  },
    })};

export { register, login };