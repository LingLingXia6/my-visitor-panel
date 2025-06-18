import React from 'react';
import { Row, Col } from 'antd';
import DashboardStats from './DashboardStats';
import DashboardTrends from './DashboardTrends';
import DashboardTopVisitors from './DashboardTopVisitors';
import DashboardTopHosts from './DashboardTopHosts';
import DashboardFormApproval from './DashboardFormApproval';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <DashboardStats />
        </Col>
        <Col span={8}>
          <DashboardFormApproval />
        </Col> 
        <Col span={16}>
          <DashboardTrends />
        </Col>
        <Col span={8}>
          <DashboardTopVisitors />
        </Col>
        <Col span={16}>
          <DashboardTopHosts />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;