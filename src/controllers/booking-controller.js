const { BookingService } = require("../services/");
const {StatusCodes} = require("http-status-codes")

const { ErrorResponse, SuccessResponse } = require("../utils/common");
const booking = require("../models/booking");

async function createBooking(req, res) {
  // console.log("yaha tak")

  try {
    // console.log("yaha tak")

    console.log("Body is", req.body);
    const resposne = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId : req.body.userId,
      noOfSeats : req.body.noOfSeats

      // capacity: req.body.capacity,
    });
    SuccessResponse.data = resposne;

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}



async function makePayment(req, res) {
  // console.log("yaha tak")

  try {
    // console.log("yaha tak")

    console.log("Body is", req.body);
    const resposne = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      totalCost : req.body.totalCost,
      userId : req.body.userId

      // capacity: req.body.capacity,
    });
    SuccessResponse.data = resposne;

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log("jaadu", error)
    ErrorResponse.error = error;
    console.log("veer hanumana")
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createBooking,
  makePayment
};
