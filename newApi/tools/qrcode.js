const QRCode = require('qrcode');

/**
 * 生成二维码图片（base64编码）
 * @param {string} url - 要生成二维码的链接
 * @returns {Promise<string>} 返回base64编码的图片数据
 */
async function generateQRCode(url) {
  try {
    // 生成二维码并返回base64编码
    const base64Data = await QRCode.toDataURL(url, {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    return base64Data;
  } catch (error) {
    throw new Error(`生成二维码失败: ${error.message}`);
  }
}

module.exports = {
  generateQRCode
};