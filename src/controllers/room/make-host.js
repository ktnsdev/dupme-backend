//POST /room/:room_id/make-host?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

async function makeHost(req, res) {
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

    if (req.query.uuid === receivedRoomData.data.host) {
        logger.error(APIStatus.INTERNAL.PLAYER_ALREADY_HOST.message);
        return res
            .status(APIStatus.INTERNAL.PLAYER_ALREADY_HOST.status)
            .json(APIStatus.INTERNAL.PLAYER_ALREADY_HOST);
    }

    let playersdata = receivedRoomData.data.players;
    for (let i = 0; i < playersdata.length; i++) {
        if (playersdata[i] === req.query.uuid) {
            let error = await addToFirebase(
                req,
                "rooms",
                req.params.room_id,
                req.query.uuid,
                "host",
            );

            if (error) {
                logger.error(
                    `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
                );
                return res
                    .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                    .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
            }

            error = await addToFirebase(req, "users", req.query.uuid, "in-room-as-host", "status");
            if (error) {
                logger.error(
                    `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
                );
                return res
                    .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                    .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
            }

            const io = req.app.get("socket");
            io.to(req.params.room_id).emit("room-event", {
                event: "make_host",
                data: {
                    uuid: req.query.uuid,
                    timestamp: dayjs().toISOString(),
                },
            });

            logger.info(`The host in room ${req.params.room_id} is now ${req.query.uuid}.`);
            return res.status(APIStatus.OK.status).json({
                status: APIStatus.OK.status,
                message: APIStatus.OK,
            });
        }
    }

    logger.error(APIStatus.INTERNAL.PLAYER_NOT_IN_ROOM.message);
    return res.status(APIStatus.INTERNAL.PLAYER_NOT_IN_ROOM.status).json({
        status: APIStatus.INTERNAL.PLAYER_NOT_IN_ROOM.status,
        message: APIStatus.INTERNAL.PLAYER_NOT_IN_ROOM,
    });
}
module.exports = { makeHost };
