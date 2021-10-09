function SocketListener(server, app) {
    const { logger } = require("../configs/config");
    const { Server } = require("socket.io");
    const io = new Server(server);

    app.set("socket", io);

    io.on("connection", (socket) => {
        logger.info("A new user has connected");

        socket.on("message", (message) => {
            logger.info("A user sent a message: " + message);
            socket.broadcast.emit("message", message);
        });

        socket.on("disconnect", (message) => {
            logger.info("A user has disconnected");
        });
    });

    logger.info("A socket server has been started...");
}

module.exports = SocketListener;
