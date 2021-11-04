//POST /room/:room_id/kick?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");
const { closeRoom } = require("./close-room");

async function quitRoom(req, res) {
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
        logger.error("User not found.");
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }
    let receivedRoomData = await receiveFromFirebase(req, "rooms", req.params.room_id);
    if (receivedRoomData.error) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }
    if (!receivedRoomData.data) {
        logger.error("Room not found.");
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_FOUND);
    }
    let error = await addToFirebase(req, "users", req.query.uuid, "idle", "status");
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }
    let playersdata = await removeUser(receivedRoomData.data.players, req.query.uuid);
    if (playersdata == "") {
        logger.info("The room is empty.");
        logger.info("Room deleted");
        await closeRoom(req, res);
        return;
    }
    error = await addToFirebase(req, "rooms", req.params.room_id, playersdata, "players");
    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }
    if (req.query.uuid == receivedRoomData.data.host) {
        error = await addToFirebase(req, "rooms", req.params.room_id, playersdata[0], "host");
        if (error) {
            return res
                .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
        }
        error = await addToFirebase(req, "users", playersdata[0], "in-room-as-host", "status");
        if (error) {
            logger.error(
                `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
            );
            return res
                .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
        }
    }

    const io = req.app.get("socket");
    io.sockets.emit(`${req.params.room_id}/room-event`, {
        event: "user_quit",
        data: {
            uuid: req.query.uuid,
            timestamp: dayjs().toISOString(),
        },
    });
    logger.info(`Succesfully delete user ${req.query.uuid} in room ${req.params.room_id}.`);
    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

function removeUser(allUser, remUser) {
    const index = allUser.indexOf(remUser);
    if (index != -1) {
        allUser.splice(index, 1);
    }
    return allUser;
}

module.exports = { quitRoom };
