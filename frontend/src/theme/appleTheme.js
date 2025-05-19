import { theme } from 'antd';

const appleTheme = {
  token: {
    colorPrimary: '#0071e3', // 主色调改为苹果蓝
    colorSuccess: '#34c759',
    colorWarning: '#ff9f0a',
    colorError: '#ff453a',
    colorInfo: '#0071e3',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 14,
    colorBgContainer: '#f5f7fa', // 容器背景色改为冷色调
    colorBgElevated: '#f5f7fa',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.05)',
    colorBgLayout: '#edf1f7', // 更新布局背景色为浅冷色
    colorBgBase: '#edf1f7', // 更新基础背景色
  },
  components: {
    Button: {
      controlHeight: 36,
      controlHeightSM: 32,
      controlHeightLG: 40,
      borderRadius: 8,
      borderRadiusSM: 6,
      borderRadiusLG: 10,
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
    },
    Table: {
      borderRadius: 12,
      headerBg: 'rgba(235, 240, 248, 0.8)',
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Modal: {
      borderRadius: 12,
      titleColor: '#2c3e50',
      headerBg: '#f5f7fa',
      contentBg: '#f5f7fa',
      headerBorderColor: '#d0dae9',
      footerBorderColor: '#d0dae9',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    },
    Menu: {
      itemBorderRadius: 8,
      itemSelectedBg: 'rgba(0, 113, 227, 0.1)',
      itemSelectedColor: '#0071e3',
      itemHoverBg: 'rgba(0, 113, 227, 0.05)',
      itemHoverColor: '#0071e3',
    },
    Layout: {
      siderBg: '#e0e7f2', // 侧边栏背景色为冷色
      headerBg: 'rgba(245, 247, 250, 0.9)', // 头部背景色
    },
  },
  algorithm: theme.defaultAlgorithm,
};

export default appleTheme;