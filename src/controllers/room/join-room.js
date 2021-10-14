//POST /room/:room_id/join?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");
const { socketListener } = require("../../socket/socket");

async function joinRoom(req, res) {
    if (req.query.uuid === undefined || req.query.uuid === null || req.query.uuid === "") {
        logger.error("400 Bad request from the client");
        logger.error("UUID not found.");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }
    if (
        req.params.room_id === undefined ||
        req.params.room_id === null ||
        req.params.room_id === ""
    ) {
        logger.error("400 Bad request from the client");
        logger.error("Room ID not found.");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }
    let receivedUserData = await receiveFromFirebase(req, "users", req.query.uuid);
    let receivedRoomData = await receiveFromFirebase(req, "rooms", req.params.room_id);
    if (!receivedUserData.data) {
        logger.error("User not found.");
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }

    if (!receivedRoomData.data) {
        logger.error("Room not found.");
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_FOUND);
    }
    if (receivedRoomData.data.status !== "idle") {
        logger.info("The Room is ongoing.");
        return res.status(500).json({ status: 500, message: "The room is ongoing." });
    }
    if (receivedRoomData.data.players.length == receivedRoomData.data.settings.player_limit) {
        logger.info("Room is Full.");
        return res.status(500).json({ status: 500, message: "Room is full." });
    }
    let playersdata = receivedRoomData.data.players;
    playersdata.push(req.query.uuid);
    let error = await addToFirebase(req, "rooms", req.params.room_id, playersdata, "players");
    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    const io = req.app.get("socket");
    io.to(req.params.room_id).emit("user_joined", {
        event: "user_joined",
        data: {
            uuid: req.query.uuid,
            timestamp: dayjs().toISOString(),
        },
    });

    return res.status(APIStatus.OK.status).json({
        status: APIStatus.OK.status,
        message: `Succesfully Join room ${req.params.room_id}.`,
    });
}

module.exports = { joinRoom };
