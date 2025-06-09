import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserInfo } from '../api/user';
import Cookies from 'js-cookie';

// 创建上下文
const UserContext = createContext(null);

// 创建提供者组件
export const UserProvider = ({ children }) => {
  const token = Cookies.get('token');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取用户信息的函数
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await getUserInfo();
      if (response && response.status) {
        setUserInfo(response.data);
      }
    } catch (err) {
      setError(err);
      console.error('获取用户信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 清除用户信息（用于登出）
  const clearUserInfo = () => {
    setUserInfo(null);
  };

  // 组件挂载时检查 token 并获取用户信息
  useEffect(() => {
    console.log("UserProvider -----token",token)
    if (token) {
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, [token]);
console.log("UserProvider -----userInfo",userInfo)
  return (
    <UserContext.Provider value={{ userInfo, loading, error, fetchUserInfo, clearUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

// 创建自定义 Hook 以便于使用上下文
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser 必须在 UserProvider 内部使用');
  }
  return context;
};