const createError = require('http-errors');

/**
 * 请求失败
 * @param res
 * @param error
 */
function success(res, message, data = {}, code = 200) {
  res.status(code).json({
    status: true,
    message,
    data
  });
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}


/**
 * 请求失败
 * @param res
 * @param error
 */

const multer = require('multer');

// ...

/**
 * 请求失败
 * @param res
 * @param error
 */
function failure(res, error) {
  // 默认响应为 500，服务器错误
  let statusCode = 500;
  let errors = '服务器错误';

  if (error.name === 'SequelizeValidationError') {  // Sequelize 验证数据错误
    statusCode = 400;
    errors = error.errors.map(e => e.message);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {  // Token 验证错误
    statusCode = 401;
    errors = '您提交的 token 错误或已过期。';
  } else if (error instanceof createError.HttpError) {  // http-errors 库创建的错误
    statusCode = error.status;
    errors = error.message;
  } else if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      errors = '文件大小超出限制。';
    } else {
      statusCode = 400;
      errors = error.message;
    }
  }

  res.status(statusCode).json({
    status: false,
    message: `请求失败: ${error.name}`,
    errors: Array.isArray(errors) ? errors : [errors]
  });
}


module.exports = {
  NotFoundError,
  success,
  failure
}