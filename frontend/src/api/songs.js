import request from './request';

export const getSongs = () => {
  return request({
    url: '/songs',
    method: 'get',
  });
};

// 添加增加歌曲的 API 请求
export const addSong = (songData) => {
  return request({
    url: '/songs',
    method: 'post',
    data: songData,
  });
};

// 添加删除歌曲的 API 请求
export const deleteSong = (id) => {
  return request({
    url: `/songs/${id}`,
    method: 'delete',
  });
}

// 添加修改歌曲的 API 请求
export const updateSong = (id, songData) => {
  return request({
    url: `/songs/${id}`,
    method: 'put',
    data: songData,
  });
};

// 上