const { Op, QueryTypes } = require("sequelize");
// 设置开始时间，结束时间参数
const setTime = (startTime, endTime) => {
  let visitTime = {};
  if (startTime && endTime) {
    visitTime = { [Op.between]: [new Date(startTime), new Date(endTime)] };
  }
  if (startTime) {
    visitTime = {
      [Op.gte]: new Date(startTime),
    };
  }
  if (endTime) {
    visitTime = {
      [Op.lte]: new Date(endTime),
    };
  }
  return visitTime;
};
const setParamter = (query) => {
  const where = {};
  const { name, phone, startTime, endTime, page = 1, pageSize = 10 } = query;
  const currentPage = parseInt(page, 10);
  const limit = parseInt(pageSize, 10);
  const offset = (currentPage - 1) * limit;
  const visit_time = setTime(startTime, endTime);
  const whereCondition = {
    name: { [Op.like]: `%${name}%` },
    phone: { [Op.like]: `%${phone}%` },
  };
  if (Object.keys(visit_time).length !== 0) {
    whereCondition.visit_time = { ...visit_time };
  }
  ["name", "phone"]?.forEach((key) => {
    if (!!query[key]) {
      where[key] = whereCondition[key];
    }
  });
  if (whereCondition.visit_time) {
    where.visit_time = whereCondition.visit_time;
  }
  console.log("whereCondition", whereCondition);
  console.log("where", where);
  return where;
};

const setPagination = (parameters) => {
  const { page, pageSize, count } = parameters;
  // 将页码和每页数量转换为数字
  const currentPage = parseInt(page, 10);
  const limit = parseInt(pageSize, 10);
  // 计算总页数
  const totalPages = Math.ceil(count / limit);
  const hasNextPage = currentPage < totalPages;
  const pagination = {
    total: count,
    currentPage,
    pageSize: limit,
    totalPages,
    hasNextPage,
  };
  return pagination;
};
module.exports = {
  setParamter,
  setPagination,
};
