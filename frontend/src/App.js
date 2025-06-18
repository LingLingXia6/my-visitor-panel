import React, { Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ConfigProvider, Spin } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import Cookies from "js-cookie";
import { UserProvider } from "./context/UserContext";

// 懒加载组件
const MainLayout = React.lazy(() => import("./layouts/MainLayout"));
const Login = React.lazy(() => import("./pages/Login"));
const Users = React.lazy(() => import("./pages/Users"));
const ChangePassword = React.lazy(() => import("./pages/ChangePassword"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const VisitorPage = React.lazy(() => import("./pages/VisitorPage"));
const VisitFormList = React.lazy(() => import("./pages/VisitFormList"));
const VisitorList = React.lazy(() => import("./pages/VisitorList"));
const VisitorCheck = React.lazy(() => import("./pages/VisitorCheck"));
const HostInfo = React.lazy(() => import("./pages/HostInfo"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));

// 加载中组件
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="页面加载中..." />
  </div>
);

// 获取token用于路由守卫
const getToken = () => Cookies.get("token");

// 主应用路由配置
const PRIVATE_ROUTES = [
  // 仪表盘
  { path: "dashboard", element: <Dashboard />, icon: "Dashboard" },
  // 系统管理路由
  { path: "change-password", element: <ChangePassword />, icon: "Lock" },
  { path: "users", element: <Users />, icon: "Team" },
  // 访客管理路由
  { path: "visitor", element: <VisitorPage />, icon: "Form" },
  { path: "forms", element: <VisitFormList />, icon: "UnorderedList" },
  { path: "visitors", element: <VisitorList />, icon: "Team" },
  { path: "host-info", element: <HostInfo />, icon: "Team" },
];
const PUBLIC_ROUTES = [
  { path: "/visitorform", element: <VisitorPage /> },
  { path: "/visitor-check/:formId", element: <VisitorCheck /> },
  { path: "/login", element: <Login /> },
];
// 路由守卫组件 - 动态获取token以确保最新状态
const PrivateRoute = () => {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/login" />;
};

// 渲染应用路由的函数
const PrivateRoutes = () =>
  PRIVATE_ROUTES.map(({ path, element }) => (
    <Route key={path} path={path} element={element} />
  ));

const PublicRoute = () =>
  PUBLIC_ROUTES.map((item) => (
    <Route key={item.path} path={item.path} element={item.element} />
  ));

function App() {
  return (
    <UserProvider>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* 对外公共页面 */}
              {PublicRoute()}
              {/* 路由守卫的页面 */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<MainLayout routes={PRIVATE_ROUTES} />}>
                  {PrivateRoutes()}
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ConfigProvider>
    </UserProvider>
  );
}

export default App;
