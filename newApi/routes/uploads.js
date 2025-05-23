const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { success, failure } = require('../utils/response');
const {  singleFileUpload } = require('../utils/aliyun');
const { BadRequest } = require('http-errors')
/**
 * 阿里云 OSS 客户端上传
 * POST /uploads/aliyun
 */
router.post('/aliyun',authMiddleware, function (req, res) {
  try {
    singleFileUpload(req, res, function (error) {
      if (error) {
        return failure(res, error);
      }

      if (!req.file) {
        return failure(res, new BadRequest('请选择要上传的文件。'));
      }

      success(res, '上传成功。', { file: req.file });
    });
  } catch (error) {
    failure(res, error);
  }
})

module.exports = router;
