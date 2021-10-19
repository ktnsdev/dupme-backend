//POST /room/:room_id/join?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

async function joinRoom(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.query.uuid === undefined ||
        req.query.uuid === null ||
        req.query.uuid === "" ||
        req.params.room_id === undefined ||
        req.params.room_id === null ||
        req.params.room_id === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let receivedUserData = await receiveFromFirebase(req, "users", req.query.uuid);

    if (receivedUserData.error) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    if (!receivedUserData.data) {
        logger.error(APIStatus.INTERNAL.UUID_NOT_FOUND.message);
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }
    if (receivedUserData.data.status !== "idle") {
        logger.error(APIStatus.INTERNAL.PLAYER_NOT_IDLE.message);
        return res
            .status(APIStatus.INTERNAL.PLAYER_NOT_IDLE.status)
            .json(APIStatus.INTERNAL.PLAYER_NOT_IDLE);
    }

    let receivedRoomData = await receiveFromFirebase(req, "rooms", req.params.room_id);

    if (receivedRoomData.error) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    if (!receivedRoomData.data) {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_FOUND.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_FOUND);
    }

    if (receivedRoomData.data.status !== "idle") {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_IDLE.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_IDLE.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_IDLE);
    }

    if (receivedRoomData.data.players.length == receivedRoomData.data.settings.player_limit) {
        logger.error(APIStatus.INTERNAL.ROOM_IS_FULL.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_IS_FULL.status)
            .json(APIStatus.INTERNAL.ROOM_IS_FULL);
    }

    let playersdata = receivedRoomData.data.players;

    for (let i = 0; i < playersdata.length; i++) {
        if (playersdata[i] == req.query.uuid) {
            logger.error(APIStatus.INTERNAL.PLAYER_ALREADY_IN.message);
            return res.status(500).json({
                status: APIStatus.INTERNAL.PLAYER_ALREADY_IN.status,
                message: APIStatus.INTERNAL.PLAYER_ALREADY_IN,
            });
        }
    }
    playersdata.push(req.query.uuid);

    let error = await addToFirebase(req, "rooms", req.params.room_id, playersdata, "players");
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }
    let error2 = await addToFirebase(req, "users", req.query.uuid, "in-room", "status");
    if (error2) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    const io = req.app.get("socket");
    io.to(req.params.room_id).emit("room-event", {
        event: "user_joined",
        data: {
            uuid: req.query.uuid,
            timestamp: dayjs().toISOString(),
        },
    });

    logger.info(`The user ${req.query.uuid} has joined ${req.params.room_id}.`);
    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { joinRoom };
