const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const { receiveFromFirebase } = require("../../firebase/firebase");

async function getRoomStatus(req, res) {
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

    if (!dataFromFirebase.data) {
        logger.error(APIStatus.INTERNAL.ROOM_NOT_FOUND.message);
        return res
            .status(APIStatus.INTERNAL.ROOM_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.ROOM_NOT_FOUND);
    }

    return res.status(APIStatus.OK.status).json(dataFromFirebase.data);
}

module.exports = { getRoomStatus };
