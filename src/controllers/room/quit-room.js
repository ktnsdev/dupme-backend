//POST /room/:room_id/kick?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const {
    receiveFromFirebase,
    addToFirebase,
    removeFromFirebase,
} = require("../../firebase/firebase");
const { closeRoom } = require("./close-room");

async function quitRoom(req, res) {
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
    
    let playersdata = await removeUser(receivedRoomData.data.players, req.query.uuid);
    if (playersdata == "") {
        logger.info("The room is empty.");
        logger.info("Room deleted");
        await closeRoom(req, res);
        return
    }
    let error = await addToFirebase(req, "rooms", req.params.room_id, playersdata, "players");
    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    const io = req.app.get("socket");
    io.to(req.params.room_id).emit("room-event", {
        event: "user_quit",
        data: {
            uuid: req.query.uuid,
            timestamp: dayjs().toISOString(),
        },
    });

    return res.status(APIStatus.OK.status).json({
        status: APIStatus.OK.status,
        message: `Succesfully delete user ${req.query.uuid} in room ${req.params.room_id}.`,
    });
}

function removeUser(allUser, remUser) {
    const index = allUser.indexOf(remUser);
    if (index != -1) {
        allUser.splice(index, 1);
    }
    return allUser;
}

module.exports = { quitRoom };
