const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../models");
const { Visitors, Sequelize, Host, VisitorsForms } = db;
const { setParamter, setPagination } = require("../utils/tools");
const { hostMailProducer,  } = require("../utils/rabbit-mq");
const { hostEmailhtml, visitorEmailHtml } = require("../utils/emailTemple");
const sendMail = require("../utils/mail");
// 获取所有访客
// 根据 parameter后获取visitorId，然后依据visitorId再按照visitorId分组获取VisitorsFormId数据，再和visitor表根据visitorid拼接数据。
//  result 的格式 [{
//     "id": 2,
//     "name": "夏夏",
//     "phone": "15222222222",
//     "id_card": "320555555555555",
//     "company": "南京工业",
//     "createdAt": "2025-05-28T03:26:51.000Z",
//     "updatedAt": "2025-05-28T03:26:51.000Z",
//     "visitor_id": 2,
//     "form_count": 6
// }],
//
//   // ...

// // 发送邮件
// router.get("/email", async (req, res) => {
//   try {
//     await sendMail(
//       "824542478@qq.com",
//       "「长乐未央」的注册成功通知",
//       visitorEmailHtml()
//     );
//     res.json({ success: true, message: "邮件发送成功" });
//   } catch (error) {
//     console.error("邮件发送失败:", error);
//     res.status(500).json({
//       success: false,
//       message: "邮件发送失败",
//       error: error.message,
//     });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const params = setParamter(req.query);
    const { count, rows: visitorsData } = await Visitors.findAndCountAll({
      where: { ...params },
      attributes: ["id"],
    });
    const pagination = setPagination({ count, pageSize, page });
    const ids = visitorsData?.map((i) => i?.id) || [];

    const result = await db.sequelize.query(
      `SELECT *,
              f.form_count
        FROM visitors v
        JOIN (
          SELECT visitor_id, COUNT(VisitorsFormId) AS form_count
          FROM formhostvisitors
          WHERE visitor_id IN (:ids)
          GROUP BY visitor_id
        ) AS f ON v.id = f.visitor_id`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      message: "查询visitors信息",
      data: result,
      pagination,
    });
  } catch (error) {
    console.error("获取访客列表失败:", error);
    res.status(500).json({ message: "获取访客列表失败", error: error.message });
  }
});

// 创建访客及相关信息 - 使用事务
router.post(
  "/",
  [
    // 访客信息验证
    body("visitor.name")
      .notEmpty()
      .withMessage("访客姓名不能为空")
      .isLength({ max: 100 })
      .withMessage("访客姓名不能超过100个字符"),
    body("visitor.phone")
      .notEmpty()
      .withMessage("访客手机号不能为空")
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入正确的手机号码"),
    body("visitor.id_card")
      .notEmpty()
      .withMessage("访客身份证号不能为空")
      .matches(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/)
      .withMessage("请输入正确的身份证号码"),
    body("visitor.company")
      .optional()
      .isLength({ max: 100 })
      .withMessage("公司名称不能超过100个字符"),
    body("visitor.email")
      .notEmpty()
      .withMessage("电子邮箱不能为空")
      .isEmail()
      .withMessage("请输入有效的电子邮箱地址"),

    // 访问表单信息验证
    body("visitForm.visit_reason").notEmpty().withMessage("来访事由不能为空"),
    body("visitForm.visit_time")
      .notEmpty()
      .withMessage("来访时间不能为空")
      .isISO8601()
      .withMessage("请输入正确的日期时间格式"),
    body("visitForm.location")
      .optional()
      .isLength({ max: 100 })
      .withMessage("来访地点不能超过100个字符"),

    // 被访人信息验证
    body("hosts")
      .isArray()
      .withMessage("被访人信息必须是数组")
      .notEmpty()
      .withMessage("被访人不能为空"),
    body("hosts.*.name")
      .notEmpty()
      .withMessage("被访人姓名不能为空")
      .isLength({ max: 100 })
      .withMessage("被访人姓名不能超过100个字符"),
    body("hosts.*.phone")
      .notEmpty()
      .withMessage("被访人手机号不能为空")
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入正确的手机号码"),

    // 随行人信息验证
    body("companions").isArray().withMessage("随行人信息必须是数组"),
    body("companions.*.name")
      .notEmpty()
      .withMessage("随行人姓名不能为空")
      .isLength({ max: 100 })
      .withMessage("随行人姓名不能超过100个字符"),
    body("companions.*.phone")
      .optional()
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入正确的手机号码"),
    body("companions.*.id_card")
      .optional()
      .matches(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/)
      .withMessage("请输入正确的身份证号码"),
  ],
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 开始事务
    const t = await db.sequelize.transaction();

    try {
      const { visitor, visitForm, hosts, companions } = req.body;
      // 1. 创建访客记录
      const visitorData = {
        name: visitor.name,
        phone: visitor.phone,
        id_card: visitor.id_card,
        company: visitor.company,
        email: visitor.email,
      };
      //创建访客信息，如果已经创建，然后更新访客信息，如果没有创建，然后创建访客信息 defaults: visitorData
      const [newVisitor, created] = await db.Visitors.findOrCreate({
        where: { id_card: visitor.id_card },
        defaults: {
          ...visitorData,
        },
        transaction: t,
      });
      // 如果已经创建，然后更新访客信息
      if (created) {
        await db.Visitors.update(visitorData, {
          where: { id_card: visitor.id_card }, // 添加 where 条件
          transaction: t,
        });
      }

      // 2. 创建访问表单记录
      const newVisitForm = await db.VisitorsForms.create(
        {
          ...visitForm,
          approved: null,
        },
        { transaction: t }
      );

      // 3. 处理被访人信息
      const hostData = {
        name: hosts[0].name,
        phone: hosts[0].phone,
      };
      // 创建被访问人信息，如果已经创建，然后更新访客信息，如果没有创建，然后创建访客信息 defaults: hostData
      const [mainHost, hasHostCreated] = await db.Host.findOrCreate({
        where: { phone: hosts[0].phone },
        defaults: {
          ...hostData,
        },
        transaction: t,
      });
      if (hasHostCreated) {
        await db.Host.update(hostData, {
          where: { phone: hostData.phone },
          transaction: t,
        });
      }
      // 创建主visitor与中间表的关联记录
      await db.FormHostVisitors.create(
        {
          VisitorsFormId: newVisitForm.id,
          host_id: mainHost.id,
          visitor_id: newVisitor.id,
          isMinRole: 1, // 主访客
        },
        { transaction: t }
      );

      // 4. 创建随行人记录并关联到表单
      const newCompanions = [];
      if (companions && companions.length > 0) {
        for (const companion of companions) {
          // 创建随行人作为访客
          const companionData = {
            name: companion?.name,
            phone: companion?.phone,
            id_card: companion?.id_card,
            company: visitor?.company,
            email: companion?.email,
          };
          // 创建随行人，如果已经创建，然后更新访客信息，如果没有创建，然后创建访客信息 defaults: companion
          const [newCompanion, hasCompanionCreated] =
            await db.Visitors.findOrCreate({
              where: { phone: companion.phone },
              defaults: {
                ...companionData,
              },
              transaction: t,
            });
          if (hasCompanionCreated) {
            await db.Visitors.update(companionData, {
              where: { id_card: companionData.id_card },
              transaction: t,
            });
          }
          newCompanions.push(newCompanion);

          // 创建随行人与表单和被访人的关联
          if (mainHost) {
            await db.FormHostVisitors.create(
              {
                VisitorsFormId: newVisitForm?.id,
                host_id: mainHost?.id,
                visitor_id: newCompanion?.id,
                isMinRole: 0, // 随行人
              },
              { transaction: t }
            );
          }
        }
      }

      // 提交事务
      await t.commit();
      // TODO 修改to: "xialingling@tiemao.cn",
      const msg = {
        to: "xialingling@tiemao.cn",
        subject: "申请表请求通知",
        html: hostEmailhtml(mainHost, newVisitor, newVisitForm, companions)
      };
      // 将发送任务放在了到消息队列里
      await hostMailProducer(msg);

      // 生成二维码链接路径部分
      const qrCodeLink = `/visitor-check/${newVisitForm.id}`;

      // 返回创建的数据
      const result = {
        visitor: newVisitor,
        visitForm: newVisitForm,
        hosts: mainHost ? [mainHost] : [],
        companions: newCompanions,
        qrCodeLink: qrCodeLink, // 只返回路径部分
      };

      res.status(201).json({
        message: "访客信息创建成功",
        data: result,
      });
    } catch (error) {
      // 回滚事务
      await t.rollback();
      console.error("创建访客信息失败:", error);
      res.status(500).json({
        message: "创建访客信息失败",
        error: error.message,
      });
    }
  }
);

// 获取单个访客详情
router.get("/:id", async (req, res) => {
  try {
    const visitor = await Visitors.findByPk(req.params?.id, {
      include: [
        { model: Host },
        {
          model: VisitorsForms,
        },
      ],
    });

    if (!visitor) {
      return res.status(404).json({ message: "访客不存在" });
    }
    res.json(visitor);
  } catch (error) {
    console.error("获取访客详情失败:", error);
    res.status(500).json({ message: "获取访客详情失败", error: error.message });
  }
});

module.exports = router;
