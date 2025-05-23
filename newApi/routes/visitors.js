const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const { Visitor, Companion, VisitForm, Attendee } = db;
const { Op } = require('sequelize');

// 获取所有访客
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.findAll({
      include: [
        { model: Companion },
        { model: VisitForm }
      ]
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
  body('visitForm.host_name').notEmpty().withMessage('被访人姓名不能为空').isLength({ max: 100 }).withMessage('被访人姓名不能超过100个字符'),
  body('visitForm.host_phone').notEmpty().withMessage('被访人手机号不能为空').matches(/^1[3-9]\d{9}$/).withMessage('请输入正确的手机号码'),
  
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

  // 开始事务
  const t = await db.sequelize.transaction();

  try {
    const { visitor, visitForm, companions } = req.body;
  
    // 1. 创建访客记录
    const newVisitor = await Visitor.create(visitor, { transaction: t });
  
    // 2. 创建访问表单记录 - 移除错误的tableName选项
    const newVisitForm = await VisitForm.create({
      ...visitForm,
      visitor_id: newVisitor.id
    }, { 
      transaction: t
      // 移除了这里的tableName选项
    });
  
    // 3. 创建随行人记录
    const newCompanions = [];
    if (companions && companions.length > 0) {
      for (const companion of companions) {
        const newCompanion = await Companion.create({
          ...companion,
          visitor_id: newVisitor.id
        }, { transaction: t });
        newCompanions.push(newCompanion);
      }
    }
    
    // 4. 创建参与者记录 - 首先添加访客本人
    await Attendee.create({
      form_id: newVisitForm.id,
      name: newVisitor.name,
      role: 'visitor',
      original_id: newVisitor.id,
      phone: newVisitor.phone,
      id_card: newVisitor.id_card
    }, { transaction: t });
    
    // 5. 添加随行人到参与者表
    if (newCompanions.length > 0) {
      for (const companion of newCompanions) {
        await Attendee.create({
          form_id: newVisitForm.id,
          name: companion.name,
          role: 'companion',
          original_id: companion.id,
          phone: companion.phone,
          id_card: companion.id_card
        }, { transaction: t });
      }
    }
    
    // 提交事务
    await t.commit();
    
    // 返回创建的数据
    const result = {
      visitor: newVisitor,
      visitForm: newVisitForm,
      companions: newCompanions
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
    const visitForms = await VisitForm.findAll({
      include: [
        { 
          model: Visitor,
          attributes: ['id', 'name', 'phone', 'id_card', 'company'] 
        },
        { 
          model: Attendee,
          attributes: ['id', 'name', 'role', 'phone', 'id_card'] 
        }
      ],
      order: [['created_at', 'DESC']] // 按创建时间降序排列
    });
    
    res.json({
      message: '获取访问表单列表成功',
      data: visitForms
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