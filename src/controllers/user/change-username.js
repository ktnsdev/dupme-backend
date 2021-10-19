const { logger } = require("../../configs/config");
const { addToFirebase, receiveFromFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");
const dayjs = require("dayjs");

async function changeUsername(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.params.uuid === undefined ||
        req.params.uuid === null ||
        req.params.uuid === "" ||
        req.query.to === undefined ||
        req.query.to === null ||
        req.query.to === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let data = await receiveFromFirebase(req, "users", req.params.uuid, "username");
    if (data.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${data.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: data.error });
    }

    if (!data.data) {
        logger.error(APIStatus.INTERNAL.UUID_NOT_FOUND.message);
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }

    if (data.data === req.query.to) {
        logger.error(APIStatus.INTERNAL.USERNAME_IS_THE_SAME.message);
        return req
            .status(APIStatus.INTERNAL.USERNAME_IS_THE_SAME.status)
            .json(APIStatus.INTERNAL.USERNAME_IS_THE_SAME);
    }

    let error = await addToFirebase(req, "users", req.params.uuid, "username");
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${data.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: data.error });
    }

    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { changeUsername };
