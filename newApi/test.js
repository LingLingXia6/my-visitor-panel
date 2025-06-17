const { generateQRCode } = require('./tools/qrcode');

// 使用示例
async function example() {
  try {
    const base64Image = await generateQRCode('https://baidu.com');
    console.log('Base64图片数据:', base64Image);
    // base64Image 格式类似: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  } catch (error) {
    console.error('生成失败:', error.message);
  }
}
example();