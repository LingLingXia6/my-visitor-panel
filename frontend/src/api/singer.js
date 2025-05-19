import request from './request';

export const getSingersInfo = () => {
  return request({
    url: '/singers',
    method: 'get',
  });
};

// 上传图片
export const upLoadImage = (data) => {
  return request({
    url: '/uploads/aliyun',
    method: 'post',
    data  // 使用 data 而不是 params，这样参数会放在请求体中
  });
};

// 添加歌手
export const addSinger = (data) => {
  return request({
    url: '/singers',
    method: 'post',
    data
  });
};

// 删除歌手
export const deleteSinger = (id) => {
  return request({
    url: `/singers/${id}`,
    method: 'delete'
  });
};

// 添加更新歌手内容的 API 请求
export const updateSinger = (id, data) => {
  return request({
    url: `/singers/${id}`,
    method: 'put',
    data
  });
};