const uc = require("../controllers/user");
const rc = require("../controllers/room");
const { checkAlive } = require("../controllers/check-alive");
const { logger } = require("../configs/config");

const UserController = uc();
const RoomController = rc();

/**
 * @param {import("express").Application} app - Express Application from Express.js
 */
function Route(app) {
    if (app === undefined) {
        logger.error(
            "FATAL: Router cannot be started because Express parameter is corrupted or undefined",
        );
        process.exit(1);
    }

    function setup() {
        const bodyParser = require("body-parser");

        app.use(
            bodyParser.urlencoded({
                extended: false,
            }),
        );

        app.get("/check-alive", checkAlive); // Check Alive

        app.post("/user/:uuid/getName", UserController.getName); // Test API

        app.post("/online/", UserController.addUser); // API 1-1 Add User
        app.get("/user/:uuid/status", UserController.checkStatus); // API 1-2 Check User Status

        app.post("/create-room", RoomController.createRoom); // API 2-1 Create Room
        app.post("/room/:room_id/join", RoomController.joinRoom); // API 2-2 Join Room
        app.post("/room/:room_id/start", RoomController.startGame); //API 2-5 Start Game
        app.post("/room/:room_id/end", RoomController.endGame); //API 2-6 End Game
        app.get("/room/:room_id/status", RoomController.getRoomStatus); //API 2-7 Get Room Status
    }

    return { setup };
}

module.exports = Route;
