import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, message } from 'antd';
import { PhoneOutlined, BankOutlined, NumberOutlined } from '@ant-design/icons';
import './DashboardTopVisitors.css';

const DashboardTopVisitors = () => {
  const [loading, setLoading] = useState(false);
  const [topVisitors, setTopVisitors] = useState([]);

  useEffect(() => {
    fetchTopVisitors();
  }, []);

  const fetchTopVisitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/dashboard/top-visitors');
      const result = await response.json();
      
      if (result.status) {
        setTopVisitors(result.data);
      } else {
        message.error('获取排名前10访客数据失败');
      }
    } catch (error) {
      console.error('获取排名前10访客数据失败:', error);
      message.error('获取排名前10访客数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (text, record, index) => {
        const rank = index + 1;
        return (
          <div className="rank-number">
            <span className="rank-text">{rank}</span>
          </div>
        );
      }
    },
    {
      title: '访客信息',
      dataIndex: 'name',
      key: 'visitor_info',
      render: (text, record) => (
        <div className="visitor-info">
          <div className="visitor-details">
            <div className="visitor-name">{text}</div>
            <div className="company-name">{record.company || '未填写'}</div>
          </div>
        </div>
      )
    },

    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <div className="phone-info">
          <PhoneOutlined className="phone-icon" />
          <span className="phone-number">{text}</span>
        </div>
      )
    },
    {
      title: '访问次数',
      dataIndex: 'form_count',
      key: 'form_count',
      width: 120,
      align: 'center',
      sorter: (a, b) => b.form_count - a.form_count,
      render: (count) => (
        <div className="visit-count">
          <NumberOutlined className="count-icon" />
          <span className="count-number">{count}</span>
          <span className="count-unit">次</span>
        </div>
      )
    }
  ];

  return (
    <Card 
      className="top-visitors-card"
      title={
        <div className="card-title">
          🏆 排名前10访客
        </div>
      }
      extra={
        <div className="card-extra">
          <span className="total-count">共 {topVisitors.length} 位访客</span>
        </div>
      }
    >
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="正在加载访客排名数据..." />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={topVisitors}
          rowKey="visitor_id"
          pagination={false}
          className="visitors-table"
          size="small"
          scroll={{ x: 800 }}
        />
      )}
    </Card>
  );
};

export default DashboardTopVisitors;