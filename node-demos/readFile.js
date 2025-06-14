//读取一个文件内容并打印出来
const fs = require("fs");
const path = require("path");
// const { constants } = fs;
// // 会将整个文件从内存里读取，建议使用体积较小的文件
// // fs.readFile("./1.text", "utf-8", (err, data) => {
// //   if (err) {
// //     return console.log(err);
// //   }
// //   console.log("async" + data.toString());
// // });
// let buf = Buffer.alloc(6); //分配6字节的buf缓冲对象，类似于内存里的小盒子
// //需要先试用open打开，然后返回文件描述符(类似于座位号)
// fs.open("./1.text", "r", (err, fd) => {
//   if (err) throw err;
//   let position = 0;
//   //读取：“读取”= 把文件里的一部分数据，搬进程序内存（缓冲区）里来用，文件本身不变
//   //   它不会改变文件本身内容，只是把一部分内容复制到你程序的内存中
//   fs.read(fd, buf, 0, 3, 0, (err, bytesRead, buffer) => {
//     console.log(
//       "fd--1",
//       fd,
//       "buff",
//       buffer.toString(),

//       "bytesRead",
//       bytesRead
//     );
//   });
//   fs.read(fd, buf, 0, 3, 0, (err, bytesRead, buffer) => {
//     console.log("fd--2", fd, "buff", buffer.toString(), "bytesRead", bytesRead);
//   });
// });
// console.log("buf file", buf.toString());

// // 2.向文件追加内容
// const data = "hello --end";
// fs.appendFile("./1.text", data, "utf-8", (err) => {});

// // 3.写入一个新文件
// // 写入文件内容（如果文件不存在会创建一个文件）
// // 写入时会先清空文件
// fs.writeFile("./2.text", "hello world2", (error) => {
//   if (error) {
//     throw err;
//   }
// });
// fs.appendFile("./2.text", "appen content", (err) => {
//   if (err) throw err;
//   console.log('The "data to append" was appended to file!');
// });
// fs.writeFile("./1.text", "hello text1", (error) => {
//   if (error) {
//     throw err;
//   }
// });

// // 4.判断文件在不在
// fs.access("./1.text", constants.F_OK, (err) => {
//   console.log(`${"./1.text"} ${err ? "does not exist" : "exists"}`);
// });
// // 5.创建文件夹
// fs.mkdir("./product/router/user", { recursive: true }, (err) => {
//   if (err) throw err;
// });
// // 创建新文件，writeFile//appendFile
// for (let i = 0; i < 5; i++) {
//   fs.writeFile(`${i}.txt`, "", (err) => {
//     if (err) throw err;
//     console.log(`${i}.txt 文件创建成功`);
//   });
// }

// for (let i = 5; i < 7; i++) {
//   fs.appendFile(`${i}.txt`, "", (err) => {
//     if (err) throw err;
//     console.log(`${i}.txt 创建成功`);
//   });
// }

// // 列出当前目录下所有文件
// fs.readdir(path.join(__dirname), (err, file) => {
//   if (err) {
//     throw err;
//   }
//   console.log("_file", file, "file length", file.length);
//   file.forEach((fileItem, index) => {
//     //  异步的判断
//     fs.stat(fileItem, (err, stats) => {
//       if (stats.isFile()) {
//         console.log(`${fileItem} is a file`);
//       }
//     });
//   });
// });

// 同步判断是文件还是目录
fs.readdir(path.join(__dirname), (error, files) => {
  if (error) {
    throw error;
  }
  files.forEach((_file, index) => {
    let filePath = path.join(__dirname, _file);
    if (fs.lstatSync(filePath).isFile()) {
      console.log(`${_file} is file`);
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.readdir(_file, (error, subFiles) => {
        console.log(`${subFiles} 信息`, subFiles);
        // subFiles.forEach((_sub, index) => {
        //   if (fs.lstatSync(_sub).isDirectory()) {
        //     fs.readdir(_sub, (err, deepFiles) => {
        //       console.log("deepFileInfo", deepFiles);
        //     });
        //   }
        // });
        console.log("subFiles_length", subFiles?.length);
        subFiles.forEach((_info) => {
          let deepPath = path.join(filePath, _info);
          console.log(1111, fs.lstatSync(deepPath).isFile());
        });
      });
    }
  });
});
