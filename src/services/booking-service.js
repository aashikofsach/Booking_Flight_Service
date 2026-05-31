const axios = require("axios");

const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");

const bookingrepository = new BookingRepository() ;
const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { FLIGHT_SERVICE } = require("../config/server-config");

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

    const booking = await bookingrepository.createBooking(bookingPayload, transaction);
    // now here booking done and so as we have to update the avalaible seats in flight 
    // for that we have to make request to flight service 
    await axios.patch(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
      seats : data.noOfSeats
    })


    await transaction.commit();
    return booking;
  } catch (error) {
    console.log("error catched in booking service catch");
    await transaction.rollback();

    throw error;
  }
}

module.exports = {
  createBooking,
};
