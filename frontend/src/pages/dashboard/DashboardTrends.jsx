import React, { useState, useEffect } from 'react';
import { Card, Select, Spin, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './DashboardTrends.css';

const { Option } = Select;

const DashboardTrends = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [trendsData, setTrendsData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // 时间范围选项
  const periodOptions = [
    { value: '7days', label: '最近7天', granularity: 'daily' },
    { value: '30days', label: '最近30天', granularity: 'daily' },
    { value: '12months', label: '最近12个月', granularity: 'monthly' }
  ];

  useEffect(() => {
    fetchTrendsData();
  }, [selectedPeriod]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const currentOption = periodOptions.find(opt => opt.value === selectedPeriod);
      const response = await fetch(
        `http://localhost:8082/dashboard/trends?period=${selectedPeriod}&granularity=${currentOption.granularity}`
      );
      const result = await response.json();
      
      if (result.status) {
        setTrendsData(result.data.data);
        generateChartData(result.data.data);
      } else {
        message.error('获取趋势数据失败');
      }
    } catch (error) {
      console.error('获取趋势数据失败:', error);
      message.error('获取趋势数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成图表数据
  const generateChartData = (data) => {
    const chartDataArray = [];
    
    data.forEach((item, index) => {
      let period = item.period;
      let visitorCount = item.visitor_count;
      let visitCount = item.visit_count;
      
      // 处理null值，强制替换为0，确保数值类型
      if (visitorCount === null || visitorCount === undefined || isNaN(visitorCount) || visitorCount === 'null') {
        visitorCount = 0;
      } else {
        visitorCount = Number(visitorCount) || 0;
      }
      
      if (visitCount === null || visitCount === undefined || isNaN(visitCount) || visitCount === 'null') {
        visitCount = 0;
      } else {
        visitCount = Number(visitCount) || 0;
      }
      
      // 根据时间粒度格式化period
      if (selectedPeriod === '12months') {
        // 月份数据，显示月份名称
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
                           '7月', '8月', '9月', '10月', '11月', '12月'];
        const monthIndex = parseInt(period.split('-')[1]) - 1;
        period = monthNames[monthIndex];
      } else {
        // 日数据，只显示日期（包括7天和30天）
        period = period.split('-')[2] + '/' + period.split('-')[1];
      }
      
      chartDataArray.push({
        period: period,
        visitor_count: visitorCount,
        visit_count: visitCount
      });
    });
    
    setChartData(chartDataArray);
  };

  // 自定义Tooltip组件
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="custom-tooltip-title">{label}</div>
          {payload.map((entry, index) => {
            let value = entry.value;
            // 处理null值
            if (value === null || value === undefined || value === 'null' || isNaN(Number(value))) {
              value = 0;
            } else {
              value = Number(value);
            }
            
            const label = entry.dataKey === 'visitor_count' ? '访客数量' : '访问次数';
            const unit = entry.dataKey === 'visitor_count' ? '人' : '次';
            
            return (
              <div key={index} className="custom-tooltip-content">
                <span 
                  className="custom-tooltip-indicator" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="custom-tooltip-label">{label}: </span>
                <span className="custom-tooltip-value">{value} {unit}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
   };

  // 自定义柱状图组件
  const CustomBar = (props) => {
    const { fill, ...rest } = props;
    return (
      <rect
        {...rest}
        fill="url(#colorGradient)"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.filter = 'drop-shadow(0 6px 16px rgba(99, 102, 241, 0.5))';
          e.target.style.transform = 'scaleY(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.filter = 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))';
          e.target.style.transform = 'scaleY(1)';
        }}
      />
    );
  };

  return (
    <Card 
      className="trends-card"
      title={
        <div className="card-title">
          📊 访客趋势统计
        </div>
      }
      extra={
        <Select
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          className="period-selector"
        >
          {periodOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      }
    >
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="正在加载趋势数据..." />
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 30, right: 40, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid 
                  strokeDasharray="2 4" 
                  stroke="rgba(148, 163, 184, 0.3)" 
                  strokeWidth={1}
                />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 13, fill: '#64748b', fontWeight: '500' }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1 }}
                  tickLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#64748b', fontWeight: '500' }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1 }}
                  tickLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)', radius: 8 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                  formatter={(value) => {
                    return value === 'visitor_count' ? '访客数量' : '访问次数';
                  }}
                />
                <Bar 
                  dataKey="visitor_count" 
                  fill="#6366f1"
                  name="visitor_count"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationBegin={200}
                />
                <Bar 
                  dataKey="visit_count" 
                  fill="#8b5cf6"
                  name="visit_count"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationBegin={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
  );
};

export default DashboardTrends;