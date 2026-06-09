const {PORT} = require("./config");
const express = require('express');
const amqplib= require("amqplib");

async function queueConnection()
{
    try {
        const connection = await amqplib.connect("amqp://localhost") ;
        const channel = await connection.createChannel() ;

        await channel.assertQueue("noti-queue");
        // setInterval(() => {
                     await channel.sendToQueue("noti-queue", Buffer.from("Something to do naya lifafa jai harayna"))

            
        // }, 1000);
        
    } catch (error) {
        console.log('errror during connection to rabbit MQ from booking service', error);
        
    }
}
const apiRoutes = require("./routes")
const {ServerConfig , logger} = require("./config");
const CRONS = require("./utils/common/cron-jobs")

const app = express() ;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes)
// app.use("/bookingservice/api",apiRoutes)



app.listen(ServerConfig.PORT , () => {
    console.log(`The server is running on the PORT: ${ServerConfig.PORT}`) ;
    CRONS();
    queueConnection();
   
})

