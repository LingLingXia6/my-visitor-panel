import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Cookies from "js-cookie";
import Users from "./pages/Users";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import VisitorPage from "./pages/VisitorPage";
import VisitFormList from "./pages/VisitFormList";
import VisitorList from "./pages/VisitorList";
import VisitorCheck from "./pages/VisitorCheck";
import HostInfo from "./pages/HostInfo";
import { UserProvider } from "./context/UserContext";
import RouteChangeListener from "./components/RouteChangeListener";


// 获取token用于路由守卫
const getToken = () => Cookies.get("token");

// 主应用路由配置
const APP_ROUTES = [
  // 系统管理路由
  { path: "change-password", element: <ChangePassword />, icon: "Lock" },
  { path: "users", element: <Users />, icon: "Team" },
  // 访客管理路由
  { path: "visitor", element: <VisitorPage />, icon: "Form" },
  { path: "forms", element: <VisitFormList />, icon: "UnorderedList" },
  { path: "visitors", element: <VisitorList />, icon: "Team" },
  { path: "host-info", element: <HostInfo />, icon: "Team" }
];

// 路由守卫组件 - 动态获取token以确保最新状态
const PrivateRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

// 渲染应用路由的函数
const renderAppRoutes = (routes) => {
  return routes.map(({ path, element }) => (
    <Route key={path} path={path} element={element} />
  ));
};

function App() {
  // 获取当前token状态
  const token = getToken();
  
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 - 不需要认证和UserProvider */}
          <Route path="/visitorform" element={<VisitorPage />} />
          <Route path="/visitor-check/:formId" element={<VisitorCheck />} />
          
          
          {/* 需要认证的路由，包裹在UserProvider中 */}
          <Route
            path="/*"
            element={
              <UserProvider>
                <RouteChangeListener />
                <Routes>
                  {/* 登录路由 - 已登录则重定向到表单列表 */}
                  <Route 
                    path="/login" 
                    element={token ? <Navigate to="/forms" /> : <Login />} 
                  />
                  
                  {/* 主应用布局路由 */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <MainLayout routes={APP_ROUTES} />
                      </PrivateRoute>
                    }
                  >
                    {/* 渲染主应用子路由 */}
                    {renderAppRoutes(APP_ROUTES)}
                    {/* 默认重定向到表单列表 */}
                    <Route index element={<Navigate to="/forms" />} />
                  </Route>
                  
                  {/* 404页面 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </UserProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
