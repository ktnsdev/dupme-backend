//POST /room/:room_id/close

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const {
    removeFromFirebase,
    receiveFromFirebase,
    addToFirebase,
} = require("../../firebase/firebase");

async function closeRoom(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);
    if (
        req.params.room_id === undefined ||
        req.params.room_id === null ||
        req.params.room_id === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        logger.error("Room ID not found.");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
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
    let playersdata = receivedRoomData.data.players;
    for (let i = 0; i < playersdata.length; i++) {
        let error = await addToFirebase(req, "users", playersdata[i], "idle", "status");
        if (error) {
            logger.error(
                `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
            );
            return res
                .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
        }
    }

    let error = await removeFromFirebase(req, "rooms", req.params.room_id);
    if (error) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    const io = req.app.get("socket");
    io.to(req.params.room_id).emit("room-event", {
        event: "room_closed",
        data: {
            uuid: req.query.uuid,
            timestamp: dayjs().toISOString(),
        },
    });
    logger.info(`Room ${req.params.room_id} closed successfully.`);
    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { closeRoom };
