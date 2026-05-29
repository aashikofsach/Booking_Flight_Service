const axios = require("axios");

const { BookingRepository } = require("../repositories");

const db = require("../models");

async function createBooking(data) {
  try {
    const result = db.sequelize.transaction(async function bookingImpl(t) {
      const flight = await axios.get(
        `http://localhost:3000/api/v1/flights/${data.flightId}`,
      );
      console.log(flight.data);
      return true;
    });
  } catch (error) {
    // console.log("yaha tak")
    // throw error
  }
}

module.exports = {
  createBooking
};
