import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const RouteChangeListener = () => {
  const location = useLocation();
  const { fetchUserInfo } = useUser();
  
  useEffect(() => {
    fetchUserInfo();
  }, [location.pathname]);
  
  return null; // 这是一个功能性组件，不渲染任何内容
};

export default RouteChangeListener;