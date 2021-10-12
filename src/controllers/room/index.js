const { createRoom } = require("./create-room.js");
const { startRoom } = require("./start-room.js");

function RoomController() {
    return {
        createRoom,
        startRoom,
    };
}

module.exports = RoomController;
