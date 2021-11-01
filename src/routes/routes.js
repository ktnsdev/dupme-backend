const uc = require("../controllers/user");
const rc = require("../controllers/room");
const { checkAlive } = require("../controllers/check-alive");
const { logger } = require("../configs/config");
const { loginMiddleware, middleware } = require("../middleware/middleware");
const { login } = require("../controllers/auth/login");
const passport = require("passport");
const { playersCount } = require("../controllers/misc/players-count");

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
        app.use(passport.initialize());

        app.get("/check-alive", checkAlive); // Check Alive
        app.post("/login", loginMiddleware, login); // Login

        app.post("/user/:uuid/getName", UserController.getName); // Test API

        app.post("/create-user", middleware, UserController.addUser); // API 1-1 Add User
        app.get("/user/:uuid/status", middleware, UserController.checkStatus); // API 1-2 Check User Status
        app.post("/user/:uuid/logout", middleware, UserController.removeUser); // API 1-3 Remove User
        app.post("/user/:uuid/change", middleware, UserController.changeUsername); // API 1-4 Change Username
        app.get("/user/all", middleware, UserController.getAllPlayer); // API 1-5 Get All Player

        app.post("/create-room", middleware, RoomController.createRoom); // API 2-1 Create Room
        app.post("/room/:room_id/join", middleware, RoomController.joinRoom); // API 2-2 Join Room
        app.post("/room/:room_id/kick", middleware, RoomController.quitRoom); // API 2-3 Quit Room
        app.post("/room/:room_id/close", middleware, RoomController.closeRoom); //API 2-4 Close Room
        app.post("/room/:room_id/start", middleware, RoomController.startGame); //API 2-5 Start Game
        app.post("/room/:room_id/end", middleware, RoomController.endGame); //API 2-6 End Game
        app.get("/room/:room_id/status", middleware, RoomController.getRoomStatus); //API 2-7 Get Room Status
        app.post("/room/:room_id/settings", middleware, RoomController.roomSettings); //API 2-8 Room Settings
        app.post("/room/:room_id/make-host", middleware, RoomController.makeHost); // API 2-9 Make Host

        app.get("/misc/players-count", middleware, playersCount); // API 3-1 Get Players Count
    }

    return { setup };
}

module.exports = Route;
