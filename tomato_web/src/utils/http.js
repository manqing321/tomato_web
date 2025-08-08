import axios from "axios";

// 1 创建 axios 实例
const http_instance = axios.create({
    // 接口基础地址
    baseURL: "https://tomato-clock.cn/api/",
    // 超时时间
    timeout: 5000, 
})

// 2 请求拦截器
http_instance.interceptors.request.use(
    config => {
        // 添加 token
        // const token = localStorage.getItem("token");
        // if (token) {
        //     config.headers.Authorization = token;
        // }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

// 3 响应拦截器
http_instance.interceptors.response.use(
    response => {
        // 获取返回数据
        const res = response;
        return res;
    },
    error => {
        return Promise.reject(error);
    }
)
// 导出实例
export default http_instance;