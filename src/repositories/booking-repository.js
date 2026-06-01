const { Op } = require("sequelize");
const { Booking } = require("../models");

const CrudRepository = require("./crud-repository");

const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction: transaction });
    return response;
  }

  async get(data, transaction) {
    const response = await this.model.findByPk(data, {
      transaction: transaction,
    });
    if (!response)
      throw new AppError("Data not present in the DB", StatusCodes.NOT_FOUND);
    return response;
  }

  async update(id, data, transaction) {
    // here data variable is object (having key and value pair )

    const response = await this.model.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction },
    );
    if (response[0] == 0)
      throw new AppError(
        "Entity not present which you wanna update",
        StatusCodes.NOT_FOUND,
      );
    return response;
  }

  async cancelOldBooking(timestamp) {
    const response = await this.model.update({status : CANCELLED},{
      where: {
        [Op.and] : [{
        createdAt: {
          [Op.lt]: timestamp,
        },
      },
      {
        status : {
          [Op.ne] : BOOKED
        }
      },
       {
        status : {
          [Op.ne] : CANCELLED
        }
      }
    ]
      }
    });

    return response ;
  }
}

module.exports = {
  BookingRepository,
};
