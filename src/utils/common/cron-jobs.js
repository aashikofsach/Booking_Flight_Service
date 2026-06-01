const cron = require("node-cron");

const {BookingService} = require("../../services/")

function schedule() {
  //   cron.schedule("*/5 * * * * *", () => {
  //     console.log("running a task every minute");
  //   });

//   console.log("value of Bookinng Service", BookingService)
  cron.schedule("*/30 * * * *", async() => {
    //     console.log("running a task every minute");
    //   });

   const response = await BookingService.cancelOldBooking() ;
   console.log(response);
   
  });
}

module.exports = schedule;
