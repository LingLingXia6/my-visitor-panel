const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const singers = db.singers;
const songs = db.songs;
const songAndSinger = db.songAndSinger; // 添加关联表引用

router.get('/', async function(req, res) {
    try {
        // GET /search?name=xxx
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({
                status: false,
                message: '请提供搜索关键词'
            });
        }
        
        // 创建查询歌手的 Promise
        const findSinger = new Promise((resolve, reject) => {
            singers.findAll({
                where: {
                    name: {
                        [Op.like]: `%${name}%`
                    }
                },
                order: [['id', 'DESC']]
            })
            .then(result => resolve(result))
            .catch(error => reject(error));
        });
        
        // 创建查询歌曲的 Promise，并关联歌手信息
        const findSong = new Promise((resolve, reject) => {
            songs.findAll({
                where: {
                    title: {
                        [Op.like]: `%${name}%`
                    }
                },
                attributes: ['id', 'title', 'status', 'description'],
                order: [['id', 'DESC']]
            })
            .then(async (songsResult) => {
                // 获取所有歌曲ID
                const songIds = songsResult.map(song => song.id);
                console.log("songIds",songIds)
                // 如果没有找到歌曲，直接返回空数组
                if (songIds.length === 0) {
                    return resolve([]);
                }
                
                // 查询歌曲与歌手的关联关系
                const songSingerRelations = await songAndSinger.findAll({
                    where: {
                        songId: {  // 修改为 songId 而不是 song_id
                            [Op.in]: songIds
                        }
                    }
                });
                console.log("songSingerRelations", songSingerRelations);
                // 构建包含歌手ID的歌曲信息，每个歌手ID创建一条记录
                const songsWithSingerIds = [];
                songsResult.forEach(song => {
                    // 查找当前歌曲关联的所有歌手ID
                    const relatedSingerIds = songSingerRelations
                        .filter(relation => relation.songId === song.id)
                        .map(relation => relation.singerId);
                    
                    if (relatedSingerIds.length === 0) {
                        // 如果没有关联歌手，添加一条记录，singer_id 为 null
                        songsWithSingerIds.push({
                            id: song.id,
                            title: song.title,
                            status: song.status,
                            description: song.description,
                            singer_id: null
                        });
                    } else {
                        // 为每个歌手ID创建一条记录
                        relatedSingerIds.forEach(singerId => {
                            songsWithSingerIds.push({
                                id: song.id,
                                title: song.title,
                                status: song.status,
                                description: song.description,
                                singer_id: singerId
                            });
                        });
                    }
                });
                
                resolve(songsWithSingerIds);
            })
            .catch(error => reject(error));
        });
        
        // 使用 Promise.all 并行执行两个查询
        const [singersData, songsData] = await Promise.all([findSinger, findSong]);
        
        // 返回结果
        res.json({
            status: true,
            message: '搜索成功',
            data: {
                singers: singersData,
                songs: songsData
            }
        });
        
    } catch (err) {
        console.error('搜索失败:', err);
        res.status(500).json({
            status: false,
            message: '搜索失败',
            error: err.message
        });
    }
});

module.exports = router;