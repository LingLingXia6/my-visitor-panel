import React from 'react';
import { Row, Col } from 'antd';
import DashboardStats from './DashboardStats';
import DashboardTrends from './DashboardTrends';
import DashboardTopVisitors from './DashboardTopVisitors';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <DashboardStats />
        </Col>
        <Col span={12}>
          <DashboardTrends />
        </Col>
        <Col span={12}>
          <DashboardTopVisitors />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;