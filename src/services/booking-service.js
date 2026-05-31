const axios = require("axios");

const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");

const bookingrepository = new BookingRepository();
const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { FLIGHT_SERVICE } = require("../config/server-config");

const { Enums } = require("../utils/common");
const { BOOKED } = Enums.BOOKING_STATUS;

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,
    );
    const flightData = flight.data.data;

    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError(
        "Required Number of Seats not availaible",
        StatusCodes.BAD_REQUEST,
      );
    }
    const totalBillAmount = data.noOfSeats * flightData.price;
    console.log(totalBillAmount, "");
    const bookingPayload = { ...data, totalCost: totalBillAmount };
    // console.log(flight.data);
    // console.log(
    //   flight.data.totalSeats,
    //   data.noOfSeats,
    //   "in booking service ",
    //   flight.data.price,
    // );

    const booking = await bookingrepository.createBooking(
      bookingPayload,
      transaction,
    );
    // now here booking done and so as we have to update the avalaible seats in flight
    // for that we have to make request to flight service
    await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      },
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    console.log("error catched in booking service createBooking catch");
    await transaction.rollback();

    throw error;
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingrepository.get(
      data.bookingId,
      transaction,
    );
    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError("Payment amount not matching ", StatusCodes.NOT_FOUND);
    }
    if (bookingDetails.userId != data.userId) {
      throw new AppError(
        "User corresponding to booking not mataching  ",
        StatusCodes.NOT_FOUND,
      );
    }
    // if payment is successfull

    const response = await bookingrepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction,
    );

    await transaction.commit();
  } catch (error) {
    console.log("veer hanumana ati", error)
    console.log("error catched in booking service makepayment catch");
    await transaction.rollback();

    throw error;
  }
}

module.exports = {
  createBooking,
  makePayment
};
