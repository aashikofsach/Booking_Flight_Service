const {PORT} = require("./config");
const express = require('express');
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
   
})

