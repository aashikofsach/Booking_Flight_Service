const express = require("express");
const {infoController } = require("../../controllers/");
const BookingRouter = require("./booking-router");

const  router = express.Router() ;



router.get("/info", infoController.info )
router.use("/bookings",BookingRouter)

module.exports = router ;