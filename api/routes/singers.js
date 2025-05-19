const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const authMiddleware = require('../middlewares/auth');
const singers = db.singers;

// 针对获取/singers 和 /singers?name=""的模糊查询
router.get('/', async function (req, res, next) {
  try {
    const query = req.query;
    console.log('模糊查询参数', query);
    console.log('singers', singers);
    const condition = {
      order: [['id', 'DESC']],
    };
    // name的模糊查询
    if (query?.name) {
      console.log("name",query?.name);
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`,
        },
      };
    }
    const singersData = await singers.findAll(condition);

    res.json({
      status: true,
      message: '查询歌手',
      data: {
        singersData,
      },
    });
  } catch (err) {
    console.error('Error fetching singers:', err);
    res.status(500).json({
      message: '查询失败',
      error: err.message,
      stack: err.stack,
      status: false,
    });
  }
});

// 支持： /singers/id的查询
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    console.log('id', id, typeof id);
    const singersData = await singers.findByPk(id);
    console.log('data', singersData);
    res.json({
      status: true,
      message: '查询歌手成功',
      data: singersData,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: '查询歌手失败',
      errors: [err.message],
    });
  }
});

// post表单创建歌手  /singers
router.post('/',authMiddleware, async function (req, res, next) {
  try {
    const createSinger = await singers.create(req.body);
    res.status(201).json({
      status: true,
      message: '创建歌手成功',
      data: createSinger,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, message: '创建歌手失败', errors: [err.message] });
  }
});

// 删除歌手 /singers/:id
router.delete('/:id',authMiddleware, async function (req, res, next) {
  try {
    const { id } = req.params;
    const findSingerById = await singers.findByPk(id);
    if (findSingerById) {
      await findSingerById.destroy();
      res.json({
        status: true,
        message: '删除歌手成功。',
      });
    } else {
      res.status(404).json({
        status: false,
        message: '歌手没有找到',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: false,
      message: '删除歌手失败。',
      errors: [err.message],
    });
  }
});

// 更新歌手内容   /singers/:id
router.put('/:id', authMiddleware,async function (req, res, next) {
  try {
    const { id } = req.params;
    const findSingerById = await singers.findByPk(id);
    if (findSingerById) {
      await findSingerById.update(req.body);
      res.json({
        status: true,
        message: '更新歌手成功',
        data: findSingerById
      })
    } else {
      res.status(404).json({
        status: false,
        message: '歌手没有找到',
      })
    }
  } catch (err) {
    res.status(500).json({
      status: false,
      message: '歌手更新失败',
      errors: [err.message]
    })
  }
});

module.exports = router; 