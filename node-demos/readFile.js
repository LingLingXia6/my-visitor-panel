//读取一个文件内容并打印出来
const fs = require("fs");
const { constants } = fs;
// 会将整个文件从内存里读取，建议使用体积较小的文件
// fs.readFile("./1.text", "utf-8", (err, data) => {
//   if (err) {
//     return console.log(err);
//   }
//   console.log("async" + data.toString());
// });
let buf = Buffer.alloc(6); //分配6字节的buf缓冲对象，类似于内存里的小盒子
//需要先试用open打开，然后返回文件描述符(类似于座位号)
fs.open("./1.text", "r", (err, fd) => {
  if (err) throw err;
  let position = 0;
  //读取：“读取”= 把文件里的一部分数据，搬进程序内存（缓冲区）里来用，文件本身不变
  //   它不会改变文件本身内容，只是把一部分内容复制到你程序的内存中
  fs.read(fd, buf, 0, 3, 0, (err, bytesRead, buffer) => {
    console.log(
      "fd--1",
      fd,
      "buff",
      buffer.toString(),

      "bytesRead",
      bytesRead
    );
  });
  fs.read(fd, buf, 0, 3, 0, (err, bytesRead, buffer) => {
    console.log("fd--2", fd, "buff", buffer.toString(), "bytesRead", bytesRead);
  });
});
console.log("buf file", buf.toString());

// 2.向文件追加内容
const data = "hello --end";
fs.appendFile("./1.text", data, "utf-8", (err) => {});

// 3.写入一个新文件
// 写入文件内容（如果文件不存在会创建一个文件）
// 写入时会先清空文件
fs.writeFile("./2.text", "hello world2", (error) => {
  if (error) {
    throw err;
  }
});
fs.appendFile("./2.text", "appen content", (err) => {
  if (err) throw err;
  console.log('The "data to append" was appended to file!');
});
fs.writeFile("./1.text", "hello text1", (error) => {
  if (error) {
    throw err;
  }
});

// 4.判断文件在不在
fs.access("./1.text", constants.F_OK, (err) => {
  console.log(`${"./1.text"} ${err ? "does not exist" : "exists"}`);
});
// 5.创建文件夹
fs.mkdir("./product/router/user", { recursive: true }, (err) => {
  if (err) throw err;
});
