import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, message } from 'antd';
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
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text) => (
        <div className="visitor-name">{text}</div>
      )
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
      width: 150,
      render: (company) => (
        <div className="company-info">
        
          <span>{company || '未填写'}</span>
        </div>
      )
    },
    {
      title: '次数',
      dataIndex: 'form_count',
      key: 'form_count',
      width: 60,
      align: 'center',
      sorter: (a, b) => b.form_count - a.form_count,
      render: (count) => (
        <span className="count-number">{count}</span>
      )
    }
  ];

  return (
    <Card 
      className="top-visitors-card"
      title={
        <div className="card-title">
          👥 排名前10访客
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
          scroll={{ x: 320 }}
        />
      )}
    </Card>
  );
};

export default DashboardTopVisitors;