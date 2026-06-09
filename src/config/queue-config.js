const amqplib = require("amqplib");

let connection, channel;

async function queueConnection() {
  try {
    connection = await amqplib.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue("noti-queue");
    // setInterval(() => {

    // }, 1000);
  } catch (error) {
    console.log(
      "errror during connection to rabbit MQ from booking service",
      error,
    );
  }
}

 function sendData(data) {
  try {
    // in generally the data comes as object so we have to stringify it 
    // we remove the await as channel.sendToQueue only return true or false 

     channel.sendToQueue("noti-queue", Buffer.from(JSON.stringify(data)));
  } catch (error) {
    console.log("error from when sending data to queue ", error);
  }
}

module.exports = {
  queueConnection,
  sendData
};
