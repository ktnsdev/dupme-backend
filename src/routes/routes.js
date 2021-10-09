const uc = require("../controllers/user");
const rc = require("../controllers/room");
const { checkAlive } = require("../controllers/check-alive");
const { logger } = require("../configs/config");

const UserController = uc();
const RoomController = rc();

function Route(app) {
    if (typeof app !== "function") {
        logger.fatal("INTERNAL SERVER ERROR");
        process.exit(1);
    }

    function setup() {
        app.get("/check-alive", checkAlive); // Check Alive

        app.get("/user/:uuid/getName", UserController.getName); // Test API

        app.post("/online/", UserController.addUser); // API 1-1 Add User
    }

    return { setup };
}

module.exports = Route;
