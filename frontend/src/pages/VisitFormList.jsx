import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Button, message, Tooltip, Modal, Divider } from 'antd';
import { EyeOutlined, UserOutlined, TeamOutlined, EnvironmentOutlined, ClockCircleOutlined, PhoneOutlined, IdcardOutlined, BankOutlined, FileTextOutlined } from '@ant-design/icons';
import moment from 'moment';
import './VisitFormList.css';

const { Title, Text } = Typography;

const VisitFormList = () => {
  const [loading, setLoading] = useState(true);
  const [visitForms, setVisitForms] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);

  useEffect(() => {
    fetchVisitForms();
  }, []);

  const fetchVisitForms = async () => {
    try {
      setLoading(true);
      // 使用 fetch 直接获取数据
      const response = await fetch('http://localhost:8082/visitors/forms/all');
      const result = await response.json();
      
      if (result && result.data) {
        setVisitForms(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('获取访问表单列表失败:', error);
      message.error('获取访问表单列表失败');
      setLoading(false);
    }
  };

  const showDetail = (record) => {
    setCurrentForm(record);
    setDetailVisible(true);
  };

  const handleDetailClose = () => {
    setDetailVisible(false);
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr) => {
    return moment(dateTimeStr).format('YYYY-MM-DD HH:mm');
  };

  // 获取访客角色的中文名称
  const getRoleName = (role) => {
    const roleMap = {
      'visitor': '访客',
      'companion': '随行人'
    };
    return roleMap[role] || role;
  };

  // 表格列配置
  const columns = [
    {
      title: '申请单号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left',
      render: (id) => <Tag color="blue" className="id-tag">#{id}</Tag>
    },
    {
      title: '访客姓名',
      dataIndex: ['Visitor', 'name'],
      key: 'visitorName',
      width: 120,
      render: (name, record) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: '访客单位',
      dataIndex: ['Visitor', 'company'],
      key: 'company',
      width: 150,
    },
    {
      title: '被访人',
      dataIndex: 'host_name',
      key: 'hostName',
      width: 120,
    },
    {
      title: '被访人电话',
      dataIndex: 'host_phone',
      key: 'hostPhone',
      width: 150,
    },
    {
      title: '来访地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location) => (
        <Space>
          <EnvironmentOutlined />
          <span>{location}</span>
        </Space>
      )
    },
    {
      title: '来访时间',
      dataIndex: 'visit_time',
      key: 'visitTime',
      width: 180,
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          <span>{formatDateTime(time)}</span>
        </Space>
      )
    },
    {
      title: '随行人数',
      key: 'companionCount',
      width: 100,
      render: (_, record) => {
        const companions = record.Attendees ? record.Attendees.filter(a => a.role === 'companion') : [];
        return (
          <Space>
            <TeamOutlined />
            <span>{companions.length}人</span>
          </Space>
        );
      }
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  // 渲染详情弹窗
  const renderDetailModal = () => {
    if (!currentForm) return null;
    
    const companions = currentForm.Attendees ? 
      currentForm.Attendees.filter(a => a.role === 'companion') : [];
    
    const visitor = currentForm.Attendees ? 
      currentForm.Attendees.find(a => a.role === 'visitor') : null;

    return (
      <Modal
        title={
          <div className="detail-modal-title">
            <FileTextOutlined className="detail-icon" />
            <span>访问申请单详情</span>
            <Tag color="blue" className="detail-id-tag">#{currentForm.id}</Tag>
          </div>
        }
        open={detailVisible}
        onCancel={handleDetailClose}
        footer={[
          <Button key="close" onClick={handleDetailClose} type="primary" shape="round">
            关闭
          </Button>
        ]}
        width={700}
        className="visit-detail-modal"
        centered
        destroyOnClose
      >
        <div className="visit-form-detail">
          <div className="detail-section">
            <Title level={5}><ClockCircleOutlined /> 基本信息</Title>
            <Divider className="section-divider" />
            <div className="detail-grid">
              <div className="detail-item">
                <Text strong><FileTextOutlined /> 来访事由</Text>
                <Text>{currentForm.visit_reason}</Text>
              </div>
              <div className="detail-item">
                <Text strong><ClockCircleOutlined /> 来访时间</Text>
                <Text>{formatDateTime(currentForm.visit_time)}</Text>
              </div>
              <div className="detail-item">
                <Text strong><EnvironmentOutlined /> 来访地点</Text>
                <Text>{currentForm.location}</Text>
              </div>
              <div className="detail-item">
                <Text strong><ClockCircleOutlined /> 申请时间</Text>
                <Text>{formatDateTime(currentForm.createdAt)}</Text>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <Title level={5}><UserOutlined /> 被访人信息</Title>
            <Divider className="section-divider" />
            <div className="detail-grid">
              <div className="detail-item">
                <Text strong><UserOutlined /> 姓名</Text>
                <Text>{currentForm.host_name}</Text>
              </div>
              <div className="detail-item">
                <Text strong><PhoneOutlined /> 电话</Text>
                <Text>{currentForm.host_phone}</Text>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <Title level={5}><UserOutlined /> 访客信息</Title>
            <Divider className="section-divider" />
            {visitor && (
              <div className="detail-grid">
                <div className="detail-item">
                  <Text strong><UserOutlined /> 姓名</Text>
                  <Text>{visitor.name}</Text>
                </div>
                <div className="detail-item">
                  <Text strong><PhoneOutlined /> 电话</Text>
                  <Text>{visitor.phone}</Text>
                </div>
                <div className="detail-item">
                  <Text strong><IdcardOutlined /> 身份证</Text>
                  <Text>{visitor.id_card}</Text>
                </div>
                <div className="detail-item">
                  <Text strong><BankOutlined /> 单位</Text>
                  <Text>{currentForm.Visitor.company}</Text>
                </div>
              </div>
            )}
          </div>

          {companions.length > 0 && (
            <div className="detail-section">
              <Title level={5}><TeamOutlined /> 随行人员（{companions.length}人）</Title>
              <Divider className="section-divider" />
              <Table
                dataSource={companions}
                rowKey="id"
                pagination={false}
                size="small"
                className="companions-table"
                columns={[
                  {
                    title: '姓名',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text) => (
                      <Space>
                        <UserOutlined style={{ color: '#1677ff' }} />
                        <span>{text}</span>
                      </Space>
                    )
                  },
                  {
                    title: '电话',
                    dataIndex: 'phone',
                    key: 'phone',
                    render: (text) => (
                      <Space>
                        <PhoneOutlined style={{ color: '#1677ff' }} />
                        <span>{text}</span>
                      </Space>
                    )
                  },
                  {
                    title: '身份证',
                    dataIndex: 'id_card',
                    key: 'idCard',
                    render: (text) => (
                      <Space>
                        <IdcardOutlined style={{ color: '#1677ff' }} />
                        <span>{text}</span>
                      </Space>
                    )
                  }
                ]}
              />
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="visit-form-list-container">
      <Card 
        title={
          <div className="card-title">
            <FileTextOutlined className="title-icon" />
            <Title level={4}>访客申请单列表</Title>
          </div>
        }
        extra={
          <Button type="primary" onClick={fetchVisitForms} loading={loading} shape="round" icon={<ClockCircleOutlined />}>
            刷新
          </Button>
        }
        className="visit-form-card"
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={visitForms}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            size: "small",
            className: "pagination-custom"
          }}
          className="visit-form-table"
          rowClassName="table-row"
        />
      </Card>
      {renderDetailModal()}
    </div>
  );
};

export default VisitFormList;