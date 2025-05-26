const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const {VisitorsForms,Visitors,FormHostVisitors,Host,User}=db;
const { Op } = require('sequelize');
console.log('db',db);
// 获取所有访客
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitors.findAll({
      include: [
        { model: VisitorsForms ,distinct: true },
        { model: Host ,distinct: true }
      ],
      distinct: true
    });
    res.json(visitors);
  } catch (error) {
    console.error('获取访客列表失败:', error);
    res.status(500).json({ message: '获取访客列表失败', error: error.message });
  }
});

// 创建访客及相关信息 - 使用事务
router.post('/', [
  // 访客信息验证
  body('visitor.name').notEmpty().withMessage('访客姓名不能为空').isLength({ max: 100 }).withMessage('访客姓名不能超过100个字符'),
  body('visitor.phone').notEmpty().withMessage('访客手机号不能为空').matches(/^1[3-9]\d{9}$/).withMessage('请输入正确的手机号码'),
  body('visitor.id_card').notEmpty().withMessage('访客身份证号不能为空').matches(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).withMessage('请输入正确的身份证号码'),
  body('visitor.company').optional().isLength({ max: 100 }).withMessage('公司名称不能超过100个字符'),
  
  // 访问表单信息验证
  body('visitForm.visit_reason').notEmpty().withMessage('来访事由不能为空'),
  body('visitForm.visit_time').notEmpty().withMessage('来访时间不能为空').isISO8601().withMessage('请输入正确的日期时间格式'),
  body('visitForm.location').optional().isLength({ max: 100 }).withMessage('来访地点不能超过100个字符'),
  
  // 被访人信息验证
  body('hosts').isArray().withMessage('被访人信息必须是数组').notEmpty().withMessage('被访人不能为空'),
  body('hosts.*.name').notEmpty().withMessage('被访人姓名不能为空').isLength({ max: 100 }).withMessage('被访人姓名不能超过100个字符'),
  body('hosts.*.phone').notEmpty().withMessage('被访人手机号不能为空').matches(/^1[3-9]\d{9}$/).withMessage('请输入正确的手机号码'),
  
  // 随行人信息验证
  body('companions').isArray().withMessage('随行人信息必须是数组'),
  body('companions.*.name').notEmpty().withMessage('随行人姓名不能为空').isLength({ max: 100 }).withMessage('随行人姓名不能超过100个字符'),
  body('companions.*.phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('请输入正确的手机号码'),
  body('companions.*.id_card').optional().matches(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).withMessage('请输入正确的身份证号码'),
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
console.log('db.Host',db.Host);
  // 开始事务
  const t = await db.sequelize.transaction();

  try {
    const { visitor, visitForm, hosts, companions } = req.body;
  
    // 1. 创建访客记录 - 移除不存在的 company 字段
    const visitorData = {
      name: visitor.name,
      phone: visitor.phone,
      id_card: visitor.id_card,
      company: visitor.company // 这里添加了 company 字段，因为它是可选的，所以需要在这里添加
    };
    let newVisitor=null;
    console.log('visitorData',visitorData);
    // 先查询是否有重复的身份证号
    const existingVisitor = await db.Visitors.findOne({
      where: { id_card: visitor.id_card },
      transaction: t
    });
    if (existingVisitor) {
      newVisitor=existingVisitor;
      // 更新访客信息
      await existingVisitor.update(visitorData, { transaction: t });
    }else{
      newVisitor = await db.Visitors.create(visitorData, { transaction: t });
    }
    
  
    // 2. 创建访问表单记录
    const newVisitForm = await db.VisitorsForms.create({
      ...visitForm
    }, { transaction: t });
    
    // 3. 处理被访人信息
    let mainHost = null;
    if (hosts && hosts.length > 0) {
      // 查找或创建主被访人
      console.log('db.Host',db.Host);
      console.log('hosts[0].phone',hosts[0].phone);
      // 修改顶部导入语句，添加 Host 模型
      const { Visitor, Companion, VisitForm, Attendee, Host } = db;
      
      // 在事务代码段中，修改查询语句
      const [hostRecord, created] = await Host.findOrCreate({
        where: { phone: hosts[0].phone },
        defaults: {
          name: hosts[0].name,
          phone: hosts[0].phone
        },
        transaction: t
      });
      console.log('hostRecord111',hostRecord);
      mainHost = hostRecord;
      
      // 创建主被访人与表单的关联记录
      await db.FormHostVisitors.create({
        VisitorsFormId: newVisitForm.id,
        host_id: mainHost.id,
        visitor_id: newVisitor.id,
        isMinRole: 1 // 主访客
      }, { transaction: t });
      
      // 处理其他被访人（如果有）
      for (let i = 1; i < hosts.length; i++) {
        const [otherHost, created] = await db.Host.findOrCreate({
          where: { phone: hosts[i].phone },
          defaults: {
            name: hosts[i].name,
            phone: hosts[i].phone
          },
          transaction: t
        });
       
        // 创建其他被访人与表单的关联记录
        await db.FormHostVisitors.create({
          VisitorsFormId: newVisitForm.id,
          host_id: otherHost.id,
          visitor_id: newVisitor.id,
          isMinRole: 0 // 非主访客
        }, { transaction: t });
      }
    }
  
    // 4. 创建随行人记录并关联到表单
    const newCompanions = [];
    if (companions && companions.length > 0) {
      for (const companion of companions) {
        // 创建随行人作为访客 - 移除不存在的 company 字段
        const newCompanionVisitor = await db.Visitors.create({
          name: companion.name,
          phone: companion.phone,
          id_card: companion.id_card,
          company: visitor.company
          // 不包含 company 字段
        }, { transaction: t });
        
        newCompanions.push(newCompanionVisitor);
        
        // 创建随行人与表单和被访人的关联
        if (mainHost) {
          await db.FormHostVisitors.create({
            VisitorsFormId: newVisitForm.id,
            host_id: mainHost.id,
            visitor_id: newCompanionVisitor.id,
            isMinRole: 0 // 随行人
          }, { transaction: t });
        }
      }
    }
    // test
    const visitorForms=await db.VisitorsForms.findAll({
      include: [
        { model: db.Visitors},
        { model: db.Host},
      ]
    });
    console.log();
    // 提交事务
    await t.commit();
    
    // 返回创建的数据
    const result = {
      visitor: newVisitor,
      visitForm: newVisitForm,
      hosts: mainHost ? [mainHost] : [],
      companions: newCompanions,
      data:visitorForms
    };
    
    res.status(201).json({
      message: '访客信息创建成功',
      data: result
    });
  } catch (error) {
    // 回滚事务
    await t.rollback();
    console.error('创建访客信息失败:', error);
    res.status(500).json({ 
      message: '创建访客信息失败', 
      error: error.message 
    });
  }
});

// 获取单个访客详情
router.get('/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id, {
      include: [
        { model: Companion },
        { 
          model: VisitForm,
          include: [
            { model: Attendee }
          ]
        }
      ]
    });
    
    if (!visitor) {
      return res.status(404).json({ message: '访客不存在' });
    }
    
    res.json(visitor);
  } catch (error) {
    console.error('获取访客详情失败:', error);
    res.status(500).json({ message: '获取访客详情失败', error: error.message });
  }
});

// 获取所有访问表单及相关信息
router.get('/forms/all', async (req, res) => {
  try {
    const visitorForms = await db.VisitorsForms.findAll({
      include: [
        { 
          model: db.Visitors,
          attributes: ['id', 'name', 'phone', 'id_card', 'company']
        },
        {
          model: db.Host,
          through: { attributes: [] }, // 隐藏中间表字段
          attributes: ['id', 'name', 'phone'],
          distinct: true // 去除重复的 Host 记录
        }
      ],
      distinct: true // 确保主记录也不重复
    });
    
    res.json({
      message: '获取访问表单列表成功',
      data: visitorForms
    });
  } catch (error) {
    console.error('获取访问表单列表失败:', error);
    res.status(500).json({ 
      message: '获取访问表单列表失败', 
      error: error.message 
    });
  }
});

module.exports = router;