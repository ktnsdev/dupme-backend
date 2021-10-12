const { createRoom } = require("./create-room.js");
const { startRoom } = require("./start-room.js");
const { joinRoom } = require("./join-room.js");

function RoomController() {
    return {
        createRoom,
        startRoom,
        joinRoom,
    };
}

module.exports = RoomController;
