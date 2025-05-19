const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const authMiddleware = require('../middlewares/auth');
const songs = db.songs;

// 针对获取/songs 和 /songs?title=“”的模糊查询
router.get('/', async function (req, res, next) {
  try {
    const query = req.query;
    console.log('模糊查询参数', query);
    console.log('songs', songs);
    const condition = {
      attributes: ['id', 'title', 'status','description'],
      order: [['id', 'DESC']],
    };
    // title的模糊查询
    if (query?.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }
    const songsData = await songs.findAll(condition);

    res.json({
      status: true,
      message: '查询歌曲',
      data: {
        songsData,
      },
    });
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({
      message: '查询失败',
      error: err.message,
      stack: err.stack,
      status: false,
    });
  }
});
// 支持： /songs/id的查询
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    console.log('111id', id, typeof id);
    const songsData = await songs.findByPk(id);
    // 获取文章 ID
    console.log('data', songsData);
    res.json({
      status: true,
      message: '查询歌曲成功',
      data: songsData,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: '查询歌曲失败',
      errors: [err.message],
    });
  }
});

// post表单创建歌曲  /songs
router.post('/', authMiddleware,async function (req, res, next) {
  try {
    const createSong = await songs.create(req.body);
    res.status(201).json({
      status: true,
      message: '创建歌曲成功',
      data: createSong,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, message: '创建歌曲失败', errors: [err.message] });
  }
});

// 删除歌曲 /songs/:id
router.delete('/:id',authMiddleware, async function (req, res, next) {
  // 先查询，如果有数据则删除，没有数据404,如果删除失败500
  try {
    const { id } = req.params;
    // 查询歌曲

    const findSongById = await songs.findByPk(id);
    if (findSongById) {
      // delete song
      await findSongById.destroy();
      res.json({
        status: true,
        message: '删除歌曲成功。',
      });
    } else {
      res.status(404).json({
        status: false,
        message: '歌曲没有找到',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: false,
      message: '删除歌曲失败。',
      errors: [err.message],
    });
  }
});

// 更新歌曲内容   /songs/:id
router.put('/:id',authMiddleware, async function (req, res, next) {
  try {
    const { id } = req.params;
    const findSongById = await songs.findByPk(id);
    if (findSongById) {
      await findSongById.update(req.body);
      res.json({
        status: true,
        message: '更新歌曲成功',
        data:findSongById
      })
    } else {
      res.status(404).json({
        status: false,
        message: '歌曲没有找到',
      })
    }

  } catch (err) {
    res.status(500).json({
      status: false,
      message: '歌曲更新失败',
      errors: [err.message]
    })
  }
  


})

module.exports = router;
