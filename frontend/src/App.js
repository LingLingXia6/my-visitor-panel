import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
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

// 获取token用于路由守卫
const getToken = () => Cookies.get("token");

// 主应用路由配置
const PRIVATE_ROUTES = [
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
        </BrowserRouter>
      </ConfigProvider>
    </UserProvider>
  );
}

export default App;
