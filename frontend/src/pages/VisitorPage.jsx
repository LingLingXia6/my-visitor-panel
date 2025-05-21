import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, Typography, Space, QRCode, message, Upload, DatePicker, Table, Tooltip, Modal, Drawer } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, EnvironmentOutlined, IdcardOutlined, CarOutlined, UploadOutlined, PlusOutlined, DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import './VisitorPage.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const VisitorPage = () => {
  const [form] = Form.useForm();
  const [companionForm] = Form.useForm();
  // 移除 agreed 状态
  // 修改初始状态，使用空数组而不是包含一个空对象的数组
  const [companions, setCompanions] = useState([]);

  // 添加展开/收起状态
  const [expanded, setExpanded] = useState(false);
  // 添加随行人员弹框状态
  const [companionModalVisible, setCompanionModalVisible] = useState(false);
  // 添加是否为移动设备状态
  const [isMobile, setIsMobile] = useState(false);
  // 当前编辑的随行人员
  const [currentCompanion, setCurrentCompanion] = useState({ key: 0, name: '', idCard: '', phone: '' });
  // 是否是新增
  const [isNewCompanion, setIsNewCompanion] = useState(true);

  // 检测设备类型
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const onFinish = (values) => {
    // 将随行人信息添加到提交的数据中
    values.companions = companions.filter(item => item.name || item.idCard || item.phone );
    console.log('表单提交值:', values);
    message.success('登记信息提交成功！');
    form.resetFields();
    setCompanions([]); // 重置为空数组
  };

  // 打开添加随行人员弹框
  const showCompanionModal = (isNew = true, record = null) => {
    if (isNew) {
      const newKey = companions.length > 0 ? Math.max(...companions.map(c => c.key)) + 1 : 1;
      setCurrentCompanion({ key: newKey, name: '', idCard: '', phone: '' });
      setIsNewCompanion(true);
    } else {
      setCurrentCompanion({ ...record });
      setIsNewCompanion(false);
    }
    companionForm.setFieldsValue(isNew ? { name: '', idCard: '', phone: '' } : record);
    setCompanionModalVisible(true);
  };

  // 关闭随行人员弹框
  const handleCancel = () => {
    setCompanionModalVisible(false);
    companionForm.resetFields();
  };

  // 保存随行人员信息
  const handleSaveCompanion = () => {
    companionForm.validateFields().then(values => {
      if (isNewCompanion) {
        setCompanions([...companions, { ...currentCompanion, ...values }]);
      } else {
        setCompanions(companions.map(item => 
          item.key === currentCompanion.key ? { ...item, ...values } : item
        ));
      }
      setCompanionModalVisible(false);
      companionForm.resetFields();
    }).catch(info => {
      console.log('验证失败:', info);
    });
  };

  // 删除随行人
  const removeCompanion = (key) => {
    // 移除判断是否至少保留一行的逻辑
    setCompanions(companions.filter(item => item.key !== key));
  };

  // 随行人表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, record, index) => {
        return (
          <div className="companion-index-cell">
            <span>{index + 1}</span>
            <div className="companion-actions">
              <Tooltip title="编辑">
                <Button 
                  type="text" 
                  icon={<UserOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    showCompanionModal(false, record);
                  }}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCompanion(record.key);
                  }}
                />
              </Tooltip>
            </div>
          </div>
        );
      },
      onCell: (record) => ({
        onClick: (e) => {
          if (isMobile) {
            // 移动端点击显示/隐藏操作按钮
            const cell = e.currentTarget;
            const actionsEl = cell.querySelector('.companion-actions');
            
            // 先隐藏所有其他行的操作按钮
            document.querySelectorAll('.companion-actions').forEach(el => {
              if (el !== actionsEl) {
                el.classList.remove('visible');
              }
            });
            
            // 切换当前行的操作按钮显示状态
            actionsEl.classList.toggle('visible');
          }
        }
      })
    },
    {
      title: <span>随行人姓名 <span style={{ color: '#ff4d4f' }}>*</span></span>,
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: <span>随行人身份证 <span style={{ color: '#ff4d4f' }}>*</span></span>,
      dataIndex: 'idCard',
      key: 'idCard',
      width: 200,
    },
    {
      title: <span>随行人手机 <span style={{ color: '#ff4d4f' }}>*</span></span>,
      dataIndex: 'phone',
      key: 'phone',
      width: 180,
    },
    
    // 移除操作列
  ];

  // 切换展开/收起状态
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // 渲染随行人员弹框
  const renderCompanionModal = () => {
    const ModalComponent = isMobile ? Drawer : Modal;
    
    return (
      <ModalComponent
        title={isNewCompanion ? "添加随行人员" : "编辑随行人员"}
        open={companionModalVisible}
        onCancel={handleCancel}
        onClose={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveCompanion}>
            保存
          </Button>,
        ]}
        width={isMobile ? '100%' : 500}
        placement={isMobile ? 'bottom' : 'right'}
        height={isMobile ? '100%' : undefined}
        className="companion-modal"
      >
        <Form
          form={companionForm}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="随行人姓名"
            rules={[{ required: true, message: '请输入随行人姓名' }]}
          >
            <Input placeholder="请填写随行人姓名" />
          </Form.Item>
          <Form.Item
            name="idCard"
            label="随行人身份证"
            rules={[
              { required: true, message: '请输入随行人身份证号' },
              { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码' }
            ]}
          >
            <Input placeholder="请填写随行人身份证号" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="随行人手机"
            rules={[
              { required: true, message: '请输入随行人手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请填写随行人手机号" />
          </Form.Item>
          
        </Form>
      </ModalComponent>
    );
  };

  return (
    <div className="visitor-container">
      <div className="visitor-form-container">
        <div className="visitor-header">
          <Title level={4}>铁锚访客预约登记表</Title>
          <div className="visitor-notice">
            <Text type="danger">因涉及审批环节，被访人需至少提前半天填写本表单，填表注意事项如下：</Text>
            <Text type="secondary">【预约成功后，工作人员会与您联系】</Text>
          </div>
        </div>

        <Form
          form={form}
          name="visitor_registration"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <div className="form-section">
            <div className={`safety-notice ${expanded ? 'expanded' : 'collapsed'}`}>
              <div className="safety-notice-header">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  因涉及审批环节，被访人需至少提前半天填写本表单，填表注意事项如下：
                </Text>
                <Text type="danger" strong style={{ fontSize: '14px', marginTop: '8px', display: 'block' }}>
                  【20230312有更新，请展开查看全文！！】
                </Text>
              </div>
              
              <div className="safety-notice-content">
                <ol className="safety-list">
                  <li>院区停车位有限，访客来院车辆采取限流措施，当天办理访客车证上限100辆，饱和时将暂停办理访客车辆进厂，请来访人员优先选择绿色出行。 （政府部门、航司等重要的客户接待部门提前一天按《线下大型会议、培训、活动人员入院报批表》流程办理）。</li>
                  <li>请访客务必携带好身份证。</li>
                  <li>【重要】被访人员手机号需与企业微信中登记的<Text type="danger" strong>手机号一致</Text>，系统根据被访人手机号推送审批单及相关信息。被访人可在"企业微信--我--设置--账号"中确认。</li>
                  <li>访客预约审批流程为：用户提单--被访人审批--部门领导审批--结束。</li>
                  <li>外部人员来访联系工作或参加活动，遵守铁锚相关制度，接待部门应认真审核，坚持"谁接待，谁负责"的原则，接待部门必须有专人做好全程陪同。</li>
                 
                </ol>
                <Text strong style={{ fontSize: '16px', color: '#1890ff', marginTop: '16px', display: 'block' }}>
                  铁锚进厂安全告知：
                </Text>
                <Text>根据《治安保卫管理规定》（MR9421C），请进厂人员做好以下安全保卫及保密管理工作：</Text>
                <ol className="safety-list" start="1">
                  <li>遵守国家安全相关法律法规，遵守中国商飞公司及铁锚安全生产、治安保卫、保密等各项规定。</li>
                  <li>在铁锚办公期间，接待部门做好全程陪同。</li>
                  <li>来院办理的访客证及临时车辆通行证须当日归还。</li>
                  <li>严禁私自涂改、冒用或借用他人出入证件，严禁通过移动通讯设备复制门禁权限。</li>
                  <li>严格遵守《治安保卫管理规定》要求，履行保卫、保密职责，严禁进入与工作无关的区域。</li>
                  <li>未经允许，不触碰员工电脑及其他办公设备，铁锚内不随意违规拍照发布。</li>
                  <li>因工作必须携带危险化品、易燃易爆等物资入院的，接待部门提前申报铁锚安全管理部门。</li>
                  <li>进入或离开院区时，遵守携带物资进出管理要求，提前办理相关入院、出院物资审批手续（私人物品除外），主动配合安保人员检查，不以任何理由拒绝检查。</li>
                  <li>遵守铁锚内部道路交通安全规定，机动车应停放在划线车位内。车辆在院区内限速30公里以下，特殊路段根据限速标志执行。严禁车辆滞留院区。</li>
                  <li>工作期间，所获取的涉及铁锚的文件资料、样品或原型等信息均须保密。</li>
                </ol>
              </div>
              
              <div className="expand-button" onClick={toggleExpand}>
                <Text>{expanded ? '收起' : '展开显示全部'}</Text>
                {expanded ? <UpOutlined /> : <DownOutlined />}
              </div>
            </div>
          </div>

          <div className="form-section">
            <Title level={5}>基本信息</Title>
            
            {/* 将访客是否知晓注意事项及安全告知内容移到这里 */}
            <Form.Item
              name="knowSafetyRules"
              label="访客是否知晓注意事项及安全告知内容"
              rules={[{ required: true, message: '请选择是否知晓注意事项及安全告知内容' }]}
            >
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
            
            {/* 其余表单项保持不变 */}
            <Form.Item
              name="name"
              label="被访人姓名"
              rules={[{ required: true, message: '请输入被访人姓名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入被访人姓名" />
            </Form.Item>

            {/* 添加被访人手机号 */}
            <Form.Item
              name="hostPhone"
              label="被访人手机号"
              rules={[
                { required: true, message: '请输入被访人手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="请输入被访人手机号" />
            </Form.Item>

            {/* 添加来访地点 */}
            <Form.Item
              name="visitLocation"
              label="来访地点"
              rules={[{ required: true, message: '请输入来访地点' }]}
            >
              <Input prefix={<EnvironmentOutlined />} placeholder="请输入来访地点" />
            </Form.Item>

            {/* 添加来访开始时间 */}
            <Form.Item
              name="visitStartTime"
              label="来访开始时间"
              rules={[{ required: true, message: '请选择来访开始时间' }]}
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm" 
                placeholder="选择日期和时间"
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* 添加公司名称 */}
            <Form.Item
              name="companyName"
              label="公司名称"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="请填写公司名称" />
            </Form.Item>

            <Form.Item
              name="visitorName"
              label="访客姓名"
              rules={[{ required: true, message: '请输入您的姓名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入您的姓名" />
            </Form.Item>

            <Form.Item
              name="visitorPhone"
              label="访客手机号"
              rules={[
                { required: true, message: '请输入您的手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="请输入您的手机号" />
            </Form.Item>

            <Form.Item
              name="visitorCompany"
              label="访客单位"
            >
              <Input prefix={<HomeOutlined />} placeholder="请输入您的单位名称" />
            </Form.Item>

            <Form.Item
              name="visitorAddress"
              label="访客地址"
            >
              <Input prefix={<EnvironmentOutlined />} placeholder="请输入您的地址" />
            </Form.Item>

            <Form.Item
              name="idCard"
              label="身份证号"
              rules={[
                { required: true, message: '请输入您的身份证号' },
                { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码' }
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="请输入您的身份证号" />
            </Form.Item>

            

            <Form.Item
              name="visitReason"
              label="来访事由"
              rules={[{ required: true, message: '请输入来访事由' }]}
            >
              <TextArea rows={4} placeholder="请简要描述您的来访目的" />
            </Form.Item>

            {/* 添加照片上传 */}
            <Form.Item
              name="photo"
              label="照片（非必填）"
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false} // 阻止自动上传
              >
                <Button icon={<UploadOutlined />}>上传照片</Button>
              </Upload>
            </Form.Item>
          </div>

          {/* 添加随行人信息 */}
          <div className="form-section">
            <div className="companion-header">
              <Title level={5}>随行人信息</Title>
              <Text type="secondary">如无随行人，可不填</Text>
            </div>
            
            <div className="companion-table">
              <Table 
                dataSource={companions} 
                columns={columns} 
                pagination={false}
                rowKey="key"
                size="small"
                bordered
                scroll={{ x: 866 }}
                locale={{ emptyText: '暂无随行人信息' }}
              />
              <Button 
                type="dashed" 
                onClick={() => showCompanionModal(true)}
                style={{ width: '100%', marginTop: 16 }}
                icon={<PlusOutlined />}
              >
                添加
              </Button>
            </div>
          </div>

          {/* 删除这里原来的访客是否知晓注意事项及安全告知内容部分 */}

          {/* 将个人承诺移到底部 */}
          <div className="form-section">
            <Form.Item
              name="personalPromise"
              label="个人承诺"
              rules={[{ required: true, message: '请选择个人承诺' }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="true">我承诺所填信息的真实性</Radio>
                  <Radio value="false">我无法承诺</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交登记
            </Button>
          </Form.Item>
        </Form>

        <div className="qrcode-section">
          <Space direction="vertical" align="center">
            <QRCode value="https://example.com/visitor" />
            <Text>扫码关注公众号，了解更多信息</Text>
          </Space>
        </div>
        {renderCompanionModal()}
      </div>
    </div>
  );
};

export default VisitorPage;