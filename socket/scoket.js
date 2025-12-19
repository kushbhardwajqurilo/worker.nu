let io;
const initSocket = (server) => {
  io = require("socket.io")(server);

  // connect socket
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId.toString());
    });
    socket.on("disconnect", () => {
      console.log("socket disconnect", socket.id);
    });
  });
  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("socket.io not initalize");
  }
  return io;
};

module.exports = { initSocket, getIo };
