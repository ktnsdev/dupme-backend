const dayjs = require("dayjs");
const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");
const { closeRoom } = require("../room/close-room");

const IDLE_STATUS = "idle";

async function reset(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    let users = await receiveFromFirebase(req, "users");

    if (users.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${users.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: users.error });
    }

    if (!users.data) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json(APIStatus.INTERNAL.FIREBASE_ERROR);
    }

    Object.keys(users.data).map((key, iteration) => {
        users.data[key].status = IDLE_STATUS;
    });

    let error = await addToFirebase(req, "users", "", users.data);
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    let rooms = {};

    error = await addToFirebase(req, "rooms", "", rooms);
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
        event: "server_reset",
        data: {
            timestamp: dayjs().toISOString(),
        },
    });

    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { reset };
