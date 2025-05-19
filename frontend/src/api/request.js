import axios from 'axios';
import { message } from 'antd';
import Cookies from 'js-cookie'; // 导入 js-cookie

// 创建axios实例
const request = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8082',
  timeout: 10000,
  withCredentials: false, // 允许跨域请求携带凭证
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 优先从 Cookie 获取 token，如果没有则从 localStorage 获取
    const cookieToken = Cookies.get('token');
   
    const token = cookieToken ;
    
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 安全处理：移除响应配置中的敏感信息
    if (response.config && response.config.data) {
      try {
        const data = JSON.parse(response.config.data);
        if (data.password) {
          // 创建一个新对象，不包含密码
          const safeData = { ...data };
          delete safeData.password;
          // 替换原始数据
          response.config.data = JSON.stringify(safeData);
          console.log('拦截器', response.config.data);
        }
      } catch (e) {
        // 如果解析失败，不做处理
        console.log('数据解析失败，无法安全处理');
      }
    }
    
    console.log('拦截器response', response.data);
    return response.data;
  },
  (error) => {
    const { response } = error;
    if (response && response.status) {
      switch (response.status) {
        case 401:
          message.error('未授权，请重新登录');
          Cookies.remove('token', { path: '/' });
          // 延迟跳转，确保消息显示
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(response.data.message || '未知错误');
      }
    } else {
      message.error('网络错误，请检查您的网络连接');
    }
    return Promise.reject(error);
  }
);

export default request;