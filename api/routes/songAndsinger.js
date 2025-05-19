const express = require('express');
const router = express.Router();
const db = require('../models');
const authMiddleware = require('../middlewares/auth');
const { Op } = require('sequelize');

// 获取指定歌手的所有歌曲
router.get('/:singerId/songs', async (req, res) => {
  try {
    const { singerId } = req.params;
    console.log('singerId',singerId);
    
    // 查找歌手
    const singer = await db.singers.findByPk(singerId);
    console.log('singers---',singer);
    if (!singer) {
      return res.status(404).json({ message: '未找到该歌手',status: false  });
    }
    
    // 1. 从关联表中查询该歌手的所有歌曲ID
    const songRelations = await db.songAndSinger.findAll({
      where: { singer_id: singerId },
      attributes: ['song_id'],
      raw: true // 添加此参数
    });
    
    // 提取歌曲ID数组
    const songIds = songRelations.map(relation => relation.song_id);
    console.log('songRelations',songRelations);
    if (songIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: '查询成功',
        data:{
          singer: {
            id: singer.id,
            name: singer.name,
            playlist_pricing: singer.playlist_pricing,
            worktime:singer.worktime
          },
          songs: []
        }
       
      });
    }
    
    // 2. 根据歌曲ID数组查询歌曲详情
    const songList = await db.songs.findAll({
      where: { 
        id: { [Op.in]: songIds } 
      },
      attributes: ['id', 'title', 'status'],
      raw: true // 添加这个参数
    });
    console.log('songList',songList);
    res.status(200).json({
      status: true,
      message: '查询成功',
      data:{
        singer: {
        id: singer.id,
        name: singer.name,
        playlist_pricing: singer.playlist_pricing,
        worktime:singer.worktime
      },
      songs: songList
    }
      
    });
  } catch (error) {
    console.error('获取歌手歌曲列表失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message ,status: false,stack: err.stack,});
  }
});

// 添加歌手和歌曲的关联关系
router.post('/associate',authMiddleware, async (req, res) => {
    try {
      const { singerId, songsId, price } = req.body;  // 添加price参数
      
      // 验证歌手是否存在
      const singer = await db.singers.findByPk(singerId);
      if (!singer) {
        return res.status(404).json({ 
          status: false,
          message: '未找到该歌手' 
        });
      }
      
      // 验证价格是否有效
      if (price !== undefined && price !== null) {
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          return res.status(400).json({
            status: false,
            message: '价格必须大于0'
          });
        }
        
        // 更新歌手的playlist_pricing字段
        await db.singers.update(
          { playlist_pricing: priceNum },
          { where: { id: singerId } }
        );
      }
      
      // 处理songsId为数组的情况
      if (Array.isArray(songsId)) {
        // 如果是数组，使用批量关联的逻辑
        // 验证所有歌曲是否存在
        const songs = await db.songs.findAll({
          where: {
            id: {
              [Op.in]: songsId
            }
          }
        });
        
        if (songs.length !== songsId.length) {
          return res.status(404).json({
            status: false,
            message: '部分歌曲不存在'
          });
        }
        
        // 查找已存在的关联
        const existingRelations = await db.songAndSinger.findAll({
          where: {
            singer_id: singerId,
            song_id: {
              [Op.in]: songsId
            }
          },
          attributes: ['song_id']
        });
        
        const existingSongIds = existingRelations.map(relation => relation.song_id);
        
        // 如果存在任何关联，直接返回错误
        if (existingSongIds.length > 0) {
          return res.status(400).json({
            status: false,
            message: '已存在关联，无法重复添加',
            data: {
              existingSongs: existingSongIds
            }
          });
        }
        
        // 过滤出需要新增的关联
        const newSongIds = songsId.filter(id => !existingSongIds.includes(id));
        
        // 批量创建关联 - 修改这里的字段名
        const relations = await Promise.all(
          newSongIds.map(id => 
            db.songAndSinger.create({
              singerId: singerId,  // 修改为 singerId
              songId: id           // 修改为 songId
            })
          )
        );
        
        return res.status(201).json({
          status: true,
          message: `成功关联歌手和${relations.length}首歌曲`,
          data: {
            added: relations.length,
            alreadyExisted: existingSongIds.length,
            total: songsId.length
          }
        });
      } else {
        // 原有的单个songsId处理逻辑
        // 验证歌曲是否存在
        const song = await db.songs.findByPk(songsId);
        if (!song) {
          return res.status(404).json({ 
            status: false,
            message: '未找到该歌曲' 
          });
        }
        
        // 检查关联是否已存在
        const existingRelation = await db.songAndSinger.findOne({
          where: {
            singer_id: singerId,
            song_id: songsId
          }
        });
        
        if (existingRelation) {
          return res.status(400).json({
            status: false,
            message: '该关联已存在'
          });
        }
        
        // 创建关联关系 - 修改这里的字段名
        const newRelation = await db.songAndSinger.create({
          singerId: singerId,  // 修改为 singerId
          songId: songsId      // 修改为 songId
        });
        
        return res.status(201).json({
          status: true,
          message: '成功关联歌手和歌曲',
          data: newRelation
        });
      }
      
    } catch (error) {
      console.error('关联歌手和歌曲失败:', error);
      res.status(500).json({ 
        status: false,
        message: '服务器错误', 
        error: error.message 
      });
    }
  });
  
  // 批量添加歌手和歌曲的关联关系
  router.post('/associate/batch', async (req, res) => {
    try {
      const { singerId, songIds } = req.body;
      
      // 验证歌手是否存在
      const singer = await db.singers.findByPk(singerId);
      if (!singer) {
        return res.status(404).json({ 
          status: false,
          message: '未找到该歌手' 
        });
      }
      
      // 验证所有歌曲是否存在
      const songs = await db.songs.findAll({
        where: {
          id: {
            [Op.in]: songIds
          }
        }
      });
      
      if (songs.length !== songIds.length) {
        return res.status(404).json({
          status: false,
          message: '部分歌曲不存在'
        });
      }
      
      // 查找已存在的关联
      const existingRelations = await db.songAndSinger.findAll({
        where: {
          singer_id: singerId,
          song_id: {
            [Op.in]: songIds
          }
        },
        attributes: ['song_id']
      });
      
      const existingSongIds = existingRelations.map(relation => relation.song_id);
      
      // 过滤出需要新增的关联
      const newSongIds = songIds.filter(id => !existingSongIds.includes(id));
      
      // 批量创建关联 - 修改这里的字段名
      const relations = await Promise.all(
        newSongIds.map(songId => 
          db.songAndSinger.create({
            singerId: singerId,  // 修改为 singerId
            songId: songId       // 修改为 songId
          })
        )
      );
      
      res.status(201).json({
        status: true,
        message: `成功关联歌手和${relations.length}首歌曲`,
        data: {
          added: relations.length,
          alreadyExisted: existingSongIds.length,
          total: songIds.length
        }
      });
      
    } catch (error) {
      console.error('批量关联歌手和歌曲失败:', error);
      res.status(500).json({ 
        status: false,
        message: '服务器错误', 
        error: error.message 
      });
    }
  });



// 删除歌手和歌曲的关联关系
router.delete('/disassociate',authMiddleware, async (req, res) => {
    try {
      const { singerId, songId } = req.body;
      
      // 查找关联关系
      const relation = await db.songAndSinger.findOne({
        where: {
          singer_id: singerId,
          song_id: songId
        }
      });
      
      if (!relation) {
        return res.status(404).json({
          status: false,
          message: '未找到该关联关系'
        });
      }
      
      // 删除关联关系
      await relation.destroy();
      
      res.status(200).json({
        status: true,
        message: '成功解除歌手和歌曲的关联'
      });
      
    } catch (error) {
      console.error('解除歌手和歌曲关联失败:', error);
      res.status(500).json({
        status: false,
        message: '服务器错误',
        error: error.message
      });
    }
  });
  
  // 批量删除歌手和歌曲的关联关系
  router.delete('/disassociate/batch', async (req, res) => {
    try {
      const { singerId, songIds } = req.body;
      
      // 查找并删除关联关系
      const deleteCount = await db.songAndSinger.destroy({
        where: {
          singer_id: singerId,
          song_id: {
            [Op.in]: songIds
          }
        }
      });
      
      if (deleteCount === 0) {
        return res.status(404).json({
          status: false,
          message: '未找到任何关联关系'
        });
      }
      
      res.status(200).json({
        status: true,
        message: `成功解除歌手和${deleteCount}首歌曲的关联`,
        data: {
          deleted: deleteCount,
          requested: songIds.length
        }
      });
      
    } catch (error) {
      console.error('批量解除歌手和歌曲关联失败:', error);
      res.status(500).json({
        status: false,
        message: '服务器错误',
        error: error.message
      });
    }
  });

module.exports = router;