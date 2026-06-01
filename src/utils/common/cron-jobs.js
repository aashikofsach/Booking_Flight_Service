const cron = require("node-cron");

function schedule() {
  cron.schedule("*/5 * * * * *", () => {
    console.log("running a task every minute");
  });
}

module.exports = schedule;