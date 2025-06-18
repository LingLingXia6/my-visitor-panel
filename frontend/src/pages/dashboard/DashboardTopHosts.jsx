import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './DashboardTopHosts.css';

const DashboardTopHosts = () => {
  const [loading, setLoading] = useState(false);
  const [topHosts, setTopHosts] = useState([]);

  useEffect(() => {
    fetchTopHosts();
  }, []);

  const fetchTopHosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/dashboard/top-hosts');
      const result = await response.json();
      
      if (result.status) {
        setTopHosts(result.data);
      } else {
        message.error('获取排名前10主机数据失败');
      }
    } catch (error) {
      console.error('获取排名前10主机数据失败:', error);
      message.error('获取排名前10主机数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成现代化渐变色
  const getBarColor = (index) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
      '#10b981', '#06b6d4', '#84cc16', '#f97316',
      '#ef4444', '#8b5cf6'
    ];
    return colors[index % colors.length];
  };

  // 获取渐变定义
  const getGradientId = (index) => `gradient-${index}`;

  // 渐变定义组件
  const renderGradients = () => (
    <defs>
      {topHosts.map((_, index) => {
        const baseColor = getBarColor(index);
        return (
          <linearGradient key={index} id={getGradientId(index)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={baseColor} stopOpacity={0.8} />
            <stop offset="100%" stopColor={baseColor} stopOpacity={0.4} />
          </linearGradient>
        );
      })}
    </defs>
  );

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-title">{data.name}</div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-label">📞 电话:</span>
              <span className="tooltip-value">{data.phone}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">📊 访问次数:</span>
              <span className="tooltip-value">{data.form_count} 次</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      className="top-hosts-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            fontSize: '24px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
            🏢
          </div>
          <div className="card-title">
            排名前10被访问人
          </div>
        </div>
      }
      extra={
        <div className="total-count">
          共 {topHosts.length} 人
        </div>
      }
    >
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="正在加载主机排名数据..." />
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={topHosts}
              margin={{
                top: 30,
                right: 40,
                left: 30,
                bottom: 70
              }}
            >
              {renderGradients()}
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="rgba(148, 163, 184, 0.15)" 
                strokeWidth={1}
              />
              <XAxis 
                dataKey="name" 
                tick={{ 
                  fontSize: 13, 
                  fill: '#64748b',
                  fontWeight: 500
                }}
                angle={-35}
                textAnchor="end"
                height={90}
                interval={0}
                axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                tickLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              />
              <YAxis 
                tick={{ 
                  fontSize: 13, 
                  fill: '#64748b',
                  fontWeight: 500
                }}
                label={{ 
                  value: '访问次数', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    textAnchor: 'middle', 
                    fill: '#475569',
                    fontWeight: 600,
                    fontSize: 14
                  }
                }}
                axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                tickLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ 
                  fill: 'rgba(99, 102, 241, 0.05)',
                  stroke: 'rgba(99, 102, 241, 0.2)',
                  strokeWidth: 1
                }}
              />
              <Bar 
                dataKey="form_count" 
                radius={[8, 8, 0, 0]}
                cursor="pointer"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={1}
              >
                {topHosts.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#${getGradientId(index)})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* 排名列表 */}
          <div className="ranking-list">
            {topHosts.slice(0, 3).map((host, index) => (
              <div key={host.host_id} className={`ranking-item rank-${index + 1}`}>
               
                <div className="host-info">
                  <div className="host-name">{host.name}</div>
                  <div className="host-phone">{host.phone}</div>
                </div>
                <div className="host-count">{host.form_count}次</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardTopHosts;