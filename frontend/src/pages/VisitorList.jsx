import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Button, Modal, Divider, Collapse, Empty, Input, DatePicker, Form, Row, Col, Tabs } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined, ClockCircleOutlined, EnvironmentOutlined, BankOutlined, ReloadOutlined, CalendarOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './VisitorList.css';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 在组件顶部添加新的状态
const VisitorList = () => {
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    startTime: '',
    endTime: ''
  });
  const navigate = useNavigate();
  const [expandedHosts, setExpandedHosts] = useState({});

  useEffect(() => {
    fetchVisitors();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      
      // 构建查询参数
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.current);
      queryParams.append('pageSize', pagination.pageSize);
      
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.phone) queryParams.append('phone', filters.phone);
      if (filters.startTime) queryParams.append('startTime', filters.startTime);
      if (filters.endTime) queryParams.append('endTime', filters.endTime);
      
      const response = await fetch(`http://localhost:8082/visitors?${queryParams.toString()}`);
      const result = await response.json();
      
      // Handle the new response format with pagination
      if (Array.isArray(result)) {
        // Old format (just an array of visitors)
        setVisitors(result);
        setPagination(prev => ({ ...prev, total: result.length }));
      } else if (result.data && Array.isArray(result.data)) {
        // New format with pagination info
        setVisitors(result.data);
        setPagination(prev => ({
          ...prev,
          current: result.pagination?.currentPage || 1,
          total: result.pagination?.total || 0
        }));
      } else {
        // Fallback for unexpected format
        console.error('Unexpected data format:', result);
        setVisitors([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取访客列表失败:', error);
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize
    });
  };

  const handleSearch = (values) => {
    // 处理日期范围
    let startTime = '';
    let endTime = '';
    
    if (values.dateRange && values.dateRange.length === 2) {
      startTime = values.dateRange[0].format('YYYY-MM-DD 00:00:00');
      endTime = values.dateRange[1].format('YYYY-MM-DD 23:59:59');
    }
    
    // 更新筛选条件
    setFilters({
      name: values.name || '',
      phone: values.phone || '',
      startTime,
      endTime
    });
    
    // 重置到第一页
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  const handleReset = () => {
    filterForm.resetFields();
    setFilters({
      name: '',
      phone: '',
      startTime: '',
      endTime: ''
    });
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Text strong>{text}</Text>
      )
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '身份证号',
      dataIndex: 'id_card',
      key: 'id_card',
      responsive: ['lg']
    },
    {
      title: '所属单位',
      dataIndex: 'company',
      key: 'company',
      responsive: ['md']
    },
    {
      title: '访问次数',
      key: 'visitCount',
      render: (_, record) => (
        <Tag color="blue">{record.VisitorsForms?.length || 0}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedVisitor(record);
            setModalVisible(true);
          }}
        >
          详情
        </Button>
      )
    }
  ];

  // 在renderDetailModal函数中，修改hostGroups部分
  const renderDetailModal = () => {
    if (!selectedVisitor) return null;
    
    // 按年份对访问记录进行分组
    const groupVisitsByYear = () => {
      const groups = {};
      
      selectedVisitor?.VisitorsForms?.forEach(form => {
        const visitDate = new Date(form.visit_time);
        const year = visitDate.getFullYear();
        
        if (!groups[year]) {
          groups[year] = [];
        }
        
        groups[year].push(form);
      });
      
      // 将分组结果转换为数组并按年份降序排序
      return Object.entries(groups)
        .map(([year, forms]) => ({
          year: parseInt(year),
          forms: forms,
          count: forms.length
        }))
        .sort((a, b) => b.year - a.year); // 降序排序，最近的年份在前
    };
    
    // 按被访人分组访问记录
    const groupVisitsByHost = () => {
      const hostMap = new Map();
      
      // 遍历所有访问表单
      selectedVisitor?.VisitorsForms?.forEach(form => {
        // 获取表单对应的被访人ID
        const hostId = form.FormHostVisitors?.host_id;
        
        // 在Hosts数组中查找对应的被访人信息
        const hostInfo = selectedVisitor?.Hosts?.find(host => host.id === hostId);
        
        if (hostInfo) {
          // 如果Map中没有这个被访人，则添加
          if (!hostMap.has(hostId)) {
            hostMap.set(hostId, {
              id: hostId,
              name: hostInfo.name,
              phone: hostInfo.phone,
              visits: []
            });
          }
          
          // 将访问记录添加到对应被访人的visits数组中
          hostMap.get(hostId).visits.push({
            id: form.id,
            date: new Date(form.visit_time),
            location: form.location,
            reason: form.visit_reason
          });
        }
      });
      
      // 将Map转换为数组并按访问次数降序排序
      return Array.from(hostMap.values())
        .map(host => ({
          ...host,
          count: host.visits.length
        }))
        .sort((a, b) => b.count - a.count);
    };
    
    const visitGroups = groupVisitsByYear();
    const hostGroups = groupVisitsByHost();
    
    // 移除这里的useEffect
    
    // 切换展开/收起状态
    const toggleHostExpand = (hostId) => {
      setExpandedHosts(prev => ({
        ...prev,
        [hostId]: !prev[hostId]
      }));
    };
    
    return (
      <Modal
        title={`${selectedVisitor.name} 的访客信息`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={600}
        footer={null}
        className="visitor-detail-modal"
      >
        <div className="visitor-basic-info">
          <div className="info-row">
            <div className="info-item">
              <UserOutlined className="info-icon" />
              <span>{selectedVisitor.name}</span>
            </div>
            <div className="info-item">
              <PhoneOutlined className="info-icon" />
              <span>{selectedVisitor.phone}</span>
            </div>
          </div>
          <div className="info-row">
            <div className="info-item">
              <IdcardOutlined className="info-icon" />
              <span>{selectedVisitor.id_card}</span>
            </div>
            <div className="info-item">
              <BankOutlined className="info-icon" />
              <span>{selectedVisitor.company}</span>
            </div>
          </div>
        </div>

        <Divider className="info-divider" />
        
        <Tabs defaultActiveKey="history">
          <TabPane 
            tab={
              <span>
                <CalendarOutlined />
                历史访问记录
              </span>
            } 
            key="history"
          >
            <div className="visit-history">
              {visitGroups.length > 0 ? (
                <div className="visit-groups">
                  {visitGroups.map(group => (
                    <div key={group.year} className="visit-year-group">
                      <Collapse 
                        defaultActiveKey={[visitGroups[0]?.year.toString()]}
                        ghost
                        className="year-collapse"
                      >
                        <Collapse.Panel 
                          header={`${group.year} 年 (${group.count}次)`} 
                          key={group.year}
                        >
                          {group.forms.map(form => (
                            <div key={form.id} className="visit-item">
                              <div className="visit-item-header">
                                <div className="visit-date">
                                  <ClockCircleOutlined /> {new Date(form.visit_time).toLocaleDateString()}
                                </div>
                                <div className="visit-id">#{form.id}</div>
                              </div>
                              <div className="visit-item-content">
                                <div className="visit-location">
                                  <EnvironmentOutlined />
                                  <span>{form.location}</span>
                                </div>
                                <div className="visit-host">
                                  <UserOutlined />
                                  <span>{selectedVisitor?.Hosts?.[0]?.name} ({selectedVisitor?.Hosts?.[0]?.phone})</span>
                                </div>
                                <div className="visit-reason">
                                  <span>{form.visit_reason}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </Collapse.Panel>
                      </Collapse>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无访问记录" className="empty-records" />
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                不同被访问人信息
              </span>
            } 
            key="hosts"
          >
            <div className="host-visit-history">
              {hostGroups.length > 0 ? (
                <div className="host-groups">
                  {hostGroups.map(host => (
                    <div key={host.id} className="visit-year-group">
                      <div
                        className="year-collapse ant-collapse"
                        style={{ marginBottom: 4, border: 'none', background: 'transparent' }}
                      >
                        <div
                          className="ant-collapse-header"
                          style={{ cursor: 'pointer', fontWeight: 500, padding: '10px 16px', background: '#f5f5f5', borderRadius: 6, color: '#333', display: 'flex', alignItems: 'center' }}
                          onClick={() => toggleHostExpand(host.id)}
                        >
                          <UserOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: 16 }} />
                          <span>{host.name}</span>
                          <span style={{ color: '#999', marginLeft: 8 }}>{host.phone}</span>
                          <span style={{ marginLeft: 'auto', color: '#1890ff', fontSize: 13 }}>共访问 {host.count} 次</span>
                          <span style={{ marginLeft: 12, fontSize: 12, color: '#bbb' }}>
                            {expandedHosts[host.id] ? '▲' : '▼'}
                          </span>
                        </div>
                        {expandedHosts[host.id] && (
                          <div className="year-collapse ant-collapse-content-box" style={{ padding: '8px 0' }}>
                            {host.visits.map(visit => (
                              <div key={visit.id} className="visit-item">
                                <div className="visit-item-header">
                                  <div className="visit-date">
                                    <ClockCircleOutlined style={{ fontSize: 15, color: '#1890ff', marginRight: 6 }} />
                                    <span>{visit.date.toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="visit-item-content">
                                  <div className="visit-location">
                                    <EnvironmentOutlined style={{ fontSize: 15, color: '#52c41a', marginRight: 6 }} />
                                    <span>{visit.location}</span>
                                  </div>
                                  <div className="visit-reason">
                                    <span>{visit.reason}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无被访问人记录" className="empty-records" />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  return (
    <div className="visitor-list-container">
      <Card 
        title="访客信息"
        className="visitor-card"
        extra={
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={() => {
              setPagination(prev => ({ ...prev, current: 1 }));
              fetchVisitors();
            }} 
            loading={loading}
            size="middle"
          >
            刷新
          </Button>
        }
        bordered={false}
      >
        {/* 筛选表单 */}
        <div className="filter-section">
          <Form
            form={filterForm}
            layout="inline"
            onFinish={handleSearch}
            className="filter-form"
          >
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="name" label="访客姓名">
                  <Input placeholder="请输入访客姓名" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="phone" label="访客电话">
                  <Input placeholder="请输入访客电话" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item name="dateRange" label="开始时间">
                  <RangePicker 
                    style={{ width: '100%' }} 
                    placeholder={['开始时间', '结束时间']}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      搜索
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        <Table
          columns={columns}
          dataSource={visitors}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 位访客`
          }}
          onChange={handleTableChange}
          className="visitor-table"
          size="middle"
        />
        {renderDetailModal()}
      </Card>
    </div>
  );
};

export default VisitorList;