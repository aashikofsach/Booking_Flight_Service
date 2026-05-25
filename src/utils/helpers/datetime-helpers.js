const { StatusCodes } = require("http-status-codes");
const AppError = require("../errors/app-error");

function validateTime(deparureTime, arrivalTime) {
  const d1 = new Date(deparureTime);
  const d2 = new Date(arrivalTime);

if(d1>=d2)
{
    throw new AppError("Arrival Time must be greater than departure time", StatusCodes.BAD_REQUEST, "TIME_VALIDATION_ERROR")  // ← Add type
}
}

module.exports ={
    validateTime
}