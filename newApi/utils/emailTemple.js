const hostEmailhtml = (mainHost, visitor, visitForm, companions) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">访问申请通知</h2>
            <p>尊敬的 <strong>${mainHost.name}</strong>：</p>
            <p>您有一个新的访问申请需要审核。详情如下：</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>访客姓名：</strong>${visitor.name}</p>
              <p><strong>访客公司：</strong>${visitor.company || "未提供"}</p>
              <p><strong>来访事由：</strong>${visitForm.visit_reason}</p>
              <p><strong>预计来访时间：</strong>${new Date(
                visitForm.visit_time
              ).toLocaleString("zh-CN")}</p>
              <p><strong>随行人数：</strong>${
                companions ? companions.length : 0
              }人</p>
            </div>
            <p>请登录系统查看详情并进行审核。</p>
            <p style="margin-top: 30px; color: #777; font-size: 12px;">此邮件由系统自动发送，请勿直接回复。</p>
          </div>
        `;

const visitorEmailTemplate = (name, token, approved, link) => {
  if (approved) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">申请审核通过</h2>
        <p>您好，<strong>${name}</strong>！</p>
        <p>您的申请表已经通过，验证码是：<strong style="color: #007bff;">${token}</strong></p>
        <p>请扫描下方二维码进行查看：</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; border-radius: 8px; border: 1px solid #ddd;" />
        </div>
        <p>或者查看链接：<a href="${link}" style="color: #007bff; text-decoration: none;">${link}</a></p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">感谢您的耐心等待。此邮件由系统自动发送，请勿直接回复。</p>
      </div>
    `;
  } else {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #d9534f;">申请审核未通过</h2>
        <p>您好，<strong>${name}</strong>！</p>
        <p>很抱歉，您的申请没有通过。</p>
        <p>申请信息如在下方二维码中：</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; border-radius: 8px; border: 1px solid #ddd;" />
        </div>
        <p>或者查看链接：<a href="${link}" style="color: #007bff; text-decoration: none;">${link}</a></p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">如有疑问，请联系相关负责人。此邮件由系统自动发送，请勿直接回复。</p>
      </div>
    `;
  }
};

module.exports = { hostEmailhtml, visitorEmailTemplate };
