'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 首先查询现有的歌手和歌曲ID
    const [singers] = await queryInterface.sequelize.query(
      'SELECT id FROM singers ORDER BY id'
    );
    
    const [songs] = await queryInterface.sequelize.query(
      'SELECT id FROM songs ORDER BY id'
    );
    
    // 只有当有足够的歌手和歌曲数据时才添加关联
    if (singers.length > 0 && songs.length > 0) {
      const singerSongData = [];
      
      // 为每个歌手分配一些歌曲（确保不超出实际存在的ID范围）
      for (let i = 0; i < Math.min(singers.length, 6); i++) {
        const singerId = singers[i].id;
        
        // 为每个歌手添加2-3首歌
        for (let j = 0; j < Math.min(3, songs.length); j++) {
          const songIndex = (i * 3 + j) % songs.length; // 确保不超出歌曲数组范围
          singerSongData.push({
            singer_id: singerId,
            song_id: songs[songIndex].id
          });
        }
      }
      
      // 只有当有数据要插入时才执行插入
      if (singerSongData.length > 0) {
        return queryInterface.bulkInsert('singer_song', singerSongData);
      }
    }
    
    return Promise.resolve(); // 如果没有数据可插入，返回已解决的Promise
  },

  async down(queryInterface, Sequelize) {
    // 删除添加的数据
    return queryInterface.bulkDelete('singer_song', null, {});
  }
};