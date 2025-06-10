const { setParamter, setPagination } = require("../utils/tools");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../models");
const { VisitorsForms, Visitors, FormHostVisitors, Host, User, Sequelize } = db;

const { Op, where, QueryTypes } = require("sequelize");

// 获取所有访问表单及相关信息

router.get("/", async (req, res) => {
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
      pageSize = 10,
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
        [Op.between]: [new Date(startTime), new Date(endTime)],
      };
    } else if (startTime) {
      // 只有开始时间
      formWhereCondition.visit_time = {
        [Op.gte]: new Date(startTime),
      };
    } else if (endTime) {
      // 只有结束时间
      formWhereCondition.visit_time = {
        [Op.lte]: new Date(endTime),
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
    let queryOptions = {
      where: formWhereCondition,
      include: [
        {
          model: db.Visitors,
          attributes: ["id", "name", "phone", "id_card", "company"],
          // 不在这里直接筛选访客
          required: false,
        },
        {
          model: db.Host,
          through: { attributes: [] }, // 隐藏中间表字段
          attributes: ["id", "name", "phone"],
          // 不在这里直接筛选被访人
          required: false,
          distinct: true, // 去除重复的 Host 记录
        },
      ],
      distinct: true, // 确保主记录也不重复
      order: [["visit_time", "DESC"]], // 按访问时间降序排序，最新的在前面
    };

    // 如果有访客姓名或电话筛选条件，使用子查询而不是先获取所有IDs
    if (visitorName || visitorPhone) {
      // 使用子查询直接筛选包含特定访客的表单
      queryOptions.where = {
        ...queryOptions.where,
        id: {
          [Op.in]: db.sequelize.literal(`(
    SELECT DISTINCT \`FormHostVisitors\`.\`VisitorsFormId\` 
    FROM \`FormHostVisitors\` 
    JOIN \`Visitors\` ON \`FormHostVisitors\`.\`visitor_id\` = \`Visitors\`.\`id\` 
    WHERE ${
      visitorName ? `\`Visitors\`.\`name\` LIKE '%${visitorName}%'` : "1=1"
    } 
    ${visitorPhone ? `AND \`Visitors\`.\`phone\` LIKE '%${visitorPhone}%'` : ""}
    )`),
        },
      };
    }

    // 如果有被访人姓名或电话筛选条件，同样使用子查询
    if (hostName || hostPhone) {
      const hostSubquery = db.sequelize.literal(`(
    SELECT DISTINCT \`FormHostVisitors\`.\`VisitorsFormId\` 
    FROM \`FormHostVisitors\` 
    JOIN \`Host\` ON \`FormHostVisitors\`.\`host_id\` = \`Host\`.\`id\` 
    WHERE ${hostName ? `\`Host\`.\`name\` LIKE '%${hostName}%'` : "1=1"} 
    ${hostPhone ? `AND \`Host\`.\`phone\` LIKE '%${hostPhone}%'` : ""}
    )`);

      // 如果已经有表单ID筛选条件，使用交集
      if (queryOptions.where.id) {
        queryOptions.where = {
          ...queryOptions.where,
          id: {
            [Op.and]: [
              { [Op.in]: queryOptions.where.id[Op.in] },
              { [Op.in]: hostSubquery },
            ],
          },
        };
      } else {
        queryOptions.where = {
          ...queryOptions.where,
          id: {
            [Op.in]: hostSubquery,
          },
        };
      }
    }

    // 添加分页参数
    queryOptions.limit = limit;
    queryOptions.offset = offset;

    // 获取总记录数和分页数据
    const { count, rows: visitorForms } =
      await db.VisitorsForms.findAndCountAll(queryOptions);

    // 计算总页数
    const totalPages = Math.ceil(count / limit);

    // 判断是否有下一页
    const hasNextPage = currentPage < totalPages;

    res.json({
      message: "获取访问表单列表成功",
      data: visitorForms,
      pagination: {
        total: count,
        currentPage,
        pageSize: limit,
        totalPages,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error("获取访问表单列表失败:", error);
    res.status(500).json({
      message: "获取访问表单列表失败",
      error: error.message,
    });
  }
});

// 更新访问表单的审批状态
router.post('/approve', [
  // 验证参数
  body('id')
    .isInt({ min: 1 })
    .withMessage('表单ID必须是正整数'),
  body('approved')
    .isBoolean()
    .withMessage('approved参数必须是布尔值')
], async (req, res) => {
  try {
    // 检查验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { id, approved } = req.body;

    // 查找指定的访问表单
    const visitorForm = await VisitorsForms.findByPk(id);
    
    if (!visitorForm) {
      return res.status(404).json({
        status: false,
        message: '未找到指定的访问表单'
      });
    }

    // 更新审批状态
    await visitorForm.update({ approved });

    // 重新获取更新后的数据
    const updatedForm = await VisitorsForms.findByPk(id, {
      include: [
        {
          model: db.Visitors,
          attributes: ['id', 'name', 'phone', 'id_card', 'company']
        },
        {
          model: db.Host,
          through: { attributes: [] },
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json({
      status: true,
      message: `访问表单审批状态已${approved ? '通过' : '拒绝'}`,
      data: updatedForm
    });

  } catch (error) {
    console.error('更新访问表单审批状态失败:', error);
    res.status(500).json({
      status: false,
      message: '更新访问表单审批状态失败',
      error: error.message
    });
  }
});

module.exports = router;
