const axios = require("axios");

const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");

const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

async function createBooking(data) {
  try {
    const result =  await db.sequelize.transaction(async function bookingImpl(t) {
      const flight = await axios.get(
        `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,
      );
      const flightData = flight.data.data;

      if (data.noOfSeats <flightData.totalSeats) {
        throw new AppError("Required Number of Seats not availaible",StatusCodes.BAD_REQUEST);
      }
      // console.log(flight.data);
      // console.log(
      //   flight.data.totalSeats,
      //   data.noOfSeats,
      //   "in booking service ",
      //   flight.data.price,
      // );
      return true;
    });
    console.log(result);
    return result ;
  } catch (error) {
    console.log("error catched in booking service catch");
    throw error;
  }
}

module.exports = {
  createBooking,
};
