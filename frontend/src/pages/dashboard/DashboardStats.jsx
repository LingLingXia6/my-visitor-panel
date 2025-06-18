import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  HomeOutlined
} from '@ant-design/icons';
import './DashboardStats.css';

const DashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    yearlyVisitors: 0,
    monthlyVisitors: 0,
    dailyVisitors: 0,
    monthlyHosts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/dashboard/stats');
      const result = await response.json();
      
      if (result.status) {
        setStats(result.data);
      } else {
        message.error('获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const statisticCards = [
    {
      title: '一年访问人',
      value: stats.yearlyVisitors,
      valueStyle: { color: '#3f8600' },
      icon: <UserOutlined />,
      trendColor: '#3f8600',
      bgColor: '#e6f7ff',
      iconColor: '#1890ff'
    },
    {
      title: "一个月访问人",
      value: stats.monthlyVisitors,
      valueStyle: { color: '#52c41a' },
      icon: <CalendarOutlined />,
      bgColor: '#f6ffed',
      iconColor: '#52c41a'
    },
    {
      title: '当日访问人',
      value: stats.dailyVisitors,
      valueStyle: { color: '#eb2f96' },
      icon: <TeamOutlined />,
      bgColor: '#fff0f6',
      iconColor: '#eb2f96'
    },
    {
      title: '一个月被拜访人',
      value: stats.monthlyHosts,
      valueStyle: { color: '#fa8c16' },
      icon: <HomeOutlined />,
      trendColor: '#fa8c16',
      bgColor: '#fff7e6',
      iconColor: '#fa8c16'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="加载统计数据中..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        {statisticCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="statistic-card" hoverable>
              <div className="card-content">
                <div className="card-left">
                  <div 
                    className="card-icon"
                    style={{ backgroundColor: card.bgColor, color: card.iconColor }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div className="card-right">
                  <div className="card-value">
                    <Statistic
                      value={card.value}
                      prefix={card.prefix}
                      suffix={card.suffix}
                      precision={card.precision}
                      valueStyle={card.valueStyle}
                    />
                  </div>
                  <div className="card-title">{card.title}</div>
                  <div className="card-trend" style={{ color: card.trendColor }}>
                    {card.trend}
                  </div>
                </div>
                <div className="card-chart">
                  <svg width="60" height="30" viewBox="0 0 60 30">
                    <path
                      d={index % 2 === 0 ? "M5,25 Q15,5 25,15 T45,10 T55,5" : "M5,5 Q15,25 25,15 T45,20 T55,25"}
                      stroke={card.iconColor}
                      strokeWidth="2"
                      fill="none"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardStats;