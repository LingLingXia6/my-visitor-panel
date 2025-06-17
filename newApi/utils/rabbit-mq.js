// 创建一个连接
const amqp = require("amqplib");
const {generateQRCode} = require('../tools/qrcode');
const sendMail = require("./mail");
const {visitorEmailTemplate}=require('../utils/emailTemple');
const Encryptor = require("../tools/encryptor");


let connection;
let channel;


const HOST_MAIL_QUEUE = "host_mail_queue";
const VISITOR_MAIL_QUEUE = "visitor_mail_queue"; // 新增的访客邮件队列
const connectToRabbitMQ = async () => {
  if (connection && channel) return;
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    // 创建or连上队列
    // durable：true 持久化
    await channel.assertQueue(HOST_MAIL_QUEUE, { durable: true });
    console.log(`队列${HOST_MAIL_QUEUE}已经声明`);
    await channel.assertQueue(VISITOR_MAIL_QUEUE, { durable: true });
   console.log(`队列${VISITOR_MAIL_QUEUE}已经声明`);
  } catch (error) {
    console.error("RabbitMQ 连接失败：", error);
   
  }
};

// 创建host_send_mail的生产者
const hostMailProducer = async (msg) => {
  try {
    await connectToRabbitMQ();
    channel.sendToQueue(HOST_MAIL_QUEUE, Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
  } catch (error) {
    console.error("host_send_mail邮件队列生产者错误", error);
  }
};

const hostMailConsumer = async () => {
  try {
    await connectToRabbitMQ();
    // 从队列去除消息
    // noAck: true 则服务器端不会期望收到 ACK，也就是说，消息在被发送后会立即出列。
    channel.consume(
      HOST_MAIL_QUEUE,
      async (msg) => {
        const message = JSON.parse(msg.content.toString());
        await sendMail(message.to, message.subject, message.html);
      },

      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error("邮件队列消费者错误：", error);
  }
};

const visitorMailProducer = async (msg) => {
  try {
    await connectToRabbitMQ();
    channel.sendToQueue(VISITOR_MAIL_QUEUE, Buffer.from(JSON.stringify(msg)),{
      persistent: true,
    });
  } catch (error) {
    console.error("visitor_mail_queue邮件队列生产者错误", error);
  }
}

const visitorMailConsumer = async () => {
  try {
    await connectToRabbitMQ();
    channel.consume(
      VISITOR_MAIL_QUEUE,
      async (msg) => {
        if (msg === null) {
          console.log('visitor 邮件消费者收到空消息(队列可能已经关闭)');
          return;
        }
        const message = JSON.parse(msg.content.toString());
        const qrlink=message?.link;
        const base64Image = await generateQRCode(qrlink);
        const encryptor = new Encryptor(); // 默认前缀长度 2

        const token = encryptor.generateToken(message?.formId);
        console.log("生成的 Token:", token);
        
        // 将base64数据转换为Buffer用于附件
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
        const qrCodeBuffer = Buffer.from(base64Data, 'base64');
        
        const emailHtmlWithQR = visitorEmailTemplate(message?.name,token,message?.approved,message?.link);
          
        const attachments = [{
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode' // 用于在HTML中引用
        }];
        
       
        await sendMail(message?.to, message?.subject, emailHtmlWithQR, attachments);
      },

      {
        noAck: true,
      }
    );
  } catch (error) {
    
  }
}

module.exports = {
  hostMailProducer,
  hostMailConsumer,
  visitorMailProducer,
  visitorMailConsumer
};
