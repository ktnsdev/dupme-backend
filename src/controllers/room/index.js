const { createRoom } = require("./create-room.js");
const { joinRoom } = require("./join-room.js");

function RoomController() {
    return {
        createRoom,
        joinRoom,
    };
}

module.exports = RoomController;
