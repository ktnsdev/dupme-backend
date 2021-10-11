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
        app.get("/check-alive", checkAlive); // Check Alive

        app.get("/user/:uuid/getName", UserController.getName); // Test API

        app.post("/create-room", RoomController.createRoom); // API 2-1 Create Room
    }

    return { setup };
}

module.exports = Route;
