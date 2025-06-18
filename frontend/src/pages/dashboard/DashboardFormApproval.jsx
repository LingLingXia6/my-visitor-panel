import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './DashboardFormApproval.css';

const DashboardFormApproval = () => {
  const [loading, setLoading] = useState(false);
  const [approvalStats, setApprovalStats] = useState({
    approved: 0,
    pending: 0,
    total: 0,
    approvalRate: '0'
  });

  useEffect(() => {
    fetchApprovalStats();
  }, []);

  const fetchApprovalStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/dashboard/form-approval-stats');
      const result = await response.json();
      
      if (result.status) {
        setApprovalStats(result.data);
      } else {
        message.error('获取表单审核统计数据失败');
      }
    } catch (error) {
      console.error('获取表单审核统计数据失败:', error);
      message.error('获取表单审核统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 准备饼图数据 - 使用紫色渐变色调
  const pieData = [
    {
      name: '已审核',
      value: approvalStats.approved,
      color: '#8b5cf6', // 紫色
      percentage: approvalStats.total > 0 ? ((approvalStats.approved / approvalStats.total) * 100).toFixed(1) : '0'
    },
    {
      name: '待审核', 
      value: approvalStats.pending,
      color: '#c4b5fd', // 浅紫色
      percentage: approvalStats.total > 0 ? ((approvalStats.pending / approvalStats.total) * 100).toFixed(1) : '0'
    }
  ];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-title">{data.name}</div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-label">数量:</span>
              <span className="tooltip-value">{data.value} 个</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">占比:</span>
              <span className="tooltip-value">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 自定义图例组件
  const CustomLegend = () => {
    return (
      <div className="custom-legend">
        {pieData.map((entry, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-dot" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="legend-label">{entry.name}</span>
            <span className="legend-percentage">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card 
      className="form-approval-card"
      title="表单审核情况"
      bordered={false}
    >
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="正在加载审核统计数据..." />
        </div>
      ) : (
        <div className="chart-container">
          <div className="chart-content">
            <div className="pie-chart-wrapper">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <CustomLegend />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardFormApproval;