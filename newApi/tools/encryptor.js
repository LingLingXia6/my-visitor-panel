const crypto = require("crypto");
// const Encryptor = require("./tools/encryptor");

// const encryptor = new Encryptor(); // 默认前缀长度 2

// const token = encryptor.generateToken(12345);
// console.log("生成的 Token:", token);

// const visitorId = encryptor.parseToken(token);
// console.log("解析出的 ID:", visitorId);

class Encryptor {
  #charset;
  constructor() {
    this.#charset =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  #encodeId(id) {
    let num = BigInt(id);
    let str = "";
    while (num > 0n) {
      str = this.#charset[Number(num % 62n)] + str;
      num = num / 62n;
    }
    return str || "0";
  }
  #decodeId(str) {
    let num = 0n;
    for (let char of str) {
      num = num * 62n + BigInt(this.#charset?.indexOf(char));
    }
    return Number(num);
  }
  generateToken(visitorId) {
    const prefix = crypto.randomBytes(2).toString("base64url").slice(0, 2); // 随机2位
    const encodedId = this.#encodeId(visitorId);
    console.log("decode ", prefix + encodedId);
    return prefix + encodedId;
  }
  parseToken(token) {
    const encodedId = token.slice(2); // 去掉前缀
    console.log("encodedId", encodedId);
    return this.#decodeId(encodedId); // 返回 visitor.id
  }
}

module.exports = Encryptor;
