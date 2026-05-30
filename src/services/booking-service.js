const axios = require("axios");

const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");

const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

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
    // console.log(flight.data);
    // console.log(
    //   flight.data.totalSeats,
    //   data.noOfSeats,
    //   "in booking service ",
    //   flight.data.price,
    // );
    await transaction.commit();
    return true;
  } catch (error) {
    console.log("error catched in booking service catch");
    await transaction.rollback();

    throw error;
  }
}

module.exports = {
  createBooking,
};
