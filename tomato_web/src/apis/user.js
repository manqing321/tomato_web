import http_instance from '@/utils/http.js';

const login = (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return http_instance({
        method: 'post',
        url: 'user/token/',
        data: formData
    })};

    
const register = (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return http_instance({
        method: 'post',
        url: 'user/create_user/',
        data: formData
    })};

export { register, login };