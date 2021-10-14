const { createRoom } = require("./create-room.js");
const { startGame } = require("./start-game.js");
const { joinRoom } = require("./join-room.js");

function RoomController() {
    return {
        createRoom,
        startGame,
        joinRoom,
    };
}

module.exports = RoomController;
