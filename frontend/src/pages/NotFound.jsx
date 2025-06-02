import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        className="not-found-page"
        extra={
          <Button 
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            className="home-button"
          >
            返回首页
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;