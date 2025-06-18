import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Checkbox } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user";
import Cookies from "js-cookie";
import logo from "../images/logo.png";
import styles from "./Login.module.css";

// 浮动粒子组件
const FloatingParticles = () => {
  return (
    <div className={styles.floatingParticles}>
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className={`${styles.particle} ${styles[`particle${i + 1}`]}`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 6}s`
          }}
        />
      ))}
    </div>
  );
};

// SVG波浪装饰组件
const WaveDecoration = () => {
  return (
    <div className={styles.waveDecoration}>
      <svg className={styles.waveSvg} viewBox="0 0 100 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(148, 163, 184, 0.15)" />
            <stop offset="50%" stopColor="rgba(203, 213, 225, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(148, 163, 184, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </linearGradient>
        </defs>
        <path 
          className={styles.wavePath1}
          fill="url(#waveGradient1)" 
          d="M0,0 C30,100 70,200 100,300 C70,400 30,500 0,600 C30,700 70,800 100,900 L100,0 L0,0"
        />
        <path 
          className={styles.wavePath2}
          fill="url(#waveGradient2)" 
          d="M0,100 C30,200 70,300 100,400 C70,500 30,600 0,700 C30,800 70,900 100,1000 L100,100 L0,100"
        />
      </svg>
    </div>
  );
};

// 动态背景光效组件
const DynamicBackground = () => {
  return (
    <div className={styles.dynamicBackground}>
      <div className={`${styles.gradientOrb} ${styles.orb1}`}></div>
      <div className={`${styles.gradientOrb} ${styles.orb2}`}></div>
      <div className={`${styles.gradientOrb} ${styles.orb3}`}></div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 生成验证码
  const generateCode = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setVerificationCode(code);
  };

  useEffect(() => {
    // 页面加载动画
    setTimeout(() => setIsLoaded(true), 100);
    setTimeout(() => setFormVisible(true), 500);
    // 初始化验证码
    generateCode();
  }, []);

  const onFinish = async (values) => {
    // 验证码检查
    if (inputCode.toLowerCase() !== verificationCode.toLowerCase()) {
      message.error("验证码错误，请重新输入");
      generateCode();
      setInputCode("");
      return;
    }

    try {
      const response = await login(values);
      const { token } = response?.data;
      Cookies.set("token", token, { expires: rememberMe ? 30 : 1, path: "/" });
      message.success("登录成功");
      navigate("/visitors");
    } catch (error) {
      console.error("登录失败", error);
      generateCode();
      setInputCode("");
    }
  };

  return (
    <div className={`${styles.loginContainer} ${isLoaded ? styles.loaded : ""}`}>
      {/* 左侧品牌区域 */}
      <div className={styles.leftPanel}>
        {/* 动态背景光效 */}
        <DynamicBackground />
        
        {/* 几何图案背景 */}
        <div className={styles.patternBackground}></div>
        
        {/* 浮动粒子 */}
        <FloatingParticles />
        
        {/* 品牌信息 */}
        <div className={styles.brandInfo}>
          <div className={styles.logoSection}>
            <div className={styles.logoWrapper}>
              <i className={styles.logoIcon}>🏢</i>
            </div>
            <div className={styles.companyDetails}>
              <div className={styles.companyName}>铁锚科技</div>
              <div className={styles.companySubtitle}>TM Technology</div>
            </div>
          </div>
        </div>
        
        {/* SVG波浪装饰 */}
        <WaveDecoration />
      </div>

      {/* 右侧登录区域 */}
      <div className={styles.rightPanel}>
        <div className={`${styles.loginCard} ${formVisible ? styles.visible : ""}`}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>铁锚科技访客管理系统</h1>
            <p className={styles.cardSubtitle}>欢迎使用智能访客管理系统</p>
          </div>

          <Form
            name="login"
            initialValues={{ remember: rememberMe }}
            onFinish={onFinish}
            className={styles.loginForm}
            autoComplete="off"
            layout="vertical"
          >
            {/* 用户名输入框 */}
            <Form.Item
              name="login"
              rules={[{ required: true, message: "请输入用户名!" }]}
              className={styles.formItem}
            >
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconWrapper}>
                  <UserOutlined className={styles.inputIcon} />
                </div>
                <Input
                  placeholder="请输入用户名"
                  className={styles.customInput}
                  size="large"
                />
              </div>
            </Form.Item>

            {/* 密码输入框 */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码!" }]}
              className={styles.formItem}
            >
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconWrapper}>
                  <LockOutlined className={styles.inputIcon} />
                </div>
                <Input.Password
                  placeholder="请输入密码"
                  className={styles.customInput}
                  size="large"
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </div>
            </Form.Item>

            {/* 验证码 */}
            <div className={styles.verificationRow}>
              <Form.Item
                name="verificationCode"
                rules={[{ required: true, message: "请输入验证码!" }]}
                className={styles.verificationItem}
              >
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIconWrapper}>
                    <SafetyOutlined className={styles.inputIcon} />
                  </div>
                  <Input
                    placeholder="请输入验证码"
                    className={styles.customInput}
                    size="large"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                  />
                </div>
              </Form.Item>
              <button
                type="button"
                className={styles.verificationBtn}
                onClick={generateCode}
              >
                {verificationCode}
              </button>
            </div>

            {/* 记住密码和忘记密码 */}
            <div className={styles.formOptions}>
              <div className={styles.rememberSection}>
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.customCheckbox}
                >
                  记住密码
                </Checkbox>
              </div>
              <a href="#" className={styles.forgotLink}>
                忘记密码？
              </a>
            </div>

            {/* 登录按钮 */}
            <Form.Item className={styles.submitSection}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginBtn}
                size="large"
                block
              >
                登 录
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.cardFooter}>
            <p>© 2025 铁锚科技 版权所有</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
