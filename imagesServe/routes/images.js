const express = require('express');
const router = express.Router();
const fs=require('fs');
//专门用来处理上传的文件
const multer = require('multer');
const path = require('path');
// 处理图片逻辑（比如保存、查看、删除）
const imageController = require('../controllers/imageController');
//上传的文件存储路径
//__dirname表示当前文件所在目录的绝对路径,'..'表示上一级目录
const uploadDir = path.join(__dirname, '..', 'uploads');
// diskStorage 可以自定义文件的命名和存储路径。
// 将上传的文件存储在 uploads 目录下，并且使用当前时间戳作为文件名。
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
//创建一个multer实例
// 上传：POST /images（form-data，字段名 image）
const upload = multer({ storage });
// 上传单个文件路径
router.post('/', upload.single('image'), async (req, res) => {
    try{
        const image = req.file;
        console.log("image",image);
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }
    }catch(error){
        console.error(error);
    }
});


// 访问：GET /images/:filename

// 删除：DELETE /images/:filename

// 更新：PUT /images/:filename（form-data，字段名 image）
// router.get('/:filename', imageController.getImage);
// router.delete('/:filename', imageController.deleteImage);
// router.put('/:filename', upload.single('image'), imageController.updateImage);

module.exports = router;
