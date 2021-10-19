//POST /room/:room_id/close

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { removeFromFirebase } = require("../../firebase/firebase");

async function closeRoom(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);
    if (
        req.params.room_id === undefined ||
        req.params.room_id === null ||
        req.params.room_id === ""
    ) {
        logger.error("400 Bad request from the client");
        logger.error("Room ID not found.");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
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
