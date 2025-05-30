const express = require("express");
const router = express.Router();

const db = require("../models");
const { VisitorsForms, Visitors, FormHostVisitors, Host, User, Sequelize } = db;

// 获取所有Host及其关联的Visitors和VisitorsForms
router.get("/", async (req, res) => {
  try {
    const hosts = await Host.findAll({
      include: [
        {
          model: Visitors,
          through: { attributes: [] }, // 隐藏中间表字段
          attributes: ["id", "name", "phone", "id_card", "company"],
          distinct: true,
        },
        {
          model: VisitorsForms,
          through: { attributes: [] }, // 隐藏中间表字段
          attributes: ["id", "visit_reason", "visit_time", "location"],
          distinct: true,
        },
      ],
      distinct: true, // 确保主记录也不重复
    });

    res.json({
      message: "获取所有Host及其关联数据成功",
      data: hosts,
    });
  } catch (error) {
    console.error("获取Host列表失败:", error);
    res.status(500).json({
      message: "获取Host列表失败",
      error: error.message,
    });
  }
});
module.exports = router;
