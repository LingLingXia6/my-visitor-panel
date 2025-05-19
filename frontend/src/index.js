import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Add this line for Ant Design v5
import 'antd/dist/reset.css';

// 在文件顶部添加
import { ConfigProvider } from 'antd';

// 添加兼容性配置
ConfigProvider.config({
  theme: {
    hashed: false,
  },
  // 关闭兼容性警告
  warning: false,
});

// 添加以下代码来过滤 findDOMNode 警告
const originalConsoleError = console.error;
console.error = function filterWarnings(msg, ...args) {
  if (typeof msg === 'string' && msg.includes('Warning: findDOMNode')) {
    return;
  }
  originalConsoleError(msg, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove StrictMode to avoid findDOMNode warnings
  <App />
);

reportWebVitals();