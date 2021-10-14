const { createRoom } = require("./create-room.js");
const { joinRoom } = require("./join-room.js");
const { quitRoom } = require("./quit-room.js");
const { closeRoom } = require("./close-room.js");
function RoomController() {
    return {
        createRoom,
        joinRoom,
        quitRoom,
        closeRoom,
    };
}

module.exports = RoomController;
