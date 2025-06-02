import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  message,
  Modal,
  Divider,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BankOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./VisitFormList.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const VisitFormList = () => {
  const [loading, setLoading] = useState(true);
  const [visitForms, setVisitForms] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  });
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState({
    visitorName: "",
    visitorPhone: "",
    hostName: "",
    hostPhone: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchVisitForms();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchVisitForms = async () => {
    try {
      setLoading(true);

      // 构建查询参数
      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.current);
      queryParams.append("pageSize", pagination.pageSize);

      if (filters.visitorName)
        queryParams.append("visitorName", filters.visitorName);
      if (filters.visitorPhone)
        queryParams.append("visitorPhone", filters.visitorPhone);
      if (filters.hostName) queryParams.append("hostName", filters.hostName);
      if (filters.hostPhone) queryParams.append("hostPhone", filters.hostPhone);
      if (filters.startTime) queryParams.append("startTime", filters.startTime);
      if (filters.endTime) queryParams.append("endTime", filters.endTime);

      // 使用 fetch 直接获取数据，添加分页参数
      const response = await fetch(
        `http://localhost:8082/forms?${queryParams.toString()}`
      );
      const result = await response.json();

      if (result && result.data) {
        // 处理数据
        result.data.forEach((list) => {
          list.host = list?.Hosts?.[0] || {};
          list.mainVisitor = list?.Visitors?.find(
            (item) => item?.FormHostVisitors?.isMinRole === 1
          );
          list.attendees = list?.Visitors?.filter(
            (item) => item?.FormHostVisitors?.isMinRole === 0
          );
        });

        console.log("获取访问表单列表成功:", result.data);
        setVisitForms(result.data);

        // 更新分页信息
        if (result.pagination) {
          setPagination({
            current: result.pagination.currentPage,
            pageSize: result.pagination.pageSize,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
            hasNextPage: result.pagination.hasNextPage,
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("获取访问表单列表失败:", error);
      message.error("获取访问表单列表失败");
      setLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = (paginationParams) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationParams.current,
      pageSize: paginationParams.pageSize,
    }));
  };

  // 处理筛选表单提交
  const handleSearch = (values) => {
    // 处理日期范围
    let startTime = "";
    let endTime = "";

    if (values.dateRange && values.dateRange.length === 2) {
      startTime = values.dateRange[0].format("YYYY-MM-DD 00:00:00");
      endTime = values.dateRange[1].format("YYYY-MM-DD 23:59:59");
    }

    // 更新筛选条件
    setFilters({
      visitorName: values.visitorName || "",
      visitorPhone: values.visitorPhone || "",
      hostName: values.hostName || "",
      hostPhone: values.hostPhone || "",
      startTime,
      endTime,
    });

    // 重置到第一页
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // 重置筛选条件
  const handleReset = () => {
    filterForm.resetFields();
    setFilters({
      visitorName: "",
      visitorPhone: "",
      hostName: "",
      hostPhone: "",
      startTime: "",
      endTime: "",
    });
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
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
    return moment(dateTimeStr).format("YYYY-MM-DD HH:mm");
  };

  // 获取访客角色的中文名称
  const getRoleName = (role) => {
    const roleMap = {
      visitor: "访客",
      companion: "随行人",
    };
    return roleMap[role] || role;
  };

  // 表格列配置
  const columns = [
    {
      title: "申请单号",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      render: (id) => <span className="form-id">#{id}</span>,
    },
    {
      title: "访客姓名",
      dataIndex: ["mainVisitor", "name"],
      key: "visitorName",
      width: 120,
    },
    {
      title: "访客单位",
      dataIndex: ["mainVisitor", "company"],
      key: "company",
      width: 150,
      responsive: ["md"],
    },
    {
      title: "被访人",
      dataIndex: ["host", "name"],
      key: "hostName",
      width: 120,
    },
    {
      title: "被访人电话",
      dataIndex: ["host", "phone"],
      key: "hostPhone",
      width: 150,
      responsive: ["lg"],
    },
    {
      title: "来访地点",
      dataIndex: "location",
      key: "location",
      width: 150,
      responsive: ["md"],
    },
    {
      title: "来访时间",
      dataIndex: "visit_time",
      key: "visitTime",
      width: 180,
      render: (time) => formatDateTime(time),
    },
    {
      title: "随行人数",
      key: "companionCount",
      width: 100,
      render: (_, record) => {
        const companions = record?.attendees ? record.attendees : [];
        return companions?.length > 0 ? (
          <Tag color="blue">{companions?.length}人</Tag>
        ) : (
          "无"
        );
      },
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => showDetail(record)}
          className="detail-btn"
        >
          详情
        </Button>
      ),
    },
  ];

  // 渲染详情弹窗
  const renderDetailModal = () => {
    if (!currentForm) return null;

    const companions = currentForm?.attendees ? currentForm?.attendees : [];

    const visitor = currentForm?.mainVisitor ? currentForm.mainVisitor : null;

    return (
      <Modal
        title={`访问申请单 #${currentForm.id}`}
        open={detailVisible}
        onCancel={handleDetailClose}
        footer={null}
        width={600}
        className="visit-detail-modal"
        centered
        destroyOnClose
      >
        <div className="visit-form-detail">
          <div className="detail-section">
            <div className="section-header">
              <ClockCircleOutlined className="section-icon" />
              <span>基本信息</span>
            </div>
            <div className="detail-content">
              <div className="detail-row">
                <div className="detail-label">来访事由</div>
                <div className="detail-value">{currentForm.visit_reason}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">来访时间</div>
                <div className="detail-value">
                  {formatDateTime(currentForm.visit_time)}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">来访地点</div>
                <div className="detail-value">{currentForm.location}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">申请时间</div>
                <div className="detail-value">
                  {formatDateTime(currentForm.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <UserOutlined className="section-icon" />
              <span>被访人</span>
            </div>
            <div className="detail-content">
              <div className="detail-row">
                <div className="detail-label">姓名</div>
                <div className="detail-value">{currentForm?.host?.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">电话</div>
                <div className="detail-value">{currentForm?.host?.phone}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <UserOutlined className="section-icon" />
              <span>访客</span>
            </div>
            {visitor && (
              <div className="detail-content">
                <div className="detail-row">
                  <div className="detail-label">姓名</div>
                  <div className="detail-value">{visitor?.name}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">电话</div>
                  <div className="detail-value">{visitor?.phone}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">身份证</div>
                  <div className="detail-value">{visitor?.id_card}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">单位</div>
                  <div className="detail-value">{visitor?.company}</div>
                </div>
              </div>
            )}
          </div>

          {companions.length > 0 && (
            <div className="detail-section">
              <div className="section-header">
                <TeamOutlined className="section-icon" />
                <span>随行人员（{companions.length}人）</span>
              </div>
              <div className="companions-list">
                {companions.map((companion, index) => (
                  <div key={companion.id} className="companion-item">
                    <div className="companion-header">
                      <UserOutlined className="companion-icon" />
                      <span className="companion-name">{companion.name}</span>
                    </div>
                    <div className="companion-details">
                      <div className="companion-detail">
                        <PhoneOutlined className="detail-icon" />
                        <span>{companion.phone}</span>
                      </div>
                      <div className="companion-detail">
                        <IdcardOutlined className="detail-icon" />
                        <span>{companion.id_card}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="visit-form-list-container">
      <Card
        title="访客申请单列表"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setPagination((prev) => ({ ...prev, current: 1 }));
              fetchVisitForms();
            }}
            loading={loading}
            icon={<ReloadOutlined />}
          >
            刷新
          </Button>
        }
        className="visit-form-card"
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
            <Row gutter={[16, 16]} style={{ width: "100%" }}>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="visitorName" label="访客姓名">
                  <Input placeholder="请输入访客姓名" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="visitorPhone" label="访客电话">
                  <Input placeholder="请输入访客电话" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="hostName" label="被访人姓名">
                  <Input placeholder="请输入被访人姓名" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="hostPhone" label="被访人电话">
                  <Input placeholder="请输入被访人电话" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item name="dateRange" label="开始时间">
                  <RangePicker
                    style={{ width: "100%" }}
                    placeholder={["开始时间", "结束时间"]}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                    >
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
          dataSource={visitForms}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize,
              }));
            },
          }}
          onChange={handleTableChange}
          className="visit-form-table"
        />
      </Card>
      {renderDetailModal()}
    </div>
  );
};

export default VisitFormList;
