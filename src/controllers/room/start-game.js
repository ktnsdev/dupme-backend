const dayjs = require("dayjs");
const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

const IN_GAME_STATUS = "in-game";

async function startGame(req, res) {
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

    let dataFromFirebase = await receiveFromFirebase(req, "rooms", roomId);

    if (dataFromFirebase.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        logger.error(APIStatus.INTERNAL.ROOM_NOT_FOUND.message);

        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json({ response: APIStatus.INTERNAL.ROOM_NOT_FOUND, error: dataFromFirebase.error });
    }

    if (!dataFromFirebase.data || !dataFromFirebase.data.players || !dataFromFirebase.data.host) {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_FOUND.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_FOUND);
    }

    if (dataFromFirebase.data.status !== "idle") {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_IDLE.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_IDLE.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_IDLE);
    }

    let startPlayer =
        dataFromFirebase.data.players[
            Math.floor(Math.random() * dataFromFirebase.data.players.length)
        ];

    let error = await addToFirebase(req, "rooms", roomId, IN_GAME_STATUS, "/status");

    if (error) {
        logger.error(
            `At writing to Firebase: ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    for (let i = 0; i < dataFromFirebase.data.players.length; i++) {
        error = await addToFirebase(
            req,
            "users",
            dataFromFirebase.data.players[i],
            IN_GAME_STATUS,
            "/status",
        );

        if (error) {
            logger.error(
                `At writing to Firebase: ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
            );
            return res
                .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
        }
    }

    const io = req.app.get("socket");
    io.sockets.emit(`${req.params.room_id}/room-event`, {
        event: "start_game",
        data: { message: "start_game", starts_with: startPlayer, timestamp: dayjs().toISOString() },
    });

    logger.info(`Room ID ${roomId} has started its game. ${startPlayer} will start.`);
    return res.status(APIStatus.OK.status).json({
        starts_with: startPlayer,
    });
}

module.exports = { startGame };
