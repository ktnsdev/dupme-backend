function SocketListener(server) {
    const { Server } = require("socket.io");
    const { logger } = require("../configs/config");
    const io = new Server(server);

    logger.info("A socket server has been started...");

    io.on("connection", (socket) => {
        logger.info("A new user has connected");

        socket.on("message", (message) => {
            logger.info("A user sent a message: " + message);
            socket.broadcast.emit("message", message);
        });
    });
}

module.exports = SocketListener;
