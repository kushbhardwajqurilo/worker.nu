require("dotenv").config({});
const http = require("http");
const app = require("./app");
const connectDB = require("./src/confing/DB");
// require("./src/confing/crons/projectReminder"); uncommnet in pproduction
const { initSocket } = require("./socket/scoket"); // ✅ ADD THIS

const PORT = process.env.PORT || 8002;

const server = http.createServer(app);

// ✅ INIT SOCKET HERE (server ke sath)
initSocket(server);

connectDB()
  .then(() => {
    console.log("Ohhoo db connected");

    server.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
