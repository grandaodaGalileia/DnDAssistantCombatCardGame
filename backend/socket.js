// backend/socket.js
let io;

function init(server) {
  const { Server, Socket } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  return io;
}

function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io não foi inicializado! Chame init(server) primeiro."
    );
  }
  return io;
}

module.exports = { init, getIO };
