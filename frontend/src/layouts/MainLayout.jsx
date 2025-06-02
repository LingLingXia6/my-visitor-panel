import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CustomerServiceOutlined,
  LockOutlined,
  FormOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie'; 
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

// 将 Header 提取为独立的记忆化组件
const LayoutHeader = React.memo(({ collapsed, setCollapsed, userMenuItems }) => (
  <Header className="main-header">
    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: () => setCollapsed(!collapsed),
    })}
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
      <div className="user-dropdown">
        <Avatar icon={<UserOutlined />} className="user-avatar" />
        <span className="user-name">管理员</span>
      </div>
    </Dropdown>
  </Header>
));

// 在 MainLayout 组件中使用记忆化的 Header 组件
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('0'); // 默认选中歌手管理
  
  // Define the missing refs
  const siderRef = useRef(null);
  const menuRef = useRef(null);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathname = location.pathname;
    
    // 路径与菜单键值的映射关系
    const pathToKeyMap = {
      '/visitor': '0',
      '/forms': '1',
      '/visitors': '2',
      '/change-password': '4',
    };
    
  
    console.log('pathname',pathname);
  
    
    setSelectedKey(pathToKeyMap[pathname]);
  }, [location.pathname]);

  const handleLogout =  () => {
    try {
       // 清除 Cookie 中的 token
       Cookies.remove('token', { path: '/' });
       message.success('退出登录成功');
       navigate('/login');
    } catch (error) {
      console.error('退出登录失败', error);
    }
  };

  // 修改：使用 items 属性替代 Menu.Item 子组件
  const userMenuItems = [
    {
      key: '2',
      icon: <SettingOutlined />,
      label: <Link to="/change-password">修改密码</Link>
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>退出登录</span>
    }
  ];

  // 修改：侧边栏菜单项，移除仪表盘选项并重新编号
  // 修改菜单项定义，使用 Link 组件替代点击事件处理函数
  // 修改菜单项配置
  const sideMenuItems = [
    {
      key: '0',
      icon: <FormOutlined />,
      label: <Link to="/visitor">访客在线申请表</Link>
    },
    {
      key: '1',
      icon: <UnorderedListOutlined />,
      label: <Link to="/forms">访客申请单</Link>
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: <Link to="/visitors">访客信息</Link>,
      path: '/visitors'
    },
    {
      key: '3',
      icon: <UnorderedListOutlined />,
      label: <Link to="/host-info">被拜访人信息</Link>
    },
    {
      key: '4',
      icon: <LockOutlined />,
      label: <Link to="/change-password">修改密码</Link>
    },
  ]

  return (
    <Layout className="main-layout">
      <Sider 
        ref={siderRef}
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="main-sider"
        width={220}
      >
        <div className={`logo-container ${collapsed ? 'logo-container-collapsed' : 'logo-container-expanded'}`}>
          {!collapsed && <span>访客管理系统</span>}
          {collapsed && <CustomerServiceOutlined />}
        </div>
        <Menu
          ref={menuRef}
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          className="main-menu"
          items={sideMenuItems}
        />
      </Sider>
      
      <Layout>
        <LayoutHeader 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          userMenuItems={userMenuItems} 
        />
        
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;