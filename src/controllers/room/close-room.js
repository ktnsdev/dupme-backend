//POST /room/:room_id/close

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const {
    receiveFromFirebase,
    addToFirebase,
    removeFromFirebase,
} = require("../../firebase/firebase");

async function closeRoom(req, res) {
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
    return res.status(APIStatus.OK.status).json({
        status: APIStatus.OK.status,
        message: `Room ${req.params.room_id} closed successfully.`,
    });
}

module.exports = { closeRoom };
