// 这个程序会试图申请超大内存，故意撑爆程序
try {
  const hugeArray = [];
  while (true) {
    // 每次往数组里加1000万个数字
    for (let i = 0; i < 10_000_000; i++) {
      hugeArray.push(i);
    }
    console.log(`数组长度: ${hugeArray.length}`);
  }
} catch (e) {
  console.error("出错了！内存撑爆了:", e);
}
