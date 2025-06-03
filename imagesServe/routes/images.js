const express = require("express");
const router = express.Router();
const createError = require("http-errors");
// const db = require('../models');
// const ImageModal = db.Image;
const { Image: ImageModal } = require("../models");
const path = require("path");
// __dirname表示当前文件所在目录的绝对路径,'..'表示上一级目录
const uploadDir = path.join(__dirname, "..", "uploads");
console.log("uploadDir", path.join(__dirname, ".."));
const fs = require("fs");
//专门用来处理上传的文件
const multer = require("multer");

// 处理图片逻辑（比如保存、查看、删除）
const imageController = require("../controllers/imageController");
//上传的文件存储路径
//__dirname表示当前文件所在目录的绝对路径,'..'表示上一级目录

// diskStorage 可以自定义文件的命名和存储路径。
// 将上传的文件存储在 uploads 目录下，并且使用当前时间戳作为文件名。
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
//创建一个multer实例
// 上传：POST /images（form-data，字段名 image）
const upload = multer({ storage });
// 上传单个文件路径
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const image = req.file;
    console.log("image", image);
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }
    const imageData = await ImageModal.create({
      filename: req.file.filename,
      filepath: req.file.path,
      upload_time: new Date(),
    });
    // 上传成功后返回图片信息
    res.status(200).json({
      message: "Upload successful",
      filename: imageData.filename,
      url: `${req.protocol}://${req.get("host")}/images/${imageData.filename}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 访问：GET /images/:filename
router.get("/:filename", async (req, res, next) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next(createError(404, "Image not found"));
  }
});
// 删除：DELETE /images/:filename

router.delete(":/filename", async (req, res, next) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);
    const info = await ImageModal?.destroy({
      where: { filename: req.params.filename },
    });
    console.log("info", info);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Image deleted" });
  } catch (err) {
    next(err);
  }
});

// router.get('/:filename', imageController.getImage);
// router.delete('/:filename', imageController.deleteImage);
// router.put('/:filename', upload.single('image'), imageController.updateImage);

module.exports = router;
