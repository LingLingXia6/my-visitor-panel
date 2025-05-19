import request from './request';

export const getSingerSongs = (singerId) => {
  return request({
    url: `/songandsinger/${singerId}/songs`,
    method: 'get',
  });
};

// 添加解除关联的API函数
export const disassociateSingerSong = (singerId, songId) => {
  return request({
    url: '/songandsinger/disassociate',
    method: 'delete',
    data: { singerId, songId }
  });
};

// 添加关联歌手和歌曲的API函数
export const associateSingerSong = (singerId, songsId,price) => {
  return request({
    url: '/songandsinger/associate',
    method: 'post',
    data: { singerId, songsId,price }
  });
};

