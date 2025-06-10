import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Cookies from 'js-cookie'; // 导入 js-cookie
import Users from './pages/Users';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';
import VisitorPage from './pages/VisitorPage';
import VisitFormList from './pages/VisitFormList'; // 导入新组件
import VisitorList from './pages/VisitorList';
import HostInfo from './pages/HostInfo'; // 导入新组件
import {UserProvider} from './context/UserContext';
import RouteChangeListener from './components/RouteChangeListener';
// 修改路由配置
const APP_ROUTES = [
  // 系统设置路由
  { path: "change-password", element: <ChangePassword />, icon: "Lock" },
  { path: "users", element: <Users />, icon: "Team" },
  { path: "visitor", element: <VisitorPage />, icon: "Form" }, // 访客登记路由
  { path: "forms", element: <VisitFormList />, icon: "UnorderedList" } ,// 添加访客申请单列表路由
  { path: "visitors", element: <VisitorList />, icon: "Team" },
  { path: "host-info", element: <HostInfo />, icon: "Team" } // 添加新路由
];
// 路由守卫组件 - 从 Cookie 获取 token
const PrivateRoute = ({ children }) => {
  const token = Cookies.get('token');
  return token ? children : <Navigate to="/login" />;
 
};

// 渲染应用路由的函数
const renderAppRoutes = (routes) => {
  return routes.map(({ path, element }) => (
    <Route key={path} path={path} element={element} />
  ));
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <UserProvider>
          <RouteChangeListener />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <MainLayout routes={APP_ROUTES} />
              </PrivateRoute>
            }>
              {renderAppRoutes(APP_ROUTES)}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;