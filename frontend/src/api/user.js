import request from './request';

export const login = (data) => {
  return request({
    url: '/users/login',
    method: 'post',
    data,
  });
};

export const getUserInfo = () => {
  return request({
    url: '/users/verify-token',
    method: 'get',
  });
};


export const updatePassword = (data) => {
  return request({
    url: '/users/change-password',
    method: 'put',
    data
  });
};