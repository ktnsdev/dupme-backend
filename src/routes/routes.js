const { checkAlive } = require("../controllers/check-alive");
const uc = require("../controllers/user");
const rc = require("../controllers/room");
const UserController = uc();
const RoomController = rc();

function Route(app) {
    function setup() {
        app.get("/check-alive", checkAlive); // Check Alive

        app.get("/user/:uuid/getName", UserController.getName); // Test API

        app.get("/create-room", RoomController.createRoom); //CreateRoom
    }

    return { setup };
}

module.exports = Route;
