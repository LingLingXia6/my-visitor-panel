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

const visitorEmailHtml = (visitorName = '') => `
      您好，<span style="color: red">${visitorName || '你好test 账号'}</span><br><br>
      恭喜，您已成功注册会员！<br><br>
      请访问<a href="https://clwy.cn">「长乐未央」</a>官网，了解更多。<br><br>
      ━━━━━━━━━━━━━━━━<br>
      长乐未央
    `;

module.exports = { hostEmailhtml, visitorEmailHtml };
