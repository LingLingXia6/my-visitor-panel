import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Button, Modal, Divider, Collapse, Empty } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined, ClockCircleOutlined, EnvironmentOutlined, BankOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './VisitorList.css';

const { Title, Text } = Typography;

const VisitorList = () => {
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/visitors');
      const data = await response.json();
      setVisitors(data);
      setLoading(false);
    } catch (error) {
      console.error('获取访客列表失败:', error);
      setLoading(false);
    }
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
    
    const visitGroups = groupVisitsByYear();
    
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
        
        <div className="visit-history-header">
          <CalendarOutlined />
          <span>历史访问记录</span>
        </div>
        
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
            onClick={fetchVisitors} 
            loading={loading}
            size="middle"
          >
            刷新
          </Button>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={visitors}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 位访客`
          }}
          className="visitor-table"
          size="middle"
        />
        {renderDetailModal()}
      </Card>
    </div>
  );
};

export default VisitorList;