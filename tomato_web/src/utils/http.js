import axios from "axios";
import router from "@/routers/route";

// 1 创建 axios 实例
const http_instance = axios.create({
    // 接口基础地址
    baseURL: "https://tomato-clock.cn/api/",
    // 超时时间
    timeout: 5000, 
})


http_instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


http_instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      // 跳转到登录页
      router.push('/auth');
    }
    return Promise.reject(error);
  }
);

export default http_instance;