const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

async function roomSettings(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.params.room_id === undefined ||
        req.params.room_id === null ||
        req.params.room_id === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    if (req.query.difficulty && req.query.difficulty !== "0" && req.query.difficulty !== "1") {
        logger.error(APIStatus.BAD_REQUEST.message + ": Cannot parse difficulty");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    if (req.query.turns && isNaN(req.query.turns)) {
        logger.error(APIStatus.BAD_REQUEST.message + ": Cannot parse turns");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    if (req.query.player_limit && isNaN(req.query.player_limit)) {
        logger.error(APIStatus.BAD_REQUEST.message + ": Cannot parse player limit");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    if (req.query.levels && isNaN(req.query.levels)) {
        logger.error(APIStatus.BAD_REQUEST.message + ": Cannot parse levels");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let receivedRoomData = await receiveFromFirebase(req, "rooms", req.params.room_id);

    if (receivedRoomData.error) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    if (
        !receivedRoomData.data ||
        !receivedRoomData.data.settings ||
        !receivedRoomData.data.status
    ) {
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

    let newSettings = receivedRoomData.data.settings;

    if (req.query.difficulty) newSettings.difficulty = parseInt(req.query.difficulty);
    if (req.query.turns) newSettings.turns = parseInt(req.query.turns);
    if (req.query.levels) newSettings.levels = parseInt(req.query.levels);
    if (req.query.player_limit) newSettings.player_limit = parseInt(req.query.player_limit);

    let error = await addToFirebase(req, "rooms", req.params.room_id, newSettings, "/settings");

    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { roomSettings };
