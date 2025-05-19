import React from 'react';
import { Form, Input, Button, Card, message ,Spin} from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import{updatePassword} from '../api/user';
const ChangePassword = () => {
  const [form] = Form.useForm();
  const { userInfo, loading } = useUser();

  console.log("userInfo: ", userInfo);
  const onFinish = async(values) => {
    try {
      if (!userInfo) {
        message.error('用户信息不可用，请重新登录');
        return;
      }

      const data = {
        userId: userInfo?.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      };

      const response = await updatePassword(data);
      
      if (response.status) {
        message.success('密码修改成功');
        form.resetFields();
      } else {
        message.error(response.message || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败，请重试');
    }
    };
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      );
    }
   

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Card title="修改密码" variant="outlined">
        <Form
          form={form}
          name="changePassword"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能小于6位' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;