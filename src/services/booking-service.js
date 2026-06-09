const axios = require("axios");

const { BookingRepository } = require("../repositories");
const { ServerConfig, queue } = require("../config");

const bookingrepository = new BookingRepository();
const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { FLIGHT_SERVICE } = require("../config/server-config");

const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

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
    // here once the booking created successfully then we can produce the the event to message queue
   
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
    if (bookingDetails.status == CANCELLED) {
      throw new AppError("The Booking Was Expired ", StatusCodes.NOT_FOUND);
    }
    console.log(
      "bookingDetails",
      bookingDetails,
      "sirf time",
      bookingDetails.createdAt,
      new Date(bookingDetails.createdAt),
      new Date(),
    );
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    // if time gap is greater than 5 minutes ( 300000 ms) then :
    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      // *very imp : yaha yeh sahi toh lag raha hai kyuki hamne cancel kar diya
      // par yeh rough cancelled hua phir hamne throw kiya error jisne is update ko roll back kiya
      // to yeh phir initiated ban jaega
      // to avoid this we create a cancelbooking functiin jo pehle
      // seat free karega , status cancel karega and the commit karega
      // PERFECT BEAUTY !
      // await bookingrepository.update(
      //   data.bookingId,
      //   { status: CANCELLED },
      //   transaction,
      // );
      throw new AppError("The Booking Was Expired ", StatusCodes.NOT_FOUND);
    }
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

    await bookingrepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction,
    );

    await transaction.commit();
      queue.sendData({
      text : `Booking Successfully done for the Booking Id ${data.bookingId}`,
      subject : "Flight booked",
      recepientEmail : "ritikkamboj4314@gmail.com"
    });

  } catch (error) {
    console.log("veer hanumana ati", error);
    console.log("error catched in booking service makepayment catch");
    await transaction.rollback();

    throw error;
  }
}

// in above function we cancel the booking,but if a booking is cancelled then we have to update the seats right ?
// for that we are writing the below function

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingrepository.get(bookingId, transaction);
    if (bookingDetails.status == CANCELLED) {
      await transaction.commit();
      return true;
    }

    await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: false,
      },
    );
    await bookingrepository.update(
      bookingId,
      { status: CANCELLED },
      transaction,
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}

async function cancelOldBooking() {
  try {
    const time = new Date(Date.now() - 1000 * 60 * 5);
    const response = await bookingrepository.cancelOldBooking(time);
    return response;
  } catch (error) {
    console.log("error of booking-service cancelOldBooking");
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  cancelOldBooking,
};
