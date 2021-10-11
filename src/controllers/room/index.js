const { createRoom } = require("./create-room.js");

function RoomController() {
    return {
        createRoom,
    };
}

module.exports = RoomController;
