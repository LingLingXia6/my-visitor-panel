import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  // 移除 DashboardOutlined 导入
  SettingOutlined,
  LogoutOutlined,
  CustomerServiceOutlined,
  SoundOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  LockOutlined
} from '@ant-design/icons';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie'; 


const { Header, Sider, Content } = Layout;

// 将 Header 提取为独立的记忆化组件
const LayoutHeader = React.memo(({ collapsed, setCollapsed, userMenuItems }) => (
  <Header style={{ 
    padding: '0 24px', 
    background: 'rgba(245, 247, 250, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: () => setCollapsed(!collapsed),
      style: { color: '#e85d00' }
    })}
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#e85d00' }} />
        <span style={{ color: '#4d3800' }}>管理员</span>
      </div>
    </Dropdown>
  </Header>
));

// 在 MainLayout 组件中使用记忆化的 Header 组件
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('2'); // 默认选中歌手管理
  
  // Define the missing refs
  const siderRef = useRef(null);
  const menuRef = useRef(null);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathname = location.pathname;
    
    // 路径与菜单键值的映射关系
    const pathToKeyMap = {
      '/singers': '1',
      '/songs': '2',
      '/select-singer-songs': '3',
      '/orders': '4',
      '/withdrawals': '5',
      '/change-password': '6'
    };
    
    // 查找匹配的路径并设置对应的键值
    const matchedPath = Object.keys(pathToKeyMap).find(path => 
      pathname.includes(path)
    );
    
    if (matchedPath) {
      setSelectedKey(pathToKeyMap[matchedPath]);
    }
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
  const sideMenuItems = [
    // {
    //   key: '1',
    //   icon: <CustomerServiceOutlined />,
    //   label: <Link to="/singers">歌手管理</Link>
    // },
    // {
    //   key: '2',
    //   icon: <SoundOutlined />,
    //   label: <Link to="/songs">歌曲管理</Link>
    // },
    // {
    //   key: '3',
    //   icon: <SoundOutlined />,
    //   label: <Link to="/select-singer-songs">歌手歌曲管理</Link>
    // },
    // {
    //   key: '4',
    //   icon: <ShoppingCartOutlined />,
    //   label: <Link to="/orders">订单管理</Link>
    // },
    // {
    //   key: '5',
    //   icon: <WalletOutlined />,
    //   label: <Link to="/withdrawals">提现管理</Link>
    // },
    {
      key: '6',
      icon: <LockOutlined />,
      label: <Link to="/change-password">修改密码</Link>
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        ref={siderRef}
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ 
          background: '#e0e7f2', // 冷色系侧边栏
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
          overflow: 'auto',
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid rgba(0, 113, 227, 0.05)'
        }}
        width={220}
      >
        <div className="logo" style={{ 
          margin: '16px', 
          height: '32px', 
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: '#0071e3',
          fontWeight: 500,
          fontSize: '18px'
        }}>
          {!collapsed && <span>访客管理系统</span>}
          {collapsed && <CustomerServiceOutlined />}
        </div>
        <Menu
          ref={menuRef}
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ 
            borderRight: 'none',
            padding: '8px',
            background: 'transparent', // 菜单背景透明
            color: '#2c3e50' // 菜单文字颜色
          }}
          items={sideMenuItems}
        />
      </Sider>
      
      <Layout>
        <LayoutHeader 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          userMenuItems={userMenuItems} 
        />
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 0,
          minHeight: 280,
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;