const { createRoom } = require("./createroom.js");

function RoomController() {
    return {
        createRoom,
    };
}

module.exports = RoomController;
