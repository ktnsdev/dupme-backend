const { createRoom } = require("./create-room.js");
const { startGame } = require("./start-game.js");
const { endGame } = require("./end-game.js");
const { joinRoom } = require("./join-room.js");

function RoomController() {
    return {
        createRoom,
        startGame,
        endGame,
        joinRoom,
    };
}

module.exports = RoomController;
