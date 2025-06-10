import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Modal, Tabs, List } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./HostInfo.css";

const { Title } = Typography;
const { TabPane } = Tabs;

const HostInfo = () => {
  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Fetch hosts data from the API
    const fetchHosts = async () => {
      try {
        const response = await fetch("http://localhost:8082/hosts");
        const result = await response.json();
        setHosts(result.data);
      } catch (error) {
        console.error("Failed to fetch hosts:", error);
      }
    };

    fetchHosts();
  }, []);

  // 定义表格列
  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "联系电话",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "被访问次数",
      dataIndex: "visitCount",
      key: "visitCount",
      render: (_, record) => record.VisitorsForms.length,
    },
    {
      title: "访客数量",
      dataIndex: "visitorCount",
      key: "visitorCount",
      render: (_, record) => record.Visitors.length,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <a
          onClick={() => {
            setSelectedHost(record);
            setModalVisible(true);
          }}
        >
          详情
        </a>
      ),
    },
  ];

  return (
    <div className="host-info-container">
      <Card className="host-info-card">
        <Title level={4} style={{  marginBottom: "24px",fontSize:'16px',fontWeight:500 }}>
          被拜访人信息
        </Title>
        <Table
          columns={columns}
          dataSource={hosts}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }} // 设置表格宽度
        />
      </Card>

      {selectedHost && (
        <Modal
          title={`${selectedHost.name} 的访客信息`}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <div className="visitor-basic-info">
            <div className="info-row">
              <div className="info-item">
                <UserOutlined className="info-icon" />
                <span>{selectedHost.name}</span>
              </div>
              <div className="info-item">
                <PhoneOutlined className="info-icon" />
                <span>{selectedHost.phone}</span>
              </div>
            </div>
          </div>

          <Tabs defaultActiveKey="history">
            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  历史被访问人信息
                </span>
              }
              key="history"
            >
              <List
                itemLayout="horizontal"
                dataSource={selectedHost.VisitorsForms}
                renderItem={(form) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          {new Date(form.visit_time).toLocaleDateString()}
                        </span>
                      }
                      description={`地点: ${form.location}, 原因: ${form.visit_reason}`}
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <TeamOutlined />
                  访问人信息
                </span>
              }
              key="visitors"
            >
              <List
                itemLayout="horizontal"
                dataSource={selectedHost.Visitors}
                renderItem={(visitor) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<span>{visitor.name}</span>}
                      description={`电话: ${visitor.phone}, 公司: ${visitor.company}`}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </div>
  );
};

export default HostInfo;
