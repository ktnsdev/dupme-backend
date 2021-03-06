const { receiveFromFirebase } = require("../firebase/firebase");

/**
 * @param {import("http").Server} server - HTTP Server Object
 * @param {import("express").Application} app - Express Application from Express.js
 * @returns {{name: string, message: string} | undefined} error - Returns an error object if the socket server cannot be started. No return if there's no error.
 */
function socketListener(server, app) {
    if (server === undefined || app === undefined) {
        return {
            name: "socket-undefined-http-server",
            message:
                "Socket server cannot be started because the HTTP server parameter is corrupted or undefined.",
        };
    }

    const { logger } = require("../configs/config");
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
        },
    });

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

        socket.on("server-event", (element) => {
            socket.broadcast.emit("server-event", element);
            if (element.event === "server_reset") {
                if (!element.data.room_id) {
                    logger.info("Unsuccessful attempt to leave the room.");
                    return;
                }
                socket.leave(element.data.room_id);
                logger.info(`A user left the room ${element.data.room_id}: Server reset`);
            }
        });
    });

    logger.info("A socket server has been started...");
}

module.exports = { socketListener };
