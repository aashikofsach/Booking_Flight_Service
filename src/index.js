const {PORT} = require("./config");
const express = require('express');
const amqplib= require("amqplib");

const apiRoutes = require("./routes")
const {ServerConfig , logger, queue} = require("./config");
const CRONS = require("./utils/common/cron-jobs")

const app = express() ;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes)
// app.use("/bookingservice/api",apiRoutes)



app.listen(ServerConfig.PORT , async () => {
    console.log(`The server is running on the PORT: ${ServerConfig.PORT}`) ;
    CRONS();
   await queue.queueConnection();
   console.log("producer connected to queue ")
    // queueConnection();
   
})

