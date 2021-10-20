const dayjs = require("dayjs");
const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

const IDLE_STATUS = "idle";

async function endGame(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.params.room_id === undefined ||
        req.params.room_id === null ||
        req.params.room_id === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let roomId = req.params.room_id;

    let dataFromFirebase = await receiveFromFirebase(req, "rooms", roomId, "/status");

    if (dataFromFirebase.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        logger.error(APIStatus.INTERNAL.ROOM_NOT_FOUND.message);

        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json({ response: APIStatus.INTERNAL.ROOM_NOT_FOUND, error: dataFromFirebase.error });
    }

    if (!dataFromFirebase.data) {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_FOUND.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_FOUND);
    }

    if (dataFromFirebase.data !== "in-game") {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_IN_GAME.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_IN_GAME.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_IN_GAME);
    }

    const io = req.app.get("socket");
    await io.to(roomId).emit("room-event", {
        event: "end_game",
        data: { message: "end_game", timestamp: dayjs().toISOString() },
    });

    let error = await addToFirebase(req, "rooms", roomId, IDLE_STATUS, "/status");

    if (error) {
        logger.error(
            `At writing to Firebase: ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    logger.info(`Room ID ${roomId} has ended its game.`);
    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { endGame };
