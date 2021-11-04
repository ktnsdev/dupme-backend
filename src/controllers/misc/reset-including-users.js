const dayjs = require("dayjs");
const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");
const { closeRoom } = require("../room/close-room");

const IDLE_STATUS = "idle";

async function resetIncludingUsers(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    let users = { 42: { username: "admin", status: "admin", logged_in: dayjs().toISOString() } };
    let rooms = {};
    let players_count = 1;

    let error = await addToFirebase(req, "rooms", "", rooms);
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    error = await addToFirebase(req, "users", "", users);
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    error = await addToFirebase(req, "misc", "players_count", players_count);
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    const io = req.app.get("socket");
    io.emit("server-event", {
        event: "server_reset_including_users",
        data: {
            timestamp: dayjs().toISOString(),
        },
    });

    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { resetIncludingUsers };
