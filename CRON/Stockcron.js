const cron = require("node-cron");
const { saveDailyStock } = require("../controllers/productController");

cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running daily stock snapshot...");
    await saveDailyStock();
});