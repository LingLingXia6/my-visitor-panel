const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const {VisitorsForms,Visitors,FormHostVisitors,Host,User}=db;
const { Op } = require('sequelize');

// 获取所有访客
router.get('/', async (req, res) => {
  try {
    // 获取查询参数
    const { name, phone, startTime, endTime, page = 1, pageSize = 10 } = req.query;
    
    // 将页码和每页数量转换为数字
    const currentPage = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const offset = (currentPage - 1) * limit;
    
    // 构建查询条件
    const whereCondition = {};
    
    // 如果提供了姓名，添加姓名搜索条件
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    
    // 如果提供了电话，添加电话搜索条件
    if (phone) {
      whereCondition.phone = { [Op.like]: `%${phone}%` };
    }
    
    // 构建访问时间查询条件（用于关联查询）
    const visitFormWhereCondition = {};
    
    // 如果提供了开始时间和结束时间，添加时间范围搜索条件
    if (startTime && endTime) {
      visitFormWhereCondition.visit_time = {
        [Op.between]: [new Date(startTime), new Date(endTime)]
      };
    } else if (startTime) {
      // 只有开始时间
      visitFormWhereCondition.visit_time = {
        [Op.gte]: new Date(startTime)
      };
    } else if (endTime) {
      // 只有结束时间
      visitFormWhereCondition.visit_time = {
        [Op.lte]: new Date(endTime)
      };
    }
    
    // 查询条件对象
    const queryOptions = {
      where: whereCondition,
      include: [
        { 
          model: VisitorsForms,
          distinct: true,
          where: Object.keys(visitFormWhereCondition).length > 0 ? visitFormWhereCondition : undefined
        },
        { 
          model: Host,
          distinct: true 
        }
      ],
      distinct: true,
      limit,
      offset
    };
    
    // 获取总记录数
    const { count, rows: visitors } = await Visitors.findAndCountAll(queryOptions);
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    // 判断是否有下一页
    const hasNextPage = currentPage < totalPages;
    
    res.json({
      data: visitors,
      pagination: {
        total: count,
        currentPage,
        pageSize: limit,
        totalPages,
        hasNextPage
      }
    });
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

  // 开始事务
  const t = await db.sequelize.transaction();

  try {
    const { visitor, visitForm, hosts, companions } = req.body;
  
    // 1. 创建访客记录 
    const visitorData = {
      name: visitor.name,
      phone: visitor.phone,
      id_card: visitor.id_card,
      company: visitor.company // 这里添加了 company 字段，因为它是可选的，所以需要在这里添加
    };
    //创建访客信息，如果已经创建，然后更新访客信息，如果没有创建，然后创建访客信息 defaults: visitorData
    const [newVisitor,created]=await db.Visitors.findOrCreate({
      where: { id_card: visitor.id_card },
      defaults: {
       ...visitorData
      },
      transaction: t
    });
    // 如果已经创建，然后更新访客信息
    if(created){
      await db.Visitors.update(visitorData, { transaction: t });
    }
  
    // 2. 创建访问表单记录
    const newVisitForm = await db.VisitorsForms.create({
      ...visitForm
    }, { transaction: t });
    
    // 3. 处理被访人信息
    const hostData={ 
      name: hosts[0].name,
      phone: hosts[0].phone
    };
    
  // 创建被访问人信息，如果已经创建，然后更新访客信息，如果没有创建，然后创建访客信息 defaults: hostData
  const [mainHost, hasHostCreated] = await db.Host.findOrCreate({
    where: { phone: hosts[0].phone },
    defaults: {
      ...hostData
    },
    transaction: t
  });
  if(hasHostCreated){
    await db.Host.update(hostData, { transaction: t });
  }
  // 创建主visitor与中间表的关联记录
    await db.FormHostVisitors.create({
      VisitorsFormId: newVisitForm.id,
      host_id: mainHost.id,
      visitor_id: newVisitor.id,
      isMinRole: 1 // 主访客
    }, { transaction: t });


    // 4. 创建随行人记录并关联到表单
    const newCompanions = [];
    if (companions && companions.length > 0) {
      for (const companion of companions) {
        // 创建随行人作为访客 
        const companionData={
          name: companion?.name,
          phone: companion?.phone,
          id_card: companion?.id_card,
          company: visitor?.company
        };
        // 创建随行人，如果已经创建，然后更新访客信息，如果没有创建，然后创建访客信息 defaults: companion
        const [newCompanion, hasCompanionCreated] = await db.Visitors.findOrCreate({
          where: { phone: companion.phone },
          defaults: {
            ...companionData
          },
          transaction: t
        });
        if(hasCompanionCreated){
          await db.Visitors.update(companionData, { transaction: t });
        }
        newCompanions.push(newCompanion);
        
        // 创建随行人与表单和被访人的关联
        if (mainHost) {
          await db.FormHostVisitors.create({
            VisitorsFormId: newVisitForm?.id,
            host_id: mainHost?.id,
            visitor_id: newCompanion?.id,
            isMinRole: 0 // 随行人
          }, { transaction: t });
        }
      }
    }
    
    // 提交事务
    await t.commit();
    
    // 返回创建的数据
    const result = {
      visitor: newVisitor,
      visitForm: newVisitForm,
      hosts: mainHost ? [mainHost] : [],
      companions: newCompanions,
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
    // 获取查询参数
    const { 
      visitorName, 
      visitorPhone, 
      hostName, 
      hostPhone, 
      startTime, 
      endTime, 
      page = 1, 
      pageSize = 10 
    } = req.query;
    
    // 将页码和每页数量转换为数字
    const currentPage = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const offset = (currentPage - 1) * limit;
    
    // 构建访问表单时间查询条件
    const formWhereCondition = {};
    
    // 如果提供了开始时间和结束时间，添加时间范围搜索条件
    if (startTime && endTime) {
      formWhereCondition.visit_time = {
        [Op.between]: [new Date(startTime), new Date(endTime)]
      };
    } else if (startTime) {
      // 只有开始时间
      formWhereCondition.visit_time = {
        [Op.gte]: new Date(startTime)
      };
    } else if (endTime) {
      // 只有结束时间
      formWhereCondition.visit_time = {
        [Op.lte]: new Date(endTime)
      };
    }
    
    // 构建访客查询条件
    const visitorWhereCondition = {};
    
    // 如果提供了访客姓名，添加访客姓名搜索条件
    if (visitorName) {
      visitorWhereCondition.name = { [Op.like]: `%${visitorName}%` };
    }
    
    // 如果提供了访客电话，添加访客电话搜索条件
    if (visitorPhone) {
      visitorWhereCondition.phone = { [Op.like]: `%${visitorPhone}%` };
    }
    
    // 构建被访人查询条件
    const hostWhereCondition = {};
    
    // 如果提供了被访人姓名，添加被访人姓名搜索条件
    if (hostName) {
      hostWhereCondition.name = { [Op.like]: `%${hostName}%` };
    }
    
    // 如果提供了被访人电话，添加被访人电话搜索条件
    if (hostPhone) {
      hostWhereCondition.phone = { [Op.like]: `%${hostPhone}%` };
    }
    
    // 查询条件对象
    const queryOptions = {
      where: formWhereCondition,
      include: [
        { 
          model: db.Visitors,
          attributes: ['id', 'name', 'phone', 'id_card', 'company'],
          where: Object.keys(visitorWhereCondition).length > 0 ? visitorWhereCondition : undefined
        },
        {
          model: db.Host,
          through: { attributes: [] }, // 隐藏中间表字段
          attributes: ['id', 'name', 'phone'],
          where: Object.keys(hostWhereCondition).length > 0 ? hostWhereCondition : undefined,
          distinct: true // 去除重复的 Host 记录
        }
      ],
      distinct: true, // 确保主记录也不重复
      limit,
      offset,
      order: [['visit_time', 'DESC']] // 按访问时间降序排序，最新的在前面
    };
    
    // 获取总记录数和分页数据
    const { count, rows: visitorForms } = await db.VisitorsForms.findAndCountAll(queryOptions);
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    // 判断是否有下一页
    const hasNextPage = currentPage < totalPages;
    
    res.json({
      message: '获取访问表单列表成功',
      data: visitorForms,
      pagination: {
        total: count,
        currentPage,
        pageSize: limit,
        totalPages,
        hasNextPage
      }
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