import React, { useState } from 'react';
import { Form, Input, Button, Radio, Typography, Space, Checkbox, QRCode, message } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, EnvironmentOutlined, IdcardOutlined } from '@ant-design/icons';
import './VisitorPage.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const VisitorPage = () => {
  const [form] = Form.useForm();
  const [agreed, setAgreed] = useState(false);

  const onFinish = (values) => {
    console.log('表单提交值:', values);
    message.success('登记信息提交成功！');
    form.resetFields();
  };

  return (
    <div className="visitor-container">
      <div className="visitor-form-container">
        <div className="visitor-header">
          <Title level={4}>访客预约登记表</Title>
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
            <Paragraph>
              <ul>
                <li>院区停车位有限，访客来院车辆采取限流措施，当天办理访客车证上限100辆，饱和时将暂停办理访客车辆进院，请来访人员优先选择绿色出行。（政府部门、航司等重要的客户接待部门提前一天按《线下大型会议、培训、活动人员入院报批表》流程办理）。</li>
                <li>请访客务必携带好身份证。</li>
                <li>【重要】来访当天，请携带身份证原件，到前台办理访客证。</li>
                <li>访客预约审批流程为：用户提单---被访人审批--部门领导审批--结束。</li>
                <li>外部人员来访联系工作或参加活动，遵守上飞院相关制度，接待部门应认真审核，坚持“谁接待，谁负责”的原则，接待部门必须有专人做好全程陪同。</li>
              </ul>
            </Paragraph>
          </div>

          <div className="form-section">
            <Title level={5}>基本信息</Title>
            <Form.Item
              name="name"
              label="被访人姓名"
              rules={[{ required: true, message: '请输入被访人姓名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入被访人姓名" />
            </Form.Item>

            <Form.Item
              name="department"
              label="被访部门"
              rules={[{ required: true, message: '请输入被访部门' }]}
            >
              <Input placeholder="请输入被访部门" />
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
          </div>

          <div className="form-section">
            <Title level={5}>是否为外籍人士？</Title>
            <Form.Item
              name="isForeigner"
              rules={[{ required: true, message: '请选择是否为外籍人士' }]}
            >
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <div className="form-section">
            <Title level={5}>是否携带电脑？</Title>
            <Form.Item
              name="hasLaptop"
              rules={[{ required: true, message: '请选择是否携带电脑' }]}
            >
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <div className="form-section">
            <Form.Item>
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                我已阅读并同意《访客管理规定》
              </Checkbox>
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={!agreed}>
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
      </div>
    </div>
  );
};

export default VisitorPage;