const { createRoom } = require("./create-room.js");
const { startGame } = require("./start-game.js");
const { endGame } = require("./end-game.js");
const { joinRoom } = require("./join-room.js");
const { getRoomStatus } = require("./get-room-status.js");

function RoomController() {
    return {
        createRoom,
        startGame,
        endGame,
        joinRoom,
        getRoomStatus
    };
}

module.exports = RoomController;
