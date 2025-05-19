import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/user';
import { useUser } from '../context/UserContext';
import Cookies from 'js-cookie';
import './Login.css';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { fetchUserInfo } = useUser(); // 使用 useUser hook
  const onFinish = async (values) => {
    try {
      console.log(" login values: ", values);
     const response = await login(values);
     const { token } = response?.data;
     // 设置 cookie，过期时间为 30 天
     Cookies.set('token', token, { 
       expires: 30, // 天数
       path: '/'
     });
    // 登录成功后获取用户信息
    await fetchUserInfo();
     message.success('登录成功');
      navigate('/singers');
    
    } catch (error) {
      console.error('登录失败', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <CustomerServiceOutlined className="login-logo" />
          <Title level={2} className="login-title">音乐管理系统</Title>
        </div>
        {/* Remove the duplicate Card tags and comments */}
        <Card className="login-card" variant="outlined">
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            className="login-form"
          >
            <Form.Item
              name="login"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined className="input-icon" />} 
                placeholder="用户名" 
                size="large"
                className="login-input"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="密码"
                size="large"
                className="login-input"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="login-button"
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;