const { logger } = require("../../configs/config");
const { addToFirebase, receiveFromFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");
const dayjs = require("dayjs");

async function checkStatus(req, res) {
    if (req.params.uuid === undefined || req.params.uuid === null || req.params.uuid === "") {
        logger.error("400 Bad request from the client");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let data = await receiveFromFirebase(req, "users", req.params.uuid);
    if (data.error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: data.error });
    }

    if (!data.data) {
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }

    if (!data.data.username || !data.data.status || !data.data.logged_in) {
        return res
            .status(APIStatus.INTERNAL.USER_DATA_CORRUPTED.status)
            .json(APIStatus.INTERNAL.USER_DATA_CORRUPTED);
    }

    return res.status(APIStatus.OK.status).json({
        username: data.data.username,
        status: data.data.status,
        time_online: dayjs(dayjs()).diff(data.data.logged_in),
        logged_in: data.data.logged_in,
    });
}

module.exports = { checkStatus };
