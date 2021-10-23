const { createRoom } = require("./create-room.js");
const { startGame } = require("./start-game.js");
const { endGame } = require("./end-game.js");
const { joinRoom } = require("./join-room.js");
const { quitRoom } = require("./quit-room.js");
const { closeRoom } = require("./close-room.js");
const { getRoomStatus } = require("./get-room-status.js");
const { makeHost } = require("./make-host.js");
const { roomSettings } = require("./room-settings.js");

function RoomController() {
    return {
        createRoom,
        startGame,
        endGame,
        joinRoom,
        quitRoom,
        closeRoom,
        getRoomStatus,
        makeHost,
        roomSettings
    };
}

module.exports = RoomController;
