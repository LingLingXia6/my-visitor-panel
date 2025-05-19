const express = require('express');
const router = express.Router();

const {Articles} = require("../models");

router.get('/', async function (req, res, next) {
  try {
    
    const articles = await Articles.findAll({
      order: [['id', 'DESC']],
    });
  
    res.json({
      status: true, message: "查询文章", data: {
      articles
    }})
  } catch (err) {
    res.status(500).json({message:"查询失败",error:err.message,status: false,})
    //res.send({message:"查询失败",error:err.message,status: false,});
  }
});


module.exports = router;