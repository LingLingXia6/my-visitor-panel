import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Cookies from 'js-cookie';

const RouteChangeListener = () => {
  const location = useLocation();
  const { fetchUserInfo } = useUser();
  const token = Cookies.get('token');
  //监测路由切换时，是否需要获取用户信息
  useEffect(() => {
    if(location?.pathname!=="/login"){
      if(token){
        // 切换路由时，如果userInfo没有了，获取用户信息，
        fetchUserInfo();
      }else{
        // token失效则跳转到登录页面
        window.location.href="/login";
      }
      
    }
   
  
  }, [location.pathname]);
  
  return null; // 这是一个功能性组件，不渲染任何内容
};

export default RouteChangeListener;