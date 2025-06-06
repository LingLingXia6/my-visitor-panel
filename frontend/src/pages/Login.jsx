import React from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user";
import Cookies from "js-cookie";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await login(values);
      const { token } = response?.data;
      Cookies.set("token", token, { expires: 30, path: "/" });
      message.success("登录成功");
      navigate("/visitors");
    } catch (error) {
      console.error("登录失败", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-overlay"></div>

      <div className="login-content-wrapper">
        <div className="login-card">
          <div className="login-logo-container">
            <i className="fas fa-anchor login-logo"></i>
          </div>

          <h1 className="login-title">铁锚科技访客管理系统</h1>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            className="login-form"
          >
            <Form.Item
              name="login"
              rules={[{ required: true, message: "请输入用户名!" }]}
            >
              <Input
                prefix={<i className="fas fa-user input-icon"></i>} // 使用 Font Awesome 用户图标
                placeholder="用户名"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码!" }]}
            >
              <Input.Password
                prefix={<i className="fas fa-lock input-icon"></i>} // 使用 Font Awesome 锁图标
                placeholder="密码"
                className="login-input"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-button">
                登录
              </Button>
            </Form.Item>
          </Form>

          <p className="login-footer">© 2024 铁锚科技 版权所有</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
