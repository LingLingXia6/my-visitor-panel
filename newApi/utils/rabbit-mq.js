// 创建一个连接
const amqp = require("amqplib");

const sendMail = require("./mail");

let connection;
let channel;

const queue = "host_mail_queue";
const connectToRabbitMQ = async () => {
  if (connection && channel) return;
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    // 创建or连上队列
    // durable：true 持久化
    await channel.assertQueue(queue, { durable: true });
  } catch (error) {
    console.error("RabbitMQ 连接失败：", error);
  }
};

// 创建host_send_mail的生产者
const hostMailProducer = async (msg) => {
  try {
    await connectToRabbitMQ();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
  } catch (error) {
    console.error("邮件队列生产者错误", error);
  }
};

const hostMailConsumer = async () => {
  try {
    await connectToRabbitMQ();
    // 从队列去除消息
    // noAck: true 则服务器端不会期望收到 ACK，也就是说，消息在被发送后会立即出列。
    channel.consume(
      queue,
      async (msg) => {
        const message = JSON.parse(msg.content.toString());
        await sendMail(message.to, message.subjectl, message.html);
      },

      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error("邮件队列消费者错误：", error);
  }
};
module.exports = {
  hostMailProducer,
  hostMailConsumer,
};
