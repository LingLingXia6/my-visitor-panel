// TODO 1.批量上传图片 2.批量删除图片 3.查看时加个安全认证?。
const express = require("express");
const router = express.Router();
const fs = require("fs");
//专门用来处理上传的文件
const multer = require("multer");
const createError = require("http-errors");
const { Image: ImageModal } = require("../models");
const path = require("path");

// __dirname表示当前文件所在目录的绝对路径,'..'表示上一级目录
const uploadDir = path.join(__dirname, "..", "uploads");

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
router.delete("/:filename", async (req, res, next) => {
  try {
    const filename = req?.params;
    if (!filename) {
      return res.status(400).json({ error: "No image provided" });
    }
    console.log("filename", filename);
    const filePath = path.join(uploadDir, req.params.filename);
    const info = await ImageModal?.destroy({
      where: { filename: req.params.filename },
    });
    // 删除失败，数据库里没有这个信息
    if (info == 0) {
      throw new Error("没有该图片信息");
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Image deleted" });
  } catch (err) {
    next(err);
  }
});
// 请求形式 http://localhost:3002/images/1748941404574-OIP.jpg
// 更新：put /images/:filename，参数：filename：需要更新的图片name，file：更新的图片，
// 操作会将旧的图片删除，同时替换为新的文件，name也会发生变化。
// 1.查找要更新的图片 2.删除老的图片 3.保存新的图片 4.数据库里老的图片路径替换为新的图片路径
router.put("/:filename", upload.single("image"), async (req, res, next) => {
  console.log("req.params", req.params);
  console.log("file", req.file);
  const fileName = req?.params?.filename;
  const oldFilePath = path.join(uploadDir, fileName);
  console.log(
    "oldFilePath",
    oldFilePath,
    "oldFilePath--isExit",
    fs.existsSync(oldFilePath)
  );
  try {
    if (!fs.existsSync(oldFilePath)) throw new Error("原来的图片不存在");
    if (!req.file) throw new Error("没有上传图片");
    // 删除旧的文件
    fs.unlinkSync(oldFilePath);
    const newFilePath = path.join(uploadDir, req.params.filename);
    fs.renameSync(req.file.path, newFilePath);

    await ImageModal.update(
      { filepath: newFilePath, upload_time: new Date() },
      { where: { filename: fileName } }
    );

    res.json({ message: "Image updated" });
  } catch (err) {
    console.log("catch--error", err);
    next(err);
  }
});
module.exports = router;
