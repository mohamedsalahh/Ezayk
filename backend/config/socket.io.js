const socketIo = require('socket.io');

const logger = require('./logger');
const { env } = require('./constants');

let io;

exports.connectToSocketIo = (server) => {
  io = socketIo(server, {
    cors: {
      origin: [env.FRONTEND_URL],
    },
  });

  logger.info('Connected to Socket.io');
};

exports.initSocketIoConnection = () => {
  io.on('connection', (socket) => {});
};

exports.getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
