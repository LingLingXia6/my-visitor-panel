import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Tag, Spin, Result, Divider, Row, Col, Avatar, Empty } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, ClockCircleOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined, BankOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './VisitorCheck.css';

const { Title, Text } = Typography;

const VisitorCheck = () => {
  const { formId } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/forms/detail`, {
          formId: parseInt(formId, 10)
        });
        
        if (response.data.status) {
          setFormData(response.data.data);
        } else {
          setError(response.data.message || '获取表单数据失败');
        }
      } catch (err) {
        setError(err.response?.data?.message || '获取表单数据时发生错误');
        console.error('获取表单数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchFormData();
    }
  }, [formId]);

  // 渲染审批状态标签
  const renderApprovalStatus = (approved) => {
    if (approved === true) {
      return <Tag icon={<CheckCircleOutlined />} color="success">已通过</Tag>;
    } else if (approved === false) {
      return <Tag icon={<CloseCircleOutlined />} color="error">已拒绝</Tag>;
    } else {
      return <Tag icon={<QuestionCircleOutlined />} color="warning">待审批</Tag>;
    }
  };

  // 渲染加载中状态
  if (loading) {
    return (
      <div className="visitor-check-loading">
        <Spin size="large" />
        <Text className="loading-text">正在加载访客信息...</Text>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Result
        status="error"
        title="获取访客信息失败"
        subTitle={error}
      />
    );
  }

  // 渲染无数据状态
  if (!formData) {
    return (
      <Result
        status="warning"
        title="未找到访客信息"
        subTitle="请确认访问链接是否正确"
      />
    );
  }

  // 获取主访客信息 - 直接从 Visitors 数组获取
  const mainVisitor = formData.Visitors && formData.Visitors.length > 0 ? formData.Visitors[0] : null;
  
  // 获取随行人员 - 如果有多个访客，第一个之外的都是随行人员
  const companions = formData.Visitors && formData.Visitors.length > 1 
    ? formData.Visitors.slice(1) 
    : [];

  return (
    <div className="visitor-check-container">
      <div className="visitor-check-content">
        <Card className="visitor-check-card">
          <div className="visitor-check-header">
            <Title level={3}>访客验证信息</Title>
            <div className="approval-status">
              {renderApprovalStatus(formData.approved)}
            </div>
          </div>

          <Divider />

          <div className="visitor-info-section">
            <Title level={4} className="section-title">
              <UserOutlined className="section-icon" />
              访客信息
            </Title>
            
            {mainVisitor ? (
              <Descriptions bordered column={{ xs: 1, sm: 2 }} className="info-descriptions">
                <Descriptions.Item label="姓名">{mainVisitor.name || '未提供'}</Descriptions.Item>
                <Descriptions.Item label="手机号码">{mainVisitor.phone || '未提供'}</Descriptions.Item>
                <Descriptions.Item label="身份证号">{mainVisitor.id_card || '未提供'}</Descriptions.Item>
                <Descriptions.Item label="单位">{mainVisitor.company || '未提供'}</Descriptions.Item>
                {mainVisitor.email && (
                  <Descriptions.Item label="邮箱" span={2}>{mainVisitor.email}</Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Empty description="暂无访客信息" />
            )}
          </div>

          <Divider />

          <div className="visit-info-section">
            <Title level={4} className="section-title">
              <ClockCircleOutlined className="section-icon" />
              来访信息
            </Title>
            
            <Descriptions bordered column={{ xs: 1, sm: 2 }} className="info-descriptions">
              <Descriptions.Item label="来访时间">
                {formData.visit_time ? moment(formData.visit_time).format('YYYY-MM-DD HH:mm') : '未指定'}
              </Descriptions.Item>
              <Descriptions.Item label="来访地点">
                {formData.location || '未指定'}
              </Descriptions.Item>
              <Descriptions.Item label="来访事由" span={2}>
                {formData.visit_reason || '未提供'}
              </Descriptions.Item>
              {formData.arrival_time && (
                <Descriptions.Item label="实际到达时间" span={2}>
                  {moment(formData.arrival_time).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          <Divider />

          <div className="host-info-section">
            <Title level={4} className="section-title">
              <HomeOutlined className="section-icon" />
              被访人信息
            </Title>
            
            {formData.Hosts && formData.Hosts.length > 0 ? (
              <Row gutter={[16, 16]} className="host-list">
                {formData.Hosts.map(host => (
                  <Col xs={24} sm={12} md={8} key={host.id}>
                    <Card className="host-card" bordered={false} hoverable>
                      <div className="host-card-content">
                        <Avatar size={48} icon={<UserOutlined />} className="host-avatar" />
                        <div className="host-info">
                          <Text strong>{host.name || '未提供姓名'}</Text>
                          {host.phone && <Text type="secondary"><PhoneOutlined /> {host.phone}</Text>}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无被访人信息" />
            )}
          </div>

          {companions && companions.length > 0 && (
            <>
              <Divider />
              <div className="companions-section">
                <Title level={4} className="section-title">
                  <UserOutlined className="section-icon" />
                  随行人员 ({companions.length}人)
                </Title>
                
                <Row gutter={[16, 16]} className="companions-list">
                  {companions.map(companion => (
                    <Col xs={24} sm={12} md={8} key={companion.id}>
                      <Card className="companion-card" bordered={false} hoverable>
                        <div className="companion-card-content">
                          <Avatar size={48} icon={<UserOutlined />} className="companion-avatar" />
                          <div className="companion-info">
                            <Text strong>{companion.name || '未提供姓名'}</Text>
                            {companion.phone && <Text type="secondary"><PhoneOutlined /> {companion.phone}</Text>}
                            {companion.id_card && <Text type="secondary"><IdcardOutlined /> {companion.id_card}</Text>}
                            {companion.company && <Text type="secondary"><BankOutlined /> {companion.company}</Text>}
                            {companion.email && <Text type="secondary"><MailOutlined /> {companion.email}</Text>}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}

          <Divider />
          
          <div className="form-footer">
            <Text type="secondary">表单ID: {formData.id}</Text>
            <Text type="secondary">创建时间: {formData.createdAt ? moment(formData.createdAt).format('YYYY-MM-DD HH:mm:ss') : '未知'}</Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisitorCheck;